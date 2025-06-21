// /app/api/scrape/route.ts

import { Redis } from "@upstash/redis";
import axios from "axios";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/service/supabase-server";
import { siteConfigs, SiteConfig } from "@/lib/meridianconfig";

// --- Environment Variable Validation ---
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!redisUrl ||!redisToken) {
  throw new Error("Missing Upstash Redis environment variables.");
}
const redis = new Redis({ url: redisUrl, token: redisToken });

// --- Constants ---
const DEDUPLICATION_SET_KEY = "meridian:article_url_hashes";
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay to be a good web citizen
const MAX_PAGINATION_DEPTH = 5; // Limit crawl depth to prevent infinite loops
const REQUEST_TIMEOUT = 10000; // 10-second timeout for requests
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 MeridianBot/1.0';

// --- Utility Functions ---
const getUrlHash = (url: string): string => {
  return createHash("sha256").update(url).digest("hex");
};

const normalizeUrl = (href: string, baseUrl: string): string | null => {
  try {
    return new URL(href, baseUrl).toString();
  } catch (error) {
    return null;
  }
};

const parseDate = (dateString: string | undefined): string => {
    if (!dateString) return new Date().toISOString();
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Attempt to parse non-standard formats if necessary
            // For now, fall back to current date
            return new Date().toISOString();
        }
        return date.toISOString();
    } catch (error) {
        return new Date().toISOString();
    }
};

// --- Core Scraping Logic ---

/**
 * Recursively scrapes pages to discover article URLs.
 * @param config - The configuration for the target site.
 * @param pageUrl - The URL of the page to scrape.
 * @param articleUrls - A Set to store discovered article URLs.
 * @param visitedPages - A Set to prevent re-scraping the same page.
 * @param depth - The current pagination depth.
 */
async function crawlForArticleLinks(
  config: SiteConfig,
  pageUrl: string,
  articleUrls: Set<string>,
  visitedPages: Set<string>,
  depth: number
): Promise<void> {
  if (depth >= MAX_PAGINATION_DEPTH |
| visitedPages.has(pageUrl)) {
    return;
  }
  visitedPages.add(pageUrl);
  console.log(`[${config.sourceName}] Crawling page (Depth ${depth}): ${pageUrl}`);

  try {
    const { data: pageHtml } = await axios.get(pageUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: REQUEST_TIMEOUT,
    });
    const $ = cheerio.load(pageHtml);

    // Discover article links on the current page
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      const fullUrl = normalizeUrl(href, config.baseUrl);
      if (fullUrl && config.discovery.urlPattern.test(fullUrl)) {
        articleUrls.add(fullUrl);
      }
    });

    // Handle pagination
    if (config.pagination.type === 'next_button' && config.pagination.selector) {
      const nextPageLink = $(config.pagination.selector).first().attr('href');
      if (nextPageLink) {
        const nextPageUrl = normalizeUrl(nextPageLink, config.baseUrl);
        if (nextPageUrl) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
          await crawlForArticleLinks(config, nextPageUrl, articleUrls, visitedPages, depth + 1);
        }
      }
    }
    // Note: 'infinite_scroll' would require a dynamic fetcher (e.g., Puppeteer)
    // and is not implemented in this static version.

  } catch (error) {
    console.error(`[${config.sourceName}] Failed to crawl page ${pageUrl}:`, error);
  }
}

/**
 * Fetches, parses, and stores a single article.
 * @param url - The URL of the article to process.
 * @param config - The configuration for the target site.
 */
async function processArticle(url: string, config: SiteConfig): Promise<boolean> {
  const urlHash = getUrlHash(url);

  const isMember = await redis.sismember(DEDUPLICATION_SET_KEY, urlHash);
  if (isMember) {
    console.log(`[${config.sourceName}] Skipping already processed article: ${url}`);
    return false;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    
    const { data: articleHtml } = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: REQUEST_TIMEOUT,
    });
    const $ = cheerio.load(articleHtml);

    // --- Extraction ---
    const title = $(config.extraction.titleSelector).first().text().trim();
    const contentElement = $(config.extraction.contentSelector).first();

    // --- Cleaning ---
    if (config.extraction.elementsToRemove) {
      config.extraction.elementsToRemove.forEach(selector => {
        contentElement.find(selector).remove();
      });
    }
    let content = contentElement.text().trim().replace(/\s+/g, ' ');

    // --- Date Parsing ---
    const dateString = $('meta[property="article:published_time"]').attr('content') |
| $(config.extraction.dateSelector).attr('datetime') |
| $(config.extraction.dateSelector).text();
    const published_at = parseDate(dateString);

    // --- Validation ---
    if (!title |
| title.length < 5 ||!content |
| content.length < 50) {
      console.warn(`[${config.sourceName}] Insufficient content from: ${url}`);
      return false;
    }

    // --- Database Insertion ---
    const { error: insertError } = await supabase.from("articles").insert({
      source_id: config.sourceId,
      url: url,
      url_hash: urlHash,
      title: title,
      full_text_content: content,
      published_at: published_at,
    });

    if (insertError) throw insertError;

    await redis.sadd(DEDUPLICATION_SET_KEY, urlHash);
    console.log(`[${config.sourceName}] Successfully processed and stored: ${title}`);
    return true;

  } catch (error: unknown) {
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      console.warn(`[${config.sourceName}] HTTP Error ${status} for article ${url}.`);
    } else {
      console.error(`[${config.sourceName}] Failed to process article ${url}:`, (error as Error).message);
    }
    return false;
  }
}


// --- API Route Handler ---
export async function POST(req: Request) {
  const { sourceId } = await req.json();

  if (!sourceId) {
    return NextResponse.json({ error: "Missing sourceId" }, { status: 400 });
  }

  const config = siteConfigs.find(c => c.sourceId === sourceId);

  if (!config) {
    return NextResponse.json({ error: `Configuration for sourceId '${sourceId}' not found.` }, { status: 404 });
  }
  
  // Guard against trying to run dynamic scrapes with this static-only implementation
  if (config.fetchStrategy === 'dynamic') {
      console.warn(`[${config.sourceName}] Skipping scrape: This source requires a dynamic fetch strategy (headless browser) which is not implemented in this version.`);
      return NextResponse.json({ message: `Scraping skipped for ${config.sourceName} (requires dynamic fetcher).` });
  }

  console.log(`[${config.sourceName}] Starting scrape job.`);

  try {
    const articleUrls = new Set<string>();
    const visitedPages = new Set<string>();
    
    // Crawl all start URLs for the source
    for (const startUrl of config.discovery.startUrls) {
        await crawlForArticleLinks(config, startUrl, articleUrls, visitedPages, 0);
    }

    console.log(`[${config.sourceName}] Discovered ${articleUrls.size} potential articles.`);
    let processedCount = 0;

    for (const url of Array.from(articleUrls)) {
      if (await processArticle(url, config)) {
        processedCount++;
      }
    }

    const summary = `Scraping completed for ${config.sourceName}. Processed ${processedCount} of ${articleUrls.size} discovered articles.`;
    console.log(`[${config.sourceName}] ${summary}`);
    return NextResponse.json({ message: summary });

  } catch (error: unknown) {
    console.error(`[${config.sourceName}] Critical error in scrape handler:`, error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: (error as Error).message,
    }, { status: 500 });
  }
}

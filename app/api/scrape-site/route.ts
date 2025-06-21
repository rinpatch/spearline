import { Redis } from "@upstash/redis";
import axios from "axios";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL!;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN!;

const redis = new Redis({ url: redisUrl, token: redisToken });

const DEDUPLICATION_SET_KEY = "meridian:article_url_hashes";
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second
const MAX_PAGINATION_DEPTH = 5; // Maximum depth for pagination

/**
 * Generates a SHA-256 hash for a given URL for consistent deduplication.
 * @param url The URL to hash.
 * @returns The SHA-256 hash as a hex string.
 */
const getUrlHash = (url: string): string => {
  return createHash("sha256").update(url).digest("hex");
};

/**
 * Scrapes a page for article links and recursively scrapes next pages.
 * @param sourceName The name of the source.
 * @param pageUrl The URL of the page to scrape.
 * @param headers The headers to use for the request.
 * @param titleSelector The CSS selector for the article title.
 * @param contentSelector The CSS selector for the article content.
 * @param articleUrls The set of article URLs found so far.
 * @param visitedPages The set of pages that have already been visited.
 * @param depth The current depth of the pagination.
 */
async function scrapePage(
  sourceName: string,
  pageUrl: string,
  headers: Record<string, string>,
  titleSelector: string,
  contentSelector: string,
  articleUrls: Set<string>,
  visitedPages: Set<string>,
  depth: number
): Promise<void> {
  if (depth > MAX_PAGINATION_DEPTH || visitedPages.has(pageUrl)) {
    return;
  }
  visitedPages.add(pageUrl);

  try {
    const { data: pageHtml } = await axios.get(pageUrl, { headers });
    const $ = cheerio.load(pageHtml);

    // Scrape article links
    $("a[href]").each((_, el) => {
      let href = $(el).attr("href");
      if (href && href.startsWith("/")) {
        href = new URL(href, pageUrl).toString();
      }
      if (href && href.startsWith(pageUrl) && href.includes("news")) {
        articleUrls.add(href);
      }
    });

    // Check for next page
    const nextPageLink = $('a.next').attr('href') || $('a.page-next').attr('href');
    if (nextPageLink) {
      const nextPageUrl = new URL(nextPageLink, pageUrl).toString();
      console.log(`[${sourceName}] Found next page: ${nextPageUrl}`);
      await scrapePage(sourceName, nextPageUrl, headers, titleSelector, contentSelector, articleUrls, visitedPages, depth + 1);
    }
  } catch (error) {
    console.error(`[${sourceName}] Failed to scrape page ${pageUrl}:`, error);
  }
}

/**
 * API Endpoint: /api/scrape-site
 * Triggered by a QStash message for a single news source.
 * It performs the following steps:
 * 1. Scrapes the source's homepage for article links.
 * 2. For each link, checks Redis to see if it has been processed before.
 * 3. If new, scrapes the full article content.
 * 4. Inserts the article into the Supabase database.
 */
export async function POST(req: Request) {
  const { sourceId, sourceName, baseUrl, titleSelector, contentSelector } = await req.json();

  if (!titleSelector || !contentSelector) {
    return NextResponse.json(
      { error: "Missing titleSelector or contentSelector" },
      { status: 400 }
    );
  }

  console.log(`[${sourceName}] Starting scrape for ${baseUrl}`);

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    
    const articleUrls = new Set<string>();
    const visitedPages = new Set<string>();
    
    // Start scraping from the base URL with depth 0
    await scrapePage(sourceName, baseUrl, headers, titleSelector, contentSelector, articleUrls, visitedPages, 0);

    console.log(`[${sourceName}] Found ${articleUrls.size} potential articles.`);
    let processedCount = 0;

    for (const url of Array.from(articleUrls)) {
      const urlHash = getUrlHash(url);

      const isMember = await redis.sismember(DEDUPLICATION_SET_KEY, urlHash);
      if (isMember) {
        console.log(`[${sourceName}] Skipping already processed article: ${url}`);
        continue;
      }

      try {
        // Add delay to avoid being blocked
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        
        const { data: articleHtml } = await axios.get(url, { headers });
        const $$ = cheerio.load(articleHtml);
        const title = $$(titleSelector).first().text().trim();
        let content = $$(contentSelector).text().trim();

        // Clean content
        content = content
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/\[.*?\]/g, '') // Remove square brackets
          .trim();

        // Validate content
        if (!title || title.length < 5 || !content || content.length < 50) {
          console.warn(`[${sourceName}] Insufficient content from: ${url}`);
          continue;
        }

        // Parse publication date
        const dateString = $$('meta[property="article:published_time"]').attr('content') || 
                          $$('time').attr('datetime');
        const published_at = dateString ? new Date(dateString).toISOString() : new Date().toISOString();

        const { error: insertError } = await supabase
          .from("articles")
          .insert({
            source_id: sourceId,
            url: url,
            url_hash: urlHash,
            title: title,
            full_text_content: content,
            published_at: published_at,
          });

        if (insertError) throw insertError;

        await redis.sadd(DEDUPLICATION_SET_KEY, urlHash);
        processedCount++;
        console.log(`[${sourceName}] Successfully processed and stored: ${title}`);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            console.warn(`[${sourceName}] Article not found: ${url}`);
          } else if (axiosError.response?.status === 403) {
            console.warn(`[${sourceName}] Access forbidden: ${url}`);
          } else {
            console.error(`[${sourceName}] Failed to process article ${url}:`, error);
          }
        } else {
          console.error(`[${sourceName}] Failed to process article ${url}:`, error);
        }
      }
    }

    console.log(`[${sourceName}] Processed ${processedCount}/${articleUrls.size} articles`);
    return NextResponse.json({ message: `Scraping completed for ${sourceName}. Processed ${processedCount} articles.` });
  } catch (error: unknown) {
    console.error(`[${sourceName}] Major error in scrape-site handler:`, error);

    return NextResponse.json({
      error: "Internal Server Error",
      details: (error as Error).message,
    }, { status: 500 });
  }
}
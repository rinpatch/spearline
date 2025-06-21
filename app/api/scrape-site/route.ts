import { Redis } from "@upstash/redis";
import axios from "axios";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "@/lib/service/supabase-server"; // Assuming shared Supabase client
import { siteConfigs, SiteConfig } from "@/lib/meridian.config";

// --- Environment Variable Validation ---
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!redisUrl ||!redisToken) {
  throw new Error("Missing Upstash Redis environment variables for the worker.");
}
const redis = new Redis({ url: redisUrl, token: redisToken });

// --- Constants ---
const DEDUPLICATION_SET_KEY = "meridian:article_url_hashes";
const DELAY_BETWEEN_REQUESTS = 1000;
const MAX_PAGINATION_DEPTH = 5;
const REQUEST_TIMEOUT = 10000;
const USER_AGENT = 'Mozilla/5.0 (compatible; MeridianBot/1.0; +https://example.com/bot)';

// --- Utility Functions ---
const getUrlHash = (url: string): string => createHash("sha256").update(url).digest("hex");
const normalizeUrl = (href: string, baseUrl: string): string | null => {
  try { return new URL(href, baseUrl).toString(); } catch { return null; }
};
const parseDate = (dateString: string | undefined): string => {
  if (!dateString) return new Date().toISOString();
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// --- Core Scraping Logic ---
async function crawlForArticleLinks(config: SiteConfig, pageUrl: string, articleUrls: Set<string>, visitedPages: Set<string>, depth: number): Promise<void> {
  if (depth >= MAX_PAGINATION_DEPTH |
| visitedPages.has(pageUrl)) return;
  visitedPages.add(pageUrl);
  console.log(`[${config.sourceName}] Crawling (Depth ${depth}): ${pageUrl}`);

  try {
    const { data: pageHtml } = await axios.get(pageUrl, { headers: { 'User-Agent': USER_AGENT }, timeout: REQUEST_TIMEOUT });
    const $ = cheerio.load(pageHtml);

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const fullUrl = normalizeUrl(href, config.baseUrl);
        if (fullUrl && config.discovery.urlPattern.test(fullUrl)) {
          articleUrls.add(fullUrl);
        }
      }
    });

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
  } catch (error) {
    console.error(`[${config.sourceName}] Failed to crawl page ${pageUrl}:`, error);
  }
}

async function processArticle(url: string, config: SiteConfig): Promise<boolean> {
  const urlHash = getUrlHash(url);
  if (await redis.sismember(DEDUPLICATION_SET_KEY, urlHash)) {
    console.log(`[${config.sourceName}] Skipping duplicate: ${url}`);
    return false;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    const { data: articleHtml } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: REQUEST_TIMEOUT });
    const $ = cheerio.load(articleHtml);

    const title = $(config.extraction.titleSelector).first().text().trim();
    const contentElement = $(config.extraction.contentSelector).first();

    if (config.extraction.elementsToRemove) {
      config.extraction.elementsToRemove.forEach(selector => contentElement.find(selector).remove());
    }
    let content = contentElement.text().trim().replace(/\s+/g, ' ');

    const dateString = $('meta[property="article:published_time"]').attr('content') |
| $(config.extraction.dateSelector).attr('datetime') |
| $(config.extraction.dateSelector).text();
    const published_at = parseDate(dateString);

    if (!title |
| title.length < 10 ||!content |
| content.length < 50) {
      console.warn(`[${config.sourceName}] Insufficient content: ${url}`);
      return false;
    }

    const { error } = await supabase.from("articles").insert({
      source_id: config.sourceId,
      url,
      url_hash: urlHash,
      title,
      full_text_content: content,
      published_at,
    });

    if (error) throw error;

    await redis.sadd(DEDUPLICATION_SET_KEY, urlHash);
    console.log(`[${config.sourceName}] Stored: ${title}`);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.warn(`[${config.sourceName}] HTTP ${error.response.status} for article: ${url}`);
    } else {
      console.error(`[${config.sourceName}] Failed to process article ${url}:`, (error as Error).message);
    }
    return false;
  }
}

/**
 * API Endpoint: /api/scrape-site
 * Triggered by a QStash message for a single news source.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method!== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { sourceId } = req.body;
    if (!sourceId) {
        return res.status(400).json({ error: "Missing sourceId in request body" });
    }

    const config = siteConfigs.find(c => c.sourceId === sourceId);
    if (!config) {
        return res.status(404).json({ error: `Configuration for sourceId '${sourceId}' not found.` });
    }

    if (config.fetchStrategy === 'dynamic') {
        const message = `Scraping skipped for ${config.sourceName} (requires dynamic fetcher).`;
        console.warn(`[${config.sourceName}] ${message}`);
        return res.status(200).json({ message });
    }

    console.log(`[${config.sourceName}] Starting scrape job.`);
    try {
        const articleUrls = new Set<string>();
        const visitedPages = new Set<string>();

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
        res.status(200).json({ message: summary });

    } catch (error) {
        console.error(`[${config.sourceName}] Critical error in scrape handler:`, error);
        res.status(500).json({ error: "Internal Server Error", details: (error as Error).message });
    }
}

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

import { Redis } from '@upstash/redis';

import axios from 'axios';

import * as cheerio from 'cheerio';

import { createHash } from 'crypto';

import { NextApiRequest, NextApiResponse } from 'next';

  

// --- Configuration ---

const supabaseUrl = process.env.SUPABASE_URL!;

const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const redisUrl = process.env.UPSTASH_REDIS_URL!;

const redisToken = process.env.UPSTASH_REDIS_TOKEN!;

const openRouterKey = process.env.OPENROUTER_API_KEY!;

  

// --- Initialize Clients ---

const supabase = createClient(supabaseUrl, supabaseKey);

const redis = new Redis({ url: redisUrl, token: redisToken });

const openrouter = new OpenAI({

    baseURL: "https://openrouter.ai/api/v1",

    apiKey: openRouterKey,

});

  

// --- Constants ---

const EMBEDDING_MODEL = 'text-embedding-3-small'; // Cost-effective and powerful

const ANALYSIS_MODEL = 'deepseek/deepseek-chat'; // DeepSeek for analysis

const DEDUPLICATION_SET_KEY = 'meridian:article_url_hashes'; // Redis set key

  

/**

 * Generates a SHA-256 hash for a given URL for consistent deduplication.

 * @param url The URL to hash.

 * @returns The SHA-256 hash as a hex string.

 */

const getUrlHash = (url: string): string => {

    return createHash('sha256').update(url).digest('hex');

};

  

/**

 * The master AI analysis prompt. This is a critical asset.

 * It instructs the LLM to act as an expert and return structured JSON.

 * @param articleTitle The title of the article.

 * @param articleContent The full text content of the article.

 * @returns A structured prompt string.

 */

const buildAnalysisPrompt = (articleTitle: string, articleContent: string): string => {

    return `

      You are an expert Malaysian media analyst. Your task is to analyze the provided news article objectively.

      Do not include any preambles, apologies, or text outside of the JSON object.

      Your response MUST be a single, valid JSON object following this exact schema:

  

      {

        "summary": "A brief, neutral, one-sentence summary of the article's main point.",

        "sentiment_overall": {

          "score": <float between -1.0 (very negative) and 1.0 (very positive)>,

          "label": "<'Positive' | 'Negative' | 'Neutral'>"

        },

        "sentiment_towards_gov": {

          "score": <float between -1.0 and 1.0, where > 0 is favorable to the current government>,

          "explanation": "Briefly explain the reasoning for the score."

        },

        "topics_detected": ["<list of key topics, e.g., 'Economy', 'Politics', 'Human Rights'>"],

        "3R_flags": {

            "race": <boolean>,

            "religion": <boolean>,

            "royalty": <boolean>,

            "explanation": "Identify if Race, Religion, or Royalty are a central theme. DO NOT judge or provide opinion, only flag their presence."

        }

      }

  

      --- ARTICLE START ---

      Title: ${articleTitle}

      Content: ${articleContent.substring(0, 8000)}

      --- ARTICLE END ---

    `;

};

  
  

/**

 * API Endpoint: /api/scrape-site

 * Triggered by a QStash message for a single news source.

 * It performs the following steps:

 * 1. Scrapes the source's homepage for article links.

 * 2. For each link, checks Redis to see if it has been processed before.

 * 3. If new, scrapes the full article content.

 * 4. Calls OpenRouter to get a vector embedding.

 * 5. Calls OpenRouter with a detailed prompt to get a bias/content analysis.

 * 6. Inserts the article, embedding, and analysis into the Supabase database.

 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {

        return res.status(405).json({ error: 'Method Not Allowed' });

    }

  

    const { sourceId, sourceName, baseUrl } = req.body;

  

    try {

        // 1. Scrape homepage for article URLs

  

        // A robust implementation would store selectors in the `sources` table.

        const { data: pageHtml } = await axios.get(baseUrl);

        const $ = cheerio.load(pageHtml);

        const articleUrls = new Set<string>();

        $('a[href]').each((_, el) => {

            let href = $(el).attr('href');

            if (href && href.startsWith('/')) {

                href = new URL(href, baseUrl).toString();

            }

            // Add filtering logic here to only include valid article links

            if (href && href.startsWith(baseUrl) && href.includes('news')) { // Example filter

                articleUrls.add(href);

            }

        });

  

        console.log(`[${sourceName}] Found ${articleUrls.size} potential articles.`);

  

        for (const url of Array.from(articleUrls)) {

            const urlHash = getUrlHash(url);

  

            // 2. Deduplication Check with Upstash Redis

            const isMember = await redis.sismember(DEDUPLICATION_SET_KEY, urlHash);

            if (isMember) {

                console.log(`[${sourceName}] Skipping already processed article: ${url}`);

                continue;

            }

  

            try {

                // 3. Scrape full article content

                // NOTE: This also requires site-specific selectors for title and content.

                const { data: articleHtml } = await axios.get(url);

                const $$ = cheerio.load(articleHtml);

                const title = $$('h1').first().text().trim(); // Example selector

                const content = $$('.article-content').text().trim(); // Example selector

  

                if (!title || !content) {

                    console.warn(`[${sourceName}] Could not extract title/content from: ${url}`);

                    continue;

                }

  

                // 4. Generate Embedding via OpenRouter

                const embeddingResponse = await openrouter.embeddings.create({

                    model: EMBEDDING_MODEL,

                    input: `${title}\n\n${content}`,

                });

                const embedding = embeddingResponse.data[0].embedding;

  

                // 5. Generate AI Analysis via OpenRouter

                const analysisPrompt = buildAnalysisPrompt(title, content);

                const analysisResponse = await openrouter.chat.completions.create({

                    model: ANALYSIS_MODEL,

                    messages: [{ role: 'user', content: analysisPrompt }],

                    response_format: { type: 'json_object' },

                });

                const analysisJson = JSON.parse(analysisResponse.choices[0].message.content!);

  

                // 6. Insert into Supabase

                const { error: insertError } = await supabase

                    .from('articles')

                    .insert({

                        source_id: sourceId,

                        url: url,

                        url_hash: urlHash,

                        title: title,

                        full_text_content: content,

                        published_at: new Date().toISOString(), // Placeholder, ideally parse from page

                        embedding: embedding,

                        bias_analysis: analysisJson,

                        llm_analysis_model: ANALYSIS_MODEL,

                    });

  

                if (insertError) throw insertError;

  

                // If insert is successful, add hash to Redis set to prevent re-processing

                await redis.sadd(DEDUPLICATION_SET_KEY, urlHash);

                console.log(`[${sourceName}] Successfully processed and stored: ${title}`);

  

            } catch (articleError) {

                console.error(`[${sourceName}] Failed to process article ${url}:`, articleError);

            }

        }

  

        res.status(200).json({ message: `Scraping completed for ${sourceName}.` });

  

    } catch (error) {

        console.error(`[${sourceName}] Major error in scrape-site handler:`, error);

        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });

    }

}

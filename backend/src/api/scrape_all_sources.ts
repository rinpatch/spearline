import { createClient } from '@supabase/supabase-js';
import { Client } from "@upstash/qstash";
import { NextApiRequest, NextApiResponse } from 'next'; // For Vercel

// --- Configuration ---
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const qstashToken = process.env.QSTASH_TOKEN!;
const scrapeSiteApiUrl = process.env.SCRAPE_SITE_API_URL!;

// --- Initialize Clients ---
const supabase = createClient(supabaseUrl, supabaseKey);
const qstashClient = new Client({ token: qstashToken });

/**
 * API Endpoint: /api/scrape-all-sources
 * Triggered by a QStash cron schedule.
 * Fetches all active news sources from the database and dispatches individual
 * scraping jobs for each one to a QStash queue. This decouples the master
 * trigger from the individual scraping tasks for resilience and scalability.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        console.log("Fetching sources from database...");

        // 1. Fetch all news sources from the 'sources_msia.sources' table.
        const { data: sources, error } = await supabase
            .from('sources')
            .select('id, name, base_url')
            .schema('sources_msia');

        if (error) {
            console.error('Supabase error fetching sources:', error);
            throw new Error(`Supabase error: ${error.message}`);
        }

        if (!sources || sources.length === 0) {
            console.warn("No sources found in the database. Nothing to scrape.");
            return res.status(200).json({ message: "No sources to scrape." });
        }

        console.log(`Found ${sources.length} sources. Queuing scrape jobs...`);

        // 2. For each source, publish a message to the QStash queue.
        // The message body contains the information needed by the scrape-site function.
        const publishPromises = sources.map(source =>
            qstashClient.publishJSON({
                // The endpoint that will process this message
                url: scrapeSiteApiUrl,
                // The payload sent to the endpoint
                body: {
                    sourceId: source.id,
                    sourceName: source.name,
                    baseUrl: source.base_url,
                },
                // Optional: Add a delay or other QStash features here if needed
            })
        );

        await Promise.all(publishPromises);

        console.log(`Successfully queued ${sources.length} scraping jobs.`);
        res.status(200).json({ message: `Successfully queued ${sources.length} jobs.` });

    } catch (error) {
        console.error("Error in scrape-all-sources handler:", error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
}

import { createClient } from '@supabase/supabase-js';
import { Client } from "@upstash/qstash";
import { NextApiRequest, NextApiResponse } from 'next';

// --- Environment Variable Validation ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const qstashToken = process.env.QSTASH_TOKEN;
const scrapeSiteApiUrl = process.env.SCRAPE_SITE_API_URL; // The URL of the worker endpoint below

if (!supabaseUrl ||!supabaseKey ||!qstashToken ||!scrapeSiteApiUrl) {
    throw new Error("Missing required environment variables for the dispatcher.");
}

// --- Initialize Clients ---
const supabase = createClient(supabaseUrl, supabaseKey);
const qstashClient = new Client({ token: qstashToken });

/**
 * API Endpoint: /api/scrape-all-sources
 * Triggered by a cron schedule.
 * Fetches all active news sources from the database and dispatches individual
 * scraping jobs for each one to a QStash queue. This decouples the master
 * trigger from the individual scraping tasks for resilience and scalability.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method!== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        console.log("Fetching all active sources from database...");

        // 1. Fetch all news sources from the 'sources' table.
        // We only need the 'id' to look up the full config in the worker.
        const { data: sources, error } = await supabase
           .from('sources')
           .select('id');

        if (error) {
            console.error('Supabase error fetching sources:', error);
            throw new Error(`Supabase error: ${error.message}`);
        }

        if (!sources |
| sources.length === 0) {
            console.warn("No sources found in the database. Nothing to scrape.");
            return res.status(200).json({ message: "No sources to scrape." });
        }

        console.log(`Found ${sources.length} sources. Queuing scrape jobs...`);

        // 2. For each source, publish a message to the QStash queue.
        // The message body contains only the sourceId, which the worker will
        // use to look up its specific scraping configuration.
        const publishPromises = sources.map(source =>
            qstashClient.publishJSON({
                url: scrapeSiteApiUrl,
                body: {
                    sourceId: source.id,
                },
            })
        );

        await Promise.all(publishPromises);

        const successMessage = `Successfully queued ${sources.length} scraping jobs.`;
        console.log(successMessage);
        res.status(200).json({ message: successMessage });

    } catch (error) {
        console.error("Critical error in scrape-all-sources handler:", error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
}

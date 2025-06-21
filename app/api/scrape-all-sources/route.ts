import { Client } from "@upstash/qstash";
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

type Source = {
    id: number;
    name: string;
    base_url: string;
};

// --- Configuration ---
const qstashToken = process.env.QSTASH_TOKEN!;
const scrapeSiteApiUrl = process.env.SCRAPE_SITE_API_URL!;

// --- Initialize Clients ---
const qstashClient = new Client({ token: qstashToken });

/**
 * API Endpoint: /api/scrape-all-sources
 * Triggered by a QStash cron schedule.
 * Fetches all active news sources from the database and dispatches individual
 * scraping jobs for each one to a QStash queue. This decouples the master
 * trigger from the individual scraping tasks for resilience and scalability.
 */
export async function POST() {
    try {
        console.log("Scrape-all-sources job started.");

        // 1. Fetch all news sources from the 'sources' table.
        const { data: sources, error } = await supabase
            .from('sources')
            .select('id, name, base_url');

        if (error) {
            console.error('Supabase error fetching sources:', error);
            return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
        }

        if (!sources || sources.length === 0) {
            console.warn("No sources found in the database. Nothing to scrape.");
            return NextResponse.json({ message: "No sources to scrape." }, { status: 200 });
        }

        console.log(`Found ${sources.length} sources. Queuing scrape jobs...`);

        // 2. For each source, publish a message to the QStash queue.
        // The message body contains the information needed by the scrape-site function.
        const publishPromises = sources.map((source: Source) =>
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
        return NextResponse.json({ message: `Successfully queued ${sources.length} jobs.` }, { status: 200 });

    } catch (error) {
        console.error("Error in scrape-all-sources handler:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
    }
} 

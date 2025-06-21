import { Client } from "@upstash/qstash";
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { verifyQstashSignature } from "@/lib/qstash";

type Source = {
    id: number;
    name: string;
    base_url: string;
};

// --- Configuration ---
const qstashToken = process.env.QSTASH_TOKEN!;
const scrapeSiteApiUrl = `${process.env.APP_BASE_URL}/api/scrape`;

// --- Initialize Clients ---
const qstashClient = new Client({ token: qstashToken });

/**
 * API Endpoint: /api/scrape-all-sources
 * Triggered by a QStash cron schedule.
 * Fetches all active news sources from the database and dispatches individual
 * scraping jobs for each one to a QStash queue. This decouples the master
 * trigger from the individual scraping tasks for resilience and scalability.
 */
export async function POST(req: NextRequest) {
    const verificationError = await verifyQstashSignature(req, await req.text());
    if (verificationError) {
        return verificationError;
    }

    try {
        console.log("Scrape-all-sources job started.");

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

        const messages = sources.map((source: Source) => ({
            url: scrapeSiteApiUrl,
            body: {
                sourceId: source.id,
            },
        }));

        if (messages.length > 0) {
            await qstashClient.batchJSON(messages);
        }

        console.log(`Successfully queued ${sources.length} scraping jobs.`);
        return NextResponse.json({ message: `Successfully queued ${sources.length} jobs.` }, { status: 200 });

    } catch (error) {
        console.error("Error in scrape-all-sources handler:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
    }
} 
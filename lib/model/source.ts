import { supabase } from "@/lib/service/supabase-server";

/**
 * Retrieves a source from the database by its base URL.
 * @param baseUrl - The base URL of the source to find.
 * @returns The source object or null if not found.
 */
export async function getSourceByUrl(baseUrl: string) {
    const { data: source, error } = await supabase
        .from("sources")
        .select("id")
        .eq("base_url", baseUrl)
        .single();

    if (error) {
        console.error(`Error fetching source for base URL ${baseUrl}:`, error.message);
        return null;
    }

    return source;
} 
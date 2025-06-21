import { supabase } from "@/lib/service/supabase-server";
import { getEmbeddings } from "@/lib/service/openai";

// This is a tunable threshold. A higher value means articles need to be more similar to be clustered.
const SIMILARITY_THRESHOLD = 0.9;
// The number of potential matches to retrieve from the database.
const MATCH_LIMIT = 5;

interface SimilarArticle {
    story_id: number | null;
    similarity: number;
}

/**
 * Finds a potential cluster (story) for a given text by finding similar articles.
 * It does not create a new story or assign the article to a story.
 *
 * @param text The text to find a cluster for (e.g., "Title\n\nContent").
 * @returns The story_id of a similar, already-clustered article, or null if none is found.
 */
export async function findClusterForText(
    text: string
): Promise<number | null> {
    try {
        // 1. Generate an embedding for the article text.
        const articleEmbedding = await getEmbeddings(text);

        // 2. Use the RPC function to find articles with similar embeddings.
        const { data: similarArticles, error: rpcError } = await supabase.rpc(
            "find_similar_articles",
            {
                query_embedding: articleEmbedding,
                match_threshold: SIMILARITY_THRESHOLD,
                result_limit: MATCH_LIMIT,
            }
        );

        if (rpcError) {
            throw new Error(
                `Failed to call find_similar_articles RPC: ${rpcError.message}`
            );
        }

        if (!similarArticles || similarArticles.length === 0) {
            console.log(`[Clusterer] No similar articles found.`);
            return null;
        }

        // 3. Find the first similar article that already belongs to a story.
        const existingCluster = (similarArticles as SimilarArticle[]).find(
            (a) => a.story_id !== null
        );

        if (existingCluster?.story_id) {
            console.log(
                `[Clusterer] Found existing story ${existingCluster.story_id}.`
            );
            return existingCluster.story_id;
        } else {
            console.log(
                `[Clusterer] No existing cluster found among similar articles.`
            );
            return null;
        }
    } catch (error) {
        console.error(
            `[Clusterer] Error finding cluster for text:`,
            error
        );
        // Return null to allow the calling process to decide how to handle the failure.
        return null;
    }
} 
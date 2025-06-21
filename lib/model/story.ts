import { supabase } from "@/lib/service/supabase-server";
import { getEmbeddings } from "@/lib/service/openai";
import { openrouter } from "@/lib/service/openrouter";

// This is a tunable threshold. A higher value means articles need to be more similar to be clustered.
const SIMILARITY_THRESHOLD = 0.7;
// The number of potential matches to retrieve from the database.
const MATCH_LIMIT = 5;

interface SimilarArticle {
    story_id: number | null;
    similarity: number;
}

/**
 * Creates a new story with a representative title.
 * @param representativeTitle The title for the new story.
 * @returns The ID of the newly created story.
 */
export async function createStory(representativeTitle: string): Promise<number> {
    console.log(`Creating a new story for: "${representativeTitle}"`);
    const { data: newStory, error: createError } = await supabase
        .from("stories")
        .insert({
            representative_title: representativeTitle,
            summary: `This story is about: ${representativeTitle}`, // Placeholder
        })
        .select("id")
        .single();

    if (createError || !newStory) {
        throw new Error(
            `Failed to create a new story: ${createError?.message}`
        );
    }
    console.log(`[Story] Created new story ${newStory.id}.`);
    return newStory.id;
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

/**
 * Adds an article to an existing story by updating timestamps and regenerating the summary.
 * @param storyId The ID of the story to update.
 * @param articleId The ID of the article being added.
 * @returns Promise<void>
 */
export async function addArticleToStory(storyId: number, articleId: number): Promise<void> {
    try {
        // 1. Update the story's last_article_added_at timestamp
        const { error: updateError } = await supabase
            .from("stories")
            .update({ last_article_added_at: new Date().toISOString() })
            .eq("id", storyId);

        if (updateError) {
            throw new Error(`Failed to update story timestamp: ${updateError.message}`);
        }

        // 2. Regenerate the story summary
        await regenerateStorySummary(storyId);

        console.log(`Successfully added article ${articleId} to story ${storyId} and updated summary`);
    } catch (error) {
        console.error(`Error adding article to story:`, error);
        throw error;
    }
}

/**
 * Regenerates a story's summary by analyzing all article summaries in the story.
 * @param storyId The ID of the story to regenerate summary for.
 * @returns Promise<void>
 */
export async function regenerateStorySummary(storyId: number): Promise<void> {
    try {
        // 1. Fetch all articles for this story and extract their summaries
        const { data: articles, error: fetchError } = await supabase
            .from("articles")
            .select("title, bias_analysis")
            .eq("story_id", storyId);

        if (fetchError) {
            throw new Error(`Failed to fetch articles for story: ${fetchError.message}`);
        }

        if (!articles || articles.length === 0) {
            console.log(`No articles found for story ${storyId}`);
            return;
        }

        // 2. Extract summaries from bias_analysis
        const summaries = articles
            .map((article) => {
                try {
                    const biasAnalysis = typeof article.bias_analysis === 'string' 
                        ? JSON.parse(article.bias_analysis) 
                        : article.bias_analysis;
                    return biasAnalysis?.summary || `Article: ${article.title}`;
                } catch {
                    console.warn(`Failed to parse bias_analysis for article, using title instead`);
                    return `Article: ${article.title}`;
                }
            })
            .filter(Boolean);

        if (summaries.length === 0) {
            console.log(`No valid summaries found for story ${storyId}`);
            return;
        }

        // 3. Generate a neutral story summary using OpenRouter
        const newSummary = await generateStorySummary(summaries);

        // 4. Update the story with the new summary
        const { error: updateError } = await supabase
            .from("stories")
            .update({ summary: newSummary })
            .eq("id", storyId);

        if (updateError) {
            throw new Error(`Failed to update story summary: ${updateError.message}`);
        }

        console.log(`Successfully regenerated summary for story ${storyId}`);
    } catch (error) {
        console.error(`Error regenerating story summary:`, error);
        throw error;
    }
}

const SUMMARY_MODEL = "google/gemini-2.0-flash-001";
/**
 * Generates a neutral story summary from multiple article summaries using OpenRouter.
 * @param summaries Array of article summaries.
 * @returns Promise<string> The generated story summary.
 */
async function generateStorySummary(summaries: string[]): Promise<string> {
    const prompt = `
You are a neutral news summarizer. Given multiple article summaries about the same story, create a single, comprehensive, and neutral summary that captures the key points across all articles.

Requirements:
- Be objective and neutral in tone
- Combine insights from all provided summaries
- Keep it concise (2-3 sentences maximum)
- Focus on the main story elements and key developments
- Avoid bias or editorial language
- Return only the summary text, no additional formatting or preamble

Article summaries:
${summaries.map((summary, index) => `${index + 1}. ${summary}`).join('\n')}
`;

    const completion = await openrouter.chat.completions.create({
        model: SUMMARY_MODEL,
        messages: [
            { role: "system", content: "You are a neutral news summarizer. Provide only the summary text without any additional formatting or preamble." },
            { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
    });

    const result = completion.choices[0].message.content;

    if (!result) {
        throw new Error("Failed to generate story summary: empty response");
    }

    return result.trim();
} 
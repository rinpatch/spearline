import { supabase } from "@/lib/service/supabase-server";
import { createStory } from "@/lib/model/story";
import { getEmbeddings } from "@/lib/service/openai";

interface BiasAnalysis {
    summary: string;
    sentiment_overall: {
        score: number;
        label: 'Positive' | 'Negative' | 'Neutral';
    };
    sentiment_towards_gov: {
        score: number;
        explanation: string;
    };
    topics_detected: string[];
    "3R_flags": {
        race: boolean;
        religion: boolean;
        royalty: boolean;
        explanation: string;
    };
}

interface ArticleData {
    source_id: number;
    url: string;
    url_hash: string;
    title: string;
    full_text_content: string;
    published_at: Date;
    bias_analysis: BiasAnalysis;
    llm_analysis_model: string;
    story_id?: number | null;
}


export async function insertArticle(articleData: ArticleData) {
    const { title, full_text_content } = articleData;

    if (!title || !full_text_content) {
        throw new Error("Title and content are required to insert an article.");
    }

    // 1. Generate embedding
    const embedding = await getEmbeddings(`${title}\n\n${full_text_content}`);

    let storyIdToAssign = articleData.story_id;

    // 2. If no story_id is provided, create a new story
    if (!storyIdToAssign) {
        storyIdToAssign = await createStory(title);
    }

    // 3. Prepare article record for insertion
    const articleRecord = {
        ...articleData,
        embedding: embedding,
        story_id: storyIdToAssign,
    };

    // 4. Insert the article
    const { data: newArticle, error: insertError } = await supabase
        .from("articles")
        .insert(articleRecord)
        .select()
        .single();

    if (insertError) {
        throw new Error(`Failed to insert article: ${insertError.message}`);
    }

    console.log(`Successfully inserted article ${newArticle.id} into story ${storyIdToAssign}`);

    return newArticle;
} 
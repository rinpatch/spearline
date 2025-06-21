import { supabase } from "@/lib/service/supabase-server";
import { addArticleToStory, createStory } from "@/lib/model/story";
import { getEmbeddings } from "@/lib/service/openai";
import { openrouter } from "@/lib/service/openrouter";
import { findClusterForText } from "../cluster";

interface SentimentScore {
    score: number;
    explanation: string;
}

interface BiasAnalysis {
    summary: string;
    sentiment_overall: {
        score: number;
        label: 'Positive' | 'Negative' | 'Neutral';
    };
    sentiment_towards_government: SentimentScore;
    "sentiment_towards_Malay and Bumiputera": SentimentScore;
    sentiment_towards_Islam: SentimentScore;
    sentiment_towards_Multicultural: SentimentScore;
    sentiment_towards_Secular_learning: SentimentScore;
    topics_detected: string[];
}

interface ArticleData {
    source_id: number;
    url: string;
    url_hash: string;
    title: string;
    full_text_content: string;
    published_at: Date;
    story_id?: number | null;
}


export async function insertArticle(articleData: ArticleData) {
    const { title, full_text_content } = articleData;

    if (!title || !full_text_content) {
        throw new Error("Title and content are required to insert an article.");
    }

    // 1. Analyse sentiment
    const biasAnalysis = await analyseSentiment(title, full_text_content);

    // 2. Generate embedding
    const embedding = await getEmbeddings(`${title}\n\n${full_text_content}`);

    let storyIdToAssign = await findClusterForText(`${title}\n\n${full_text_content}`);

    // 3. If no story_id is provided, create a new story
    if (!storyIdToAssign) {
        storyIdToAssign = await createStory(title);
    }

    // 4. Prepare article record for insertion
    const articleRecord = {
        ...articleData,
        embedding: embedding,
        story_id: storyIdToAssign,
        bias_analysis: biasAnalysis,
        llm_analysis_model: ANALYSIS_MODEL,
    };

    // 5. Insert the article
    const { data: newArticle, error: insertError } = await supabase
        .from("articles")
        .insert(articleRecord)
        .select()
        .single();

    if (insertError) {
        throw new Error(`Failed to insert article: ${insertError.message}`);
    }

    await addArticleToStory(storyIdToAssign, newArticle.id);
    console.log(`Successfully inserted article ${newArticle.id} into story ${storyIdToAssign}`);

    return newArticle;
}

const ANALYSIS_PROMPT = `
You are an expert Malaysian media analyst. Your task is to analyze the provided news article objectively.
     Do not include any preambles, apologies, or text outside of the JSON object.
     Your response MUST be a single, valid JSON object following this exact schema:
  
     {
       "summary": "A brief, neutral, one-sentence summary of the article's main point. It MUST be in English",
       "sentiment_overall": {
         "score": <float between -1.0 (very negative) and 1.0 (very positive)>,
         "label": "<'Positive' | 'Negative' | 'Neutral'>"
       },
       "sentiment_towards_government": {
         "score": <float between -1.0 and 1.0, where > 0 is favorable to the current government>,
         "explanation": "Briefly explain the reasoning for the score."
       },
       "sentiment_towards_Malay and Bumiputera": {
         "score": <float between -1.0 and 1.0, where > 0 is favorable to the Malay and Bumiputera citizens>,
         "explanation": "Briefly explain the reasoning for the score."
       },
       "sentiment_towards_Islam": {
         "score": <float between -1.0 and 1.0, where > 0 is favorable towards Islamic religion>,
         "explanation": "Briefly explain the reasoning for the score."
       },
       "sentiment_towards_Multicultural": {
         "score": <float between -1.0 and 1.0, where > 0 is favorable to the multicultural citizens of Malaysia>,
         "explanation": "Briefly explain the reasoning for the score."
       },
       "sentiment_towards_Secular_learning": {
         "score": <float between -1.0 and 1.0, where > 0 is favorable to the secular learning methods>,
         "explanation": "Briefly explain the reasoning for the score."
       },
             
       "topics_detected": ["<list of key topics, e.g., 'Economy', 'Politics', 'Human Rights'>"]
     }
` 

const ANALYSIS_MODEL = "google/gemini-2.0-flash-001";
export async function analyseSentiment(title: string, full_text: string): Promise<BiasAnalysis> {
    const articleContent = `Title: ${title}\n\n${full_text}`;

    const completion = await openrouter.chat.completions.create({
        model: ANALYSIS_MODEL,
        messages: [
            { role: "system", content: ANALYSIS_PROMPT },
            { role: "user", content: articleContent },
        ],
        response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;

    if (!result) {
        throw new Error("LLM analysis failed: empty response");
    }

    try {
        const analysis: BiasAnalysis = JSON.parse(result);
        return analysis;
    } catch (error) {
        console.error("Failed to parse LLM response:", result, error);
        throw new Error("Failed to parse LLM response as JSON.");
    }
}
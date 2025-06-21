// scripts/test-insert.ts
import "dotenv/config";
import { findClusterForText } from "../lib/model/story";
import { insertArticle } from "../lib/model/article";

async function main() {
    console.log("--- Running Article Insertion Test ---");

    const sourceId = 9;
    const articleText = 
    `
    KLANG: CCTV footage from nearby locations is being reviewed as part of the ongoing investigation into a fatal shooting here.

Several cameras have been identified near the shooting site and are currently under examination.

The police have recorded several statements regarding the shooting and plan to call more witnesses to assist in the investigation.

This was confirmed by North Klang Asst Comm S. Vijaya Rao.

On Friday, a man was shot dead in front of a motorcycle shop in Taman Meru Utama, near here.

It is believed he was shot at least six times.

"Initial investigations found a local man, aged 46, face down and covered in blood in the driver's seat of a four-wheel-drive vehicle," ACP Vijaya Rao said in a statement, adding that medical personnel declared the man dead at the scene.

This incident is the latest in a series of fatal shootings, with similar cases occurring in Brickfields and Cheras in recent weeks.
   `
    const articleTitle = "Test Article: Politics";

    try {
        // 1. Check for an existing cluster
        console.log(`Searching for a story for: "${articleTitle}"...`);
        const existingStoryId = await findClusterForText(articleText);

        if (existingStoryId) {
            console.log(`Found existing story, ID: ${existingStoryId}`);
        } else {
            console.log("No existing story found. A new one will be created.");
        }

        // 2. Insert the new article
        // The insertArticle function will create a new story if existingStoryId is null
        console.log("Inserting article...");
        const newArticle = await insertArticle({
            source_id: sourceId,
            url: `https://example.com/test-${Date.now()}`,
            url_hash: `hash-${Date.now()}`,
            title: articleTitle,
            full_text_content: articleText,
            published_at: new Date(),
            bias_analysis: { // Dummy analysis
                summary: "summary",
                sentiment_overall: { score: 0, label: "Neutral" },
                sentiment_towards_gov: { score: 0, explanation: "neutral" },
                topics_detected: ["test"],
                "3R_flags": { race: false, religion: false, royalty: false, explanation: "none" }
            },
            llm_analysis_model: "test-model",
            story_id: existingStoryId,
        });

        console.log(
            `\n✅ Successfully inserted article ${newArticle.id} into story ${newArticle.story_id}`
        );
    } catch (error) {
        console.error("❗️ Test failed:", error);
    }

    console.log("\n--- Test Complete ---");
}

main(); 
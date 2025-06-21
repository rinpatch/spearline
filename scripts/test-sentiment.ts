// scripts/test-sentiment.ts
import "dotenv/config";
import { analyseSentiment } from "../lib/model/article";

async function main() {
    console.log("--- Running Sentiment Analysis Test ---");

    const articleTitle = "Road to Gold panel to help pro-shuttlers find suitable training venues";
    const articleText = `
PUTRAJAYA: The Road to Gold (RTG) committee will help professional badminton players under its programme find more conducive training venues, says youth and sports minister Hannah Yeoh.

She said the RTG Committee is aware that these players are currently training in halls which are also open to the public.

“I hope we can help find more suitable and private training locations for these professional athletes (badminton players).

“As it stands, they’ve been training in places like shopping malls where the public can watch them. I believe RTG programme coordinator Stuart Ramalingam will coordinate the necessary support,” she said.

Hannah, who also chairs the RTG committee, said efforts will also be made to help professional players find quality sparring partners to boost their performance.

Last Thursday, she announced that four professional badminton players – men’s world number one pair Goh Sze Fei-Nur Izzuddin Rumsani and mixed doubles duo Goh Soon Huat-Shevon Lai Jemie – had committed to the RTG programme for the 2025 cycle.

The RTG project, introduced by the youth and sports ministry in April 2023, is a national initiative to coordinate Malaysia’s efforts to win its first Olympic gold medal, with focus on the Paris 2024 and Los Angeles 2028 Games.

Meanwhile, Hannah expressed hope that the contract issue involving national women’s doubles pair Pearly Tan and M Thinaah, whose deal with the Badminton Association of Malaysia (BAM) ended last December, can be resolved promptly.

She stressed the importance of settling the matter quickly, as any delay could affect the performance of the world number three pair.

She told reporters this after opening the Asean Persons with Disabilities in Sports Conference 2025 here today.

Earlier, Hannah said about 240 participants, including those from other Southeast Asian countries, attended the two-day conference, which ends today.

She said the conference, themed “Inclusive Sports for All: Breaking Barriers, Building Bridges in Asean”, discussed accessibility and ways to further empower sports participation for persons with disabilities.
   `;

    try {
        console.log(`Analysing article: "${articleTitle}"...`);
        const analysis = await analyseSentiment(articleTitle, articleText);

        console.log("\n✅ Sentiment Analysis Successful:");
        console.log(JSON.stringify(analysis, null, 2));

    } catch (error) {
        console.error("❗️ Test failed:", error);
    }

    console.log("\n--- Test Complete ---");
}

main(); 
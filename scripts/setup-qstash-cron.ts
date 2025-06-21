import "dotenv/config";
import axios from "axios";

// --- Configuration ---
const qstashToken = process.env.QSTASH_TOKEN;
const appBaseUrl = process.env.APP_BASE_URL;
const cronSchedule = "*/15 * * * *"; // Every 15 minutes

// --- Validation ---
if (!qstashToken) {
  throw new Error("QSTASH_TOKEN is not defined in your .env file.");
}
if (!appBaseUrl) {
  throw new Error("APP_BASE_URL is not defined in your .env file.");
}
const destinationUrl = `${appBaseUrl}/api/scrape-all-sources`;
const scheduleEndpoint = `https://qstash.upstash.io/v2/schedules/${destinationUrl}`;

// --- Main Logic ---
async function setupCronJob() {
  console.log(`Attempting to create or update a QStash cron job...`);
  console.log(`  -> Destination: ${destinationUrl}`);
  console.log(`  -> Schedule: ${cronSchedule}`);

  try {
    const { data } = await axios.post(
      scheduleEndpoint,
      {}, // Body is empty as per QStash docs for cron creation
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${qstashToken}`,
          "Upstash-Cron": cronSchedule,
        },
      }
    );

    console.log("Successfully created or updated the cron job!");
    console.log("Response:", data);

  } catch (error) {
    console.error("Failed to set up the QStash cron job.");
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    process.exit(1);
  }
}

setupCronJob(); 
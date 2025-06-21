import OpenAI from "openai";

const openRouterKey = process.env.OPENROUTER_API_KEY!;

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openRouterKey,
}); 
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbeddings(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text.replaceAll("\n", " "),
    dimensions: 1536,
  });

  return response.data[0].embedding;
} 
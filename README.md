# Spearline  - Piercing Bias. Truth in the Line.

![spearline logo](./public/spearline-logo.png)

Spearline is an AI-powered Malaysian news aggregator designed to uncover media bias.

We bring together news from across languages — Malay, English, and Chinese — and use AI to summarize each article and identify its ideological leanings, such as Pro-Government, Pro-Islam, or Opposition-aligned.

## Team
This project is done by Nott-A-Hackers team for Taylor's Univeristy ImagineHack 2025 Hackathon. The team members are:
- [@rinpatch](https://github.com/rinpatch)
- [@Mint3Ds](https://github.com/Mint3Ds)
- [mithileshtew0702](https://github.com/mithileshtew0702)
- [@Yoonjae7](https://github.com/Yoonjae7)
- [Pyjalal](https://github.com/Pyjalal)

## Technologies Used
- Next.js (FE/BE)
- Vercel (Deploy)
- Supabase (Postgres Database to store articles/embeddings)
- Qstash (Job queue for news scraping/processing)
- Upstash Redis (In-Memory cache, we just use it to keep track of recently processed articles to not reprocess them)
- Openrouter (Unified LLM API allowing for easy switching of models, we currently use gemini-2.0-flash for everything due to good cost-to-benefit)
- OpenAI embeddings API (used to transform news text into number vectors, which we can compare for similarity in order to "cluster" articles about same topic into one story)

## Deploying

Deploy in a [Vercel](https://vercel.com) project with QStash, Supabase and Upstash Redis connected. Set the following evironment variables:
- `APP_BASE_URL`: prod url that QStash cron will query (i.e https://spearline.vercel.app/).
- `OPENROUTER_API_KEY`: OpenRouter API key to be used for analysis as well as summary/title generation.
- `OPENAI_API_KEY`: OpenAI API key, will only be used for text embeddings.

## Challenge and Approach
TODO: 
## Usage Instructions

TODO: Add screenshots
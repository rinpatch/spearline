-- 1. EXTENSIONS
-- Enable the pgvector extension for storing and querying vector embeddings.
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. TABLES

-- Table: sources
-- Stores the curated list of news sources, their metadata, and our proprietary analysis.
-- This table is the "source of truth" for media context.
CREATE TABLE sources (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL, -- e.g., 'en', 'ms', 'zh', 'ta'
    perceived_leaning TEXT, -- e.g., 'Pro-Government', 'Independent', 'Malay Nationalist'
    ownership_details TEXT, -- Detailed description of ownership structure
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment on sources table
COMMENT ON TABLE sources IS 'Curated list of Malaysian news sources and their political/ownership context.';

-- Table: stories
-- Represents a single news event or narrative, clustering multiple articles together.
CREATE TABLE stories (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    representative_title TEXT NOT NULL,
    summary TEXT, -- LLM-generated neutral summary of the story.
    story_metadata JSONB, -- Pre-calculated aggregations (bias distribution, ownership breakdown) for fast UI rendering.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ
);

-- Comment on stories table
COMMENT ON TABLE stories IS 'Represents clusters of articles grouped into a single news event.';
COMMENT ON COLUMN stories.story_metadata IS 'Cached analytical data about the story for performant front-end display.';


-- Table: articles
-- The central repository for all ingested articles and their AI-generated analysis.
CREATE TABLE articles (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES sources(id),
    story_id BIGINT REFERENCES stories(id), -- Nullable, will be updated by the clustering job.
    url TEXT NOT NULL UNIQUE,
    url_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the canonical URL for fast deduplication checks.
    title TEXT NOT NULL,
    author TEXT,
    full_text_content TEXT, -- The raw text content of the article for analysis.
    published_at TIMESTAMPTZ,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    embedding vector(1536), -- Storing the vector embedding. Using OpenAI's `text-embedding-3-small` dimension.
    bias_analysis JSONB, -- Stores the complex, structured output from the LLM analysis.
    llm_analysis_model TEXT -- e.g., 'openai/gpt-4o', to track which model was used.
);

-- Comments on articles table
COMMENT ON TABLE articles IS 'Stores all scraped articles, their content, vector embeddings, and AI analysis.';
COMMENT ON COLUMN articles.url_hash IS 'SHA-256 hash of the canonical URL for high-performance deduplication.';
COMMENT ON COLUMN articles.bias_analysis IS 'Flexible JSONB field for storing structured LLM analysis results.';
COMMENT ON COLUMN articles.story_id IS 'Foreign key to the story cluster this article belongs to.';


-- 3. INDEXES for HIGH-PERFORMANCE QUERYING

-- Index for fast deduplication lookup via URL hash.
CREATE UNIQUE INDEX idx_articles_url_hash ON articles(url_hash);

-- Index for sorting articles by publication date (e.g., for the main feed).
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

-- Index for quickly finding all articles belonging to a story.
CREATE INDEX idx_articles_story_id ON articles(story_id);

-- GIN index on the JSONB column to speed up queries on the analysis data.
-- Example: Find all articles where `bias_analysis ->> 'sentiment_towards_gov' > 0.8`
CREATE INDEX idx_articles_bias_analysis ON articles USING GIN (bias_analysis);

-- HNSW index for fast Approximate Nearest Neighbor (ANN) search on vector embeddings.
-- This is the core of the semantic clustering functionality.
-- The number of dimensions (1536) must match your embedding model.
CREATE INDEX idx_articles_embedding ON articles USING hnsw (embedding vector_cosine_ops);
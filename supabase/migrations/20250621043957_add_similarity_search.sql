-- Function: find_similar_articles
-- Description: Finds articles with embeddings similar to a query vector.
-- This is the core of the clustering and "find related articles" feature.
--
-- Parameters:
--   - query_embedding: The vector to search against.
--   - match_threshold: The minimum cosine similarity score to consider a match (e.g., 0.9).
--   - result_limit: The maximum number of similar articles to return.
--
-- Returns:
--   A table of articles that meet the similarity threshold, including their ID, story_id,
--   and the calculated similarity score.

CREATE OR REPLACE FUNCTION find_similar_articles(
    query_embedding vector(1536),
    match_threshold float,
    result_limit int
)
RETURNS TABLE (
    id bigint,
    story_id bigint,
    similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    articles.id,
    articles.story_id,
    1 - (articles.embedding <=> query_embedding) AS similarity
  FROM
    articles
  WHERE
    -- Ensure we only match against articles that HAVE an embedding
    articles.embedding IS NOT NULL
    -- The core similarity calculation and filtering
    AND 1 - (articles.embedding <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    result_limit;
$$; 
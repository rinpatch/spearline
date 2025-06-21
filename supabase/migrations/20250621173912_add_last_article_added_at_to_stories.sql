-- Add last_article_added_at field to stories table
ALTER TABLE stories ADD COLUMN last_article_added_at TIMESTAMPTZ;

-- Add comment to explain the new field
COMMENT ON COLUMN stories.last_article_added_at IS 'Timestamp of when the most recent article was added to this story';

-- Create index for efficient querying by last article added time
CREATE INDEX idx_stories_last_article_added_at ON stories(last_article_added_at DESC);

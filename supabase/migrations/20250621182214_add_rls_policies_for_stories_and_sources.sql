-- Enable RLS on stories and sources tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view stories
CREATE POLICY "Allow public read access to stories" ON stories
    FOR SELECT USING (true);

-- Create policy to allow everyone to view sources  
CREATE POLICY "Allow public read access to sources" ON sources
    FOR SELECT USING (true);

-- Comments explaining the policies
COMMENT ON POLICY "Allow public read access to stories" ON stories IS 'Allows anyone to read stories data for the public homepage';
COMMENT ON POLICY "Allow public read access to sources" ON sources IS 'Allows anyone to read sources data for displaying news source information';

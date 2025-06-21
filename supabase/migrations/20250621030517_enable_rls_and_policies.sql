-- RLS (Row-Level Security) Policies
--
-- This file enables RLS on the core tables and sets up the necessary
-- policies for the application to function securely.
--
-- Principle: Deny by default. Access is only granted explicitly.
-- The backend uses the service_role key, which bypasses these checks.
-- These policies are for clients using the anon or authenticated keys (e.g., the web app).

-- 1. Enable RLS on all relevant tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for public read access to articles
-- This allows anyone (e.g., visitors on the website) to read articles.
-- It does NOT allow them to insert, update, or delete.
CREATE POLICY "Allow public read-only access to articles"
ON public.articles
FOR SELECT
USING (true);

-- No other policies are needed for the `sources` or `stories` tables,
-- as they should only be accessed and modified by the backend via the
-- service_role key, which bypasses RLS.

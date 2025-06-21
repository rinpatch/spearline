import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and service role key must be defined in environment variables for backend client.');
}

/**
 * A Supabase client specifically for backend operations, using the service role key.
 * This client has admin privileges and bypasses Row Level Security.
 * DO NOT expose this client or its keys to the frontend.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey); 
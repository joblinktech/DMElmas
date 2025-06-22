import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These environment variables will be set after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url' && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseAnonKey !== 'your-actual-anon-key-here' &&
  isValidUrl(supabaseUrl);

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase not configured properly. Please update your .env file with actual Supabase credentials.');
  console.warn('Instructions:');
  console.warn('1. Go to https://supabase.com and create a project');
  console.warn('2. Go to Settings → API in your Supabase dashboard');
  console.warn('3. Copy your Project URL and anon key to the .env file');
  console.warn('4. Restart your development server');
}

// Create a mock client if credentials are not valid to prevent app crash
export const supabase = hasValidCredentials 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasValidCredentials;
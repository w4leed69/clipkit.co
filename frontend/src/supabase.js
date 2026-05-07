import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  supabaseAnonKey.length > 20;

// Return a no-op stub when credentials aren't set so the app still renders
const noop = () => Promise.resolve({ data: null, error: null });
const stub = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: noop,
    signUp: noop,
    signInWithOAuth: noop,
    signOut: noop,
  },
  from: () => ({
    select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }) }),
    insert: noop,
    delete: () => ({ eq: noop }),
  }),
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : stub;

export const supabaseReady = isConfigured;

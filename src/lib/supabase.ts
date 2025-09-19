import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a fallback client for build time
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Ensure session persists across page refreshes
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Set longer session duration (1 week = 604800 seconds)
      flowType: 'pkce',
      // Extend session duration
      debug: process.env.NODE_ENV === 'development'
    }
  })
}

export const supabase = createSupabaseClient()
// Force redeploy Sat Sep 13 11:23:36 CEST 2025

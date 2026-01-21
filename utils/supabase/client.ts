import { createBrowserClient } from '@supabase/ssr'

// 1. This is for components that need a fresh client
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// 2. This is the "exported member" your login page is looking for
export const supabase = createClient()
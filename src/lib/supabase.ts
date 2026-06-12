// Supabase client helpers — import the right factory for each execution context.
//
//  Client Component  → createBrowserClient(url, anonKey)
//  Server Component  → createSupabaseServerClient(cookieStore)
//  Route Handler     → createSupabaseServerClient(cookieStore)
//  Middleware        → see src/middleware.ts for the inline pattern

import { createBrowserClient, createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — call inside Client Components
export function createSupabaseBrowserClient() {
  return createBrowserClient(url, anonKey)
}

// Server client — call inside Server Components and Route Handlers
export async function createSupabaseServerClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern - cria o client uma única vez
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseClient
}

// Para uso em casos onde precisa resetar (ex: logout)
export function resetClient() {
  supabaseClient = null
}

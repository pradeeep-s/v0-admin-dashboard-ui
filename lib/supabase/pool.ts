import { createServerClient, type SupabaseClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Connection pool singleton - reused across requests
let pooledClient: SupabaseClient | null = null

/**
 * Get a pooled Supabase client instance
 * Reuses the same client connection across multiple requests for better performance
 * This is more efficient than creating a new client on every request
 */
export async function getPooledClient(): Promise<SupabaseClient> {
  // If we already have a pooled client, return it
  if (pooledClient) {
    return pooledClient
  }

  // Create a new pooled client if none exists
  const cookieStore = await cookies()

  pooledClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Silently catch - can be ignored with proxy refreshing
          }
        },
      },
    },
  )

  return pooledClient
}

/**
 * Reset the connection pool
 * Useful for testing or when you need a fresh connection
 */
export function resetPool(): void {
  pooledClient = null
}

/**
 * Get connection statistics (for monitoring)
 */
export function getPoolStats() {
  return {
    connected: pooledClient !== null,
    reusable: true,
    timestamp: new Date().toISOString(),
  }
}

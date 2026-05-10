import { createClient } from './server'
import { redirect } from 'next/navigation'
import type { AuthUser } from '@/types/database'
import { cache } from 'react'

/**
 * Centralized, memoized user fetcher.
 * Uses React.cache to ensure that multiple calls within the same request
 * only result in a single Supabase query.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()
  
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone, avatar_url, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null

    return {
      id: user.id,
      email: user.email,
      profile: profile as any, // Temporary cast until DB types are generated
    }
  } catch (err) {
    console.error('[AuthHelpers] Unexpected error:', err)
    return null
  }
})

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.profile.role)) {
    redirect('/unauthorized')
  }
  return user
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AuthUser, UserRole } from '@/types/database'
import { cache } from 'react'

/**
 * Verifies the current request user is authenticated AND has one of the allowed roles.
 * Memoized using React.cache to avoid redundant DB calls in a single render.
 */
export const verifyRole = cache(async (allowedRoles: UserRole[]): Promise<AuthUser> => {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect('/unauthorized')
  }

  return {
    id: user.id,
    email: user.email,
    profile: profile as AuthUser['profile'],
  }
})

/**
 * Require admin role — use at the top of admin Server Actions.
 */
export async function requireAdmin(): Promise<AuthUser> {
  return verifyRole(['admin'])
}

/**
 * Require pharmacist OR admin role.
 */
export async function requirePharmacist(): Promise<AuthUser> {
  return verifyRole(['pharmacist', 'admin'])
}

/**
 * Require any authenticated user.
 */
export async function requireCustomer(): Promise<AuthUser> {
  return verifyRole(['customer', 'admin', 'pharmacist'])
}

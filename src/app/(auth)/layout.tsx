import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/database'

function getRoleRedirect(role: UserRole): string {
  if (role === 'admin') return '/admin'
  if (role === 'pharmacist') return '/pharmacist'
  return '/dashboard'
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    redirect(getRoleRedirect((profile?.role as UserRole) ?? 'customer'))
  }

  return <>{children}</>
}

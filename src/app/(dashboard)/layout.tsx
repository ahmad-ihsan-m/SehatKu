import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import MobileNav from '@/components/layout/mobile-nav'
import AuthStoreHydrator from '@/components/auth-store-hydrator'

async function getInitialNotifications(userId: string) {
  const supabase = await createClient()

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count ?? 0
}

import Navbar from '@/components/layout/navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const unreadNotifications = await getInitialNotifications(user.id)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AuthStoreHydrator user={user} />

      {/* Desktop sidebar */}
      <Sidebar
        user={user}
        initialUnreadNotifications={unreadNotifications}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-muted/5">
        {/* Top Navbar for Desktop/Mobile */}
        <Navbar user={user} />

        {/* Mobile top nav (legacy toggle - might need merging later) */}
        <MobileNav
          user={user}
          initialUnreadNotifications={unreadNotifications}
        />

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

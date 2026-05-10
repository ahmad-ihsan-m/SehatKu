import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getNotifications } from '@/features/notifications/queries'
import { Bell, CheckCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NotificationsList } from '@/features/notifications/components/notifications-list'

export default async function NotificationsPage() {
  const user = await requireAuth()
  const notifications = await getNotifications(user.id)
  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifikasi
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau pembaruan status pesanan dan informasi penting lainnya.
          </p>
        </div>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  )
}

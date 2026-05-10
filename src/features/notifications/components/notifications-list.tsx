'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Clock, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { markAsReadAction, markAllAsReadAction } from '@/features/notifications/actions'
import { toast } from 'sonner'
import type { Notification } from '@/types/database'
import { cn } from '@/lib/utils'

interface NotificationsListProps {
  initialNotifications: Notification[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isUpdating, setIsUpdating] = useState(false)

  const unreadCount = notifications.filter(n => !n.is_read).length

  async function handleMarkAllAsRead() {
    setIsUpdating(true)
    const result = await markAllAsReadAction()
    if (result.success) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      toast.success('Semua notifikasi ditandai telah dibaca')
    } else {
      toast.error(result.error)
    }
    setIsUpdating(false)
  }

  async function handleMarkAsRead(notificationId: string) {
    const result = await markAsReadAction(notificationId)
    if (result.success) {
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={isUpdating}
            className="text-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            Tandai semua dibaca
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">Belum ada notifikasi</p>
            <p className="text-xs text-muted-foreground mt-1">Kami akan mengabari Anda jika ada pembaruan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              className={cn(
                "group relative p-4 rounded-xl border transition-all cursor-pointer",
                !notif.is_read 
                  ? "bg-primary/5 border-primary/20 shadow-sm" 
                  : "bg-card border-border hover:bg-muted/50"
              )}
            >
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  !notif.is_read ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={cn(
                      "text-sm font-semibold",
                      !notif.is_read ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs mt-1 leading-relaxed",
                    !notif.is_read ? "text-foreground/80" : "text-muted-foreground"
                  )}>
                    {notif.message}
                  </p>
                </div>
              </div>
              {!notif.is_read && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

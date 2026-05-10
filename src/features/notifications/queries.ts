import { createClient } from '@/lib/supabase/server'
import type { Notification } from '@/types/database'

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Notification[]
}

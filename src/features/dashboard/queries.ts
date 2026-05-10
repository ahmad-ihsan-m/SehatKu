import { createClient } from '@/lib/supabase/server'
import type { Order, Notification } from '@/types/database'

export async function getDashboardStats(userId: string) {
  const supabase = await createClient()

  const [ordersResult, cartResult, prescriptionsResult, notifResult] =
    await Promise.all([
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('carts')
        .select('cart_items(quantity)')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('prescriptions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending'),
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false),
    ])

  const cartCount =
    (cartResult.data?.cart_items as Array<{ quantity: number }> | null)?.reduce(
      (sum, item) => sum + item.quantity,
      0
    ) ?? 0

  return {
    totalOrders: ordersResult.count ?? 0,
    cartItems: cartCount,
    pendingPrescriptions: prescriptionsResult.count ?? 0,
    unreadNotifications: notifResult.count ?? 0,
  }
}

export async function getRecentOrders(userId: string, limit = 3) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      total_amount,
      shipping_address,
      created_at,
      updated_at,
      order_items (
        quantity,
        price_at_time,
        medicines ( name )
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data as unknown) as (Order & {
    order_items: Array<{
      quantity: number
      price_at_time: number
      medicines: { name: string } | null
    }>
  })[]
}

export async function getRecentNotifications(userId: string, limit = 3) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data as Notification[]
}

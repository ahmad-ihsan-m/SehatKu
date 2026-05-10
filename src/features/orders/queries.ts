import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

export interface OrderListItem {
  id: string
  status: OrderStatus
  payment_status: string
  total_amount: number
  shipping_address: string
  created_at: string
  updated_at: string
  order_items: Array<{
    id: string
    quantity: number
    price_at_time: number
    medicines: { id: string; name: string; image_url: string | null } | null
  }>
  payments: { 
    status: string; 
    payment_method: string | null;
    snap_token: string | null;
    transaction_id: string | null;
  } | null
}

export async function getOrders(userId: string): Promise<OrderListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      payment_status,
      total_amount,
      shipping_address,
      created_at,
      updated_at,
      order_items (
        id,
        quantity,
        price_at_time,
        medicines ( id, name, image_url )
      ),
      payments ( status, payment_method, snap_token, transaction_id )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as unknown) as OrderListItem[]
}

export async function getOrderById(
  userId: string,
  orderId: string
): Promise<OrderListItem | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      payment_status,
      total_amount,
      shipping_address,
      created_at,
      updated_at,
      order_items (
        id,
        quantity,
        price_at_time,
        medicines ( id, name, image_url )
      ),
      payments ( status, payment_method, snap_token, transaction_id )
    `
    )
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return (data as unknown) as OrderListItem
}

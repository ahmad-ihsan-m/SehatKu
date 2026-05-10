'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/database'

export async function cancelOrderAction(orderId: string): Promise<ActionResult> {
  if (!orderId) return { error: 'ID pesanan tidak valid' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Silakan login terlebih dahulu' }

  // Verify the order belongs to the user and is still pending
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) return { error: 'Pesanan tidak ditemukan' }
  if (order.status !== 'pending') {
    return { error: 'Pesanan hanya bisa dibatalkan saat masih pending' }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)

  if (error) return { error: 'Gagal membatalkan pesanan' }

  // Also update payment status
  await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('order_id', orderId)

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

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

  // Restore stock if it was previously deducted (idempotent — safe if stock_deducted = false)
  const { data: restoreData, error: rpcError } = await supabase
    .rpc('restore_order_stock', { p_order_id: orderId })

  if (rpcError) {
    console.error('[cancelOrderAction] restore_order_stock error:', rpcError)
    // Don't block cancellation for stock restore failures
  } else {
    const result = restoreData as { success: boolean; restored?: boolean }
    if (result.restored) {
      console.log(`[cancelOrderAction] Stock restored for order ${orderId}`)
    }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)

  if (error) return { error: 'Gagal membatalkan pesanan' }

  await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('order_id', orderId)

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

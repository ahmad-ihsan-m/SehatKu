import { createClient } from '@/lib/supabase/server'
import type { WebhookPayload } from './types'

/**
 * Core logic to process Midtrans Webhook notifications.
 * This is isolated from the API Route to be testable and reusable.
 */
export async function processMidtransWebhook(payload: WebhookPayload) {
  const {
    order_id,
    transaction_status,
    payment_type,
    transaction_id,
    fraud_status,
    settlement_time,
    expiry_time,
  } = payload

  const supabase = await createClient()

  // 1. Map Midtrans status to our internal system
  let paymentStatus: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' = 'pending'
  let orderStatus: string = 'pending'

  switch (transaction_status) {
    case 'capture':
    case 'settlement':
      if (fraud_status === 'challenge') {
        paymentStatus = 'pending'
      } else {
        paymentStatus = 'paid'
        orderStatus = 'processing'
      }
      break
    case 'deny':
    case 'cancel':
      paymentStatus = 'failed'
      orderStatus = 'cancelled'
      break
    case 'expire':
      paymentStatus = 'expired'
      orderStatus = 'cancelled'
      break
    case 'pending':
      paymentStatus = 'pending'
      orderStatus = 'pending'
      break
    case 'refund':
    case 'partial_refund':
      paymentStatus = 'refunded'
      orderStatus = 'cancelled'
      break
  }

  console.log(`[PaymentWebhook] Order: ${order_id}, Status: ${paymentStatus}, OrderStatus: ${orderStatus}`)

  // 2. Atomic Database Updates
  // Update Payment Record
  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: paymentStatus,
      payment_method: payment_type,
      transaction_id: transaction_id,
      fraud_status: fraud_status,
      paid_at: settlement_time || (paymentStatus === 'paid' ? new Date().toISOString() : null),
      expired_at: expiry_time || null,
      metadata: { midtrans_raw: payload }
    })
    .eq('order_id', order_id)

  if (paymentError) throw paymentError

  // 3. Update Order Record (Sync payment_status)
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: orderStatus as any,
      payment_status: paymentStatus
    })
    .eq('id', order_id)

  if (orderError) throw orderError

  // 4. Stock Recovery Logic
  if (orderStatus === 'cancelled') {
    const { data: items } = await supabase
      .from('order_items')
      .select('medicine_id, quantity')
      .eq('order_id', order_id)

    if (items) {
      for (const item of items) {
        // Safe stock restoration using RPC
        await supabase.rpc('increment_stock', { 
          medicine_id: item.medicine_id, 
          amount: item.quantity 
        })
      }
    }
    
    // Notify user about cancellation
    await supabase.from('notifications').insert({
      user_id: (await supabase.from('orders').select('user_id').eq('id', order_id).single()).data?.user_id,
      title: 'Pesanan Dibatalkan',
      message: `Pesanan #${order_id.slice(0, 8).toUpperCase()} dibatalkan karena pembayaran ${paymentStatus === 'expired' ? 'kedaluwarsa' : 'gagal'}.`,
    })
  } else if (paymentStatus === 'paid') {
     // Notify user about success
     const { data: orderData } = await supabase.from('orders').select('user_id').eq('id', order_id).single()
     if (orderData) {
       await supabase.from('notifications').insert({
         user_id: orderData.user_id,
         title: 'Pembayaran Berhasil',
         message: `Terima kasih! Pembayaran untuk pesanan #${order_id.slice(0, 8).toUpperCase()} telah kami terima.`,
       })
     }
  }

  return { success: true, paymentStatus, orderStatus }
}

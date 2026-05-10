'use server'

import { createClient } from '@/lib/supabase/server'
import { requireCustomer } from '@/lib/auth/guards'
import { createMidtransTransaction } from './midtrans'
import type { ActionResult } from '@/types/database'
import { revalidatePath } from 'next/cache'

/**
 * Initializes or refreshes a Midtrans payment transaction for an existing order.
 */
export async function initializePaymentAction(orderId: string): Promise<ActionResult & { snapToken?: string }> {
  try {
    const user = await requireCustomer()
    const supabase = await createClient()

    // 1. Fetch Order and Items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, 
        total_amount, 
        status,
        user_id,
        shipping_address,
        profiles (full_name),
        order_items (
          quantity,
          price_at_time,
          medicines (id, name)
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('[PaymentAction] Order Retrieval Error:', orderError.message)
      return { error: `Gagal memproses pesanan: ${orderError.message}` }
    }

    if (!order) {
      console.warn(`[PaymentAction] Order ${orderId} not found for user ${user.id}`)
      return { error: 'Pesanan tidak ditemukan atau Anda tidak memiliki akses.' }
    }

    // Security: Ensure the user owns this order
    if (order.user_id !== user.id) {
      return { error: 'Akses ditolak' }
    }

    // Only allow payment for pending orders
    if (order.status !== 'pending' && order.status !== 'awaiting_payment') {
      return { error: `Pesanan ini sudah berstatus ${order.status}` }
    }

    // 2. Prepare Midtrans Params
    const customerDetails = {
      first_name: (order.profiles as any)?.full_name || 'Pelanggan',
      email: user.email || '',
      shipping_address: {
        first_name: (order.profiles as any)?.full_name || 'Pelanggan',
        address: order.shipping_address,
      }
    }

    const itemDetails = (order.order_items as any[]).map((item) => ({
      id: item.medicines.id,
      price: item.price_at_time,
      quantity: item.quantity,
      name: item.medicines.name,
    }))

    // 3. Create Midtrans Transaction
    const midtransResponse = await createMidtransTransaction({
      transaction_details: {
        order_id: order.id,
        gross_amount: order.total_amount,
      },
      customer_details: customerDetails,
      item_details: itemDetails,
      expiry: {
        unit: 'hours',
        duration: 24, // 24 hours to pay
      }
    })

    // 4. Update Payment Record in Supabase
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        snap_token: midtransResponse.token,
        snap_redirect_url: midtransResponse.redirect_url,
        user_id: user.id,
        amount: order.total_amount,
        status: 'pending'
      })
      .eq('order_id', orderId)

    if (paymentError) {
      console.error('[PaymentAction] Update Error:', paymentError.message)
      return { error: 'Gagal memperbarui data pembayaran' }
    }

    revalidatePath(`/orders/${orderId}`)
    return { success: true, snapToken: midtransResponse.token }
  } catch (err: any) {
    console.error('[PaymentAction] Unexpected Error:', err.message)
    return { error: err.message || 'Terjadi kesalahan saat memproses pembayaran' }
  }
}

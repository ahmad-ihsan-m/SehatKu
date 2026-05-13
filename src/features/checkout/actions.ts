'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireCustomer } from '@/lib/auth/guards'
import type { ActionResult } from '@/types/database'
import { initializePaymentAction } from '@/features/payments/actions'

export async function checkoutAction(formData: FormData): Promise<ActionResult & { snapToken?: string }> {
  const shippingAddress = formData.get('shippingAddress') as string

  if (!shippingAddress || shippingAddress.trim().length < 10) {
    return { error: 'Alamat pengiriman minimal 10 karakter' }
  }

  const user = await requireCustomer()
  const supabase = await createClient()

  // Get user's cart with items
  const { data: cart } = await supabase
    .from('carts')
    .select(
      `
      id,
      cart_items (
        id,
        medicine_id,
        quantity,
        medicines ( id, name, price, stock, requires_prescription )
      )
    `
    )
    .eq('user_id', user.id)
    .single()

  if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    return { error: 'Keranjang Anda kosong' }
  }

  const items = (cart.cart_items as unknown) as Array<{
    id: string
    medicine_id: string
    quantity: number
    medicines: { id: string; name: string; price: number; stock: number; requires_prescription: boolean } | null
  }>

  // 2. Validate stock and prescription requirements
  let lastPrescriptionId: string | null = null
  
  for (const item of items) {
    if (!item.medicines) {
      return { error: 'Salah satu obat tidak ditemukan' }
    }
    if (item.quantity > item.medicines.stock) {
      return { error: `Stok tidak cukup untuk obat: ${item.medicines.name}` }
    }
    
    // PER-MEDICINE PRESCRIPTION CHECK
    if (item.medicines.requires_prescription) {
      const { data: approvedRx } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('medicine_id', item.medicine_id) // Strict medicine link
        .eq('status', 'approved')
        .limit(1)
        .single()

      if (!approvedRx) {
        return { 
          error: `Pesanan Anda berisi obat keras (${item.medicines.name}) yang membutuhkan resep dokter yang sudah disetujui apoteker.` 
        }
      }
      lastPrescriptionId = approvedRx.id
    }
  }

  // Calculate total
  const totalAmount = items.reduce(
    (total, item) => total + (item.medicines!.price * item.quantity),
    0
  )

  // 1. Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      prescription_id: lastPrescriptionId,
      status: 'pending',
      total_amount: totalAmount,
      shipping_address: shippingAddress.trim(),
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { error: 'Gagal membuat pesanan' }
  }

  // 2. Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    medicine_id: item.medicine_id,
    quantity: item.quantity,
    price_at_time: item.medicines!.price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return { error: 'Gagal membuat item pesanan' }
  }

  // 3. Create initial payment record
  await supabase.from('payments').insert({
    order_id: order.id,
    user_id: user.id,
    status: 'pending',
    amount: totalAmount,
  })

  // Stock is intentionally NOT deducted at checkout.
  // Deduction happens atomically when order status → 'delivered' via deduct_order_stock().
  // This prevents phantom stock reservations from unpaid orders.

  // 4. Clear cart
  await supabase.from('cart_items').delete().eq('cart_id', cart.id)

  // 5. Create notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Pesanan Dibuat',
    message: `Segera selesaikan pembayaran untuk pesanan #${order.id.slice(0, 8).toUpperCase()}`,
  })

  // 6. Initialize Midtrans Payment
  const paymentResult = await initializePaymentAction(order.id)

  revalidatePath('/cart')
  revalidatePath('/orders')
  
  if (paymentResult.error) {
    // Order was created but payment could not be initialized.
    // Return error so client can surface this; order stays as 'pending' for retry.
    return { error: `Pesanan dibuat namun pembayaran gagal dimulai: ${paymentResult.error}` }
  }

  return { success: true, snapToken: paymentResult.snapToken }
}

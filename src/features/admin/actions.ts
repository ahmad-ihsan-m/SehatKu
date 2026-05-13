'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/guards'
import type { ActionResult, UserRole, OrderStatus } from '@/types/database'
import type { MedicineFormValues } from './schemas'

export async function createMedicineAction(values: MedicineFormValues): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('medicines')
    .insert({
      ...values,
      is_active: true
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/medicines')
  revalidatePath('/medicines')
  return { success: true }
}

export async function updateMedicineAction(id: string, values: MedicineFormValues): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('medicines')
    .update(values)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/medicines')
  revalidatePath('/medicines')
  return { success: true }
}

export async function deleteMedicineAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  // Soft delete instead of hard delete to maintain order integrity
  const { error } = await supabase
    .from('medicines')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/medicines')
  revalidatePath('/medicines')
  return { success: true }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  // ── Stock deduction: only when order is finalized as delivered ──
  if (status === 'delivered') {
    const { data, error: rpcError } = await supabase
      .rpc('deduct_order_stock', { p_order_id: orderId })

    if (rpcError) {
      console.error('[updateOrderStatusAction] deduct_order_stock RPC error:', rpcError)
      return { error: `Gagal memproses stok: ${rpcError.message}` }
    }

    const result = data as { success: boolean; error?: string; already_deducted?: boolean }

    if (!result.success) {
      // Stock insufficient — block status change, surface clear error to admin
      return { error: result.error ?? 'Stok tidak mencukupi, status tidak dapat diubah ke Selesai.' }
    }

    if (result.already_deducted) {
      console.log(`[updateOrderStatusAction] Order ${orderId}: stock already deducted, skipping.`)
    }
  }

  // ── Stock restoration: when admin manually cancels a delivered order ──
  if (status === 'cancelled') {
    const { data, error: rpcError } = await supabase
      .rpc('restore_order_stock', { p_order_id: orderId })

    if (rpcError) {
      // Log but don't block cancellation — restored stock is a best-effort
      console.error('[updateOrderStatusAction] restore_order_stock RPC error:', rpcError)
    } else {
      const result = data as { success: boolean; restored?: boolean }
      if (result.restored) {
        console.log(`[updateOrderStatusAction] Order ${orderId}: stock restored on cancellation.`)
      }
    }
  }

  // ── Update order status ──
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) return { error: error.message }

  // ── Sync payment status on delivery ──
  if (status === 'delivered') {
    await supabase
      .from('payments')
      .update({ status: 'paid' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

export async function updateUserRoleAction(userId: string, role: UserRole): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

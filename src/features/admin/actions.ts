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
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) return { error: error.message }

  // If status is delivered, also update payment if pending
  if (status === 'delivered') {
    await supabase.from('payments').update({ status: 'paid' }).eq('order_id', orderId).eq('status', 'pending')
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

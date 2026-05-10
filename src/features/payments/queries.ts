import { createClient } from '@/lib/supabase/server'
import type { Payment } from './types'

/**
 * Fetches all payments for the admin dashboard.
 */
export async function getAllPayments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      profiles (full_name, email),
      orders (id, status)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

/**
 * Fetches payment details for a specific order.
 */
export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error || !data) return null
  return data as Payment
}

/**
 * Gets payment statistics for admin overview.
 */
export async function getPaymentStats() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status')

  if (!payments) return { totalPaid: 0, pendingAmount: 0 }

  return payments.reduce(
    (acc, p) => {
      if (p.status === 'paid') acc.totalPaid += Number(p.amount)
      if (p.status === 'pending') acc.pendingAmount += Number(p.amount)
      return acc
    },
    { totalPaid: 0, pendingAmount: 0 }
  )
}

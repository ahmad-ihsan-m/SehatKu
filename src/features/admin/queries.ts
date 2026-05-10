import { createClient } from '@/lib/supabase/server'
import type { OrderListItem } from '@/features/orders/queries'
import type { Profile, MedicineWithCategory } from '@/types/database'

export async function getAdminStats() {
  const supabase = await createClient()

  const [ordersStats, usersCount, revenueResult, pendingRxCount, activeMedicinesCount, lowStockCount] = await Promise.all([
    supabase.from('orders').select('id, status', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'paid'),
    supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('medicines').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('medicines').select('id', { count: 'exact', head: true }).lte('stock', 10).gt('stock', 0).eq('is_active', true)
  ])

  const totalRevenue = revenueResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0
  const pendingOrders = ordersStats.data?.filter(o => o.status === 'pending').length ?? 0

  return {
    totalOrders: ordersStats.count ?? 0,
    totalUsers: usersCount.count ?? 0,
    totalRevenue,
    pendingPrescriptions: pendingRxCount.count ?? 0,
    activeMedicines: activeMedicinesCount.count ?? 0,
    lowStockMedicines: lowStockCount.count ?? 0,
    pendingOrders
  }
}


export async function getAllOrders(): Promise<OrderListItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, status, payment_status, total_amount, shipping_address, created_at, updated_at,
      order_items ( id, quantity, price_at_time, medicines ( id, name, image_url ) ),
      payments ( status, payment_method, transaction_id, snap_token ),
      profiles ( full_name )
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as unknown as OrderListItem[]
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Profile[]
}

export interface MedicineFilters {
  search?: string
  categoryId?: string
  stockStatus?: 'low' | 'out' | 'available'
  isActive?: boolean
  page?: number
  pageSize?: number
}

export async function getAllMedicines(filters: MedicineFilters = {}): Promise<{
  medicines: MedicineWithCategory[]
  total: number
}> {
  const { 
    search, 
    categoryId, 
    stockStatus, 
    isActive,
    page = 1,
    pageSize = 10 
  } = filters

  const supabase = await createClient()
  
  let query = supabase
    .from('medicines')
    .select('*, categories(*)', { count: 'exact' })

  // Filters
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }
  if (isActive !== undefined) {
    query = query.eq('is_active', isActive)
  }

  // Stock filters
  if (stockStatus === 'low') {
    query = query.lte('stock', 10).gt('stock', 0)
  } else if (stockStatus === 'out') {
    query = query.eq('stock', 0)
  } else if (stockStatus === 'available') {
    query = query.gt('stock', 10)
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('name')
    .range(from, to)

  if (error) return { medicines: [], total: 0 }
  
  return {
    medicines: data as unknown as MedicineWithCategory[],
    total: count ?? 0
  }
}

import type { Category } from '@/types/database'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) return []
  return data as Category[]
}


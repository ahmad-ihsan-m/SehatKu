import { createClient } from '@/lib/supabase/server'
import type { Category, MedicineWithCategory } from '@/types/database'

export interface PublicMedicineFilters {
  search?: string
  categoryId?: string
  page?: number
  pageSize?: number
}

export async function getMedicines(filters: PublicMedicineFilters = {}): Promise<{
  medicines: MedicineWithCategory[]
  total: number
}> {
  const { 
    search, 
    categoryId, 
    page = 1, 
    pageSize = 12 
  } = filters

  const supabase = await createClient()

  let query = supabase
    .from('medicines')
    .select(
      `
      id,
      category_id,
      name,
      description,
      price,
      stock,
      requires_prescription,
      image_url,
      created_at,
      updated_at,
      categories ( id, name, description, created_at, updated_at )
    `,
      { count: 'exact' }
    )
    .eq('is_active', true)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('name')
    .range(from, to)

  if (error) return { medicines: [], total: 0 }
  return {
    medicines: (data as unknown) as MedicineWithCategory[],
    total: count ?? 0
  }
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description, created_at, updated_at')
    .order('name')

  if (error) return []
  return data as Category[]
}

export async function getMedicineById(
  id: string
): Promise<MedicineWithCategory | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('medicines')
    .select(
      `
      id,
      category_id,
      name,
      description,
      price,
      stock,
      requires_prescription,
      image_url,
      created_at,
      updated_at,
      categories ( id, name, description, created_at, updated_at )
    `
    )
    .eq('id', id)
    .single()

  if (error) return null
  return (data as unknown) as MedicineWithCategory
}

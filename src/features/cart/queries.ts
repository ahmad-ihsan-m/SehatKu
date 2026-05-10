import { createClient } from '@/lib/supabase/server'
import type { CartItemWithMedicine } from '@/types/database'

export async function getCartItems(userId: string): Promise<CartItemWithMedicine[]> {
  const supabase = await createClient()

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!cart) return []

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      cart_id,
      medicine_id,
      quantity,
      created_at,
      updated_at,
      medicines (
        id,
        name,
        price,
        stock,
        requires_prescription,
        image_url
      )
    `
    )
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: true })

  if (error) return []
  return (data as unknown) as CartItemWithMedicine[]
}

export async function getOrCreateCart(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (error || !created) return null
  return created.id
}

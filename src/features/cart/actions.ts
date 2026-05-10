'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getOrCreateCart } from './queries'
import { requireCustomer } from '@/lib/auth/guards'
import { getApprovedPrescription } from '@/features/prescriptions/queries'
import type { ActionResult } from '@/types/database'

export async function addToCartAction(
  medicineId: string,
  quantity: number = 1
): Promise<ActionResult> {
  if (!medicineId) return { error: 'ID obat tidak valid' }
  if (quantity < 1) return { error: 'Jumlah minimal 1' }

  const user = await requireCustomer()
  const supabase = await createClient()

  // Validate medicine exists and has enough stock
  const { data: medicine } = await supabase
    .from('medicines')
    .select('id, name, stock, requires_prescription')
    .eq('id', medicineId)
    .single()

  if (!medicine) return { error: 'Obat tidak ditemukan' }
  if (medicine.stock < quantity) return { error: 'Stok tidak mencukupi' }
  
  if (medicine.requires_prescription) {
    const approvedRx = await getApprovedPrescription(user.id, medicineId)
    if (!approvedRx) {
      return { 
        error: `Obat ${medicine.name} memerlukan resep dokter yang sudah disetujui apoteker untuk ditambahkan ke keranjang.` 
      }
    }
  }

  const cartId = await getOrCreateCart(user.id)
  if (!cartId) return { error: 'Gagal membuat keranjang' }

  // Check if item already in cart
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('medicine_id', medicineId)
    .single()

  if (existing) {
    const newQty = existing.quantity + quantity
    if (newQty > medicine.stock) {
      return { error: `Stok tersedia hanya ${medicine.stock}` }
    }
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existing.id)

    if (error) return { error: 'Gagal mengupdate keranjang' }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, medicine_id: medicineId, quantity })

    if (error) return { error: 'Gagal menambahkan ke keranjang' }
  }

  revalidatePath('/cart')
  revalidatePath('/(dashboard)', 'layout')
  return { success: true }
}

export async function updateCartItemAction(
  cartItemId: string,
  quantity: number
): Promise<ActionResult> {
  if (quantity < 0) return { error: 'Jumlah tidak valid' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Silakan login terlebih dahulu' }

  if (quantity === 0) {
    return removeFromCartAction(cartItemId)
  }

  // Validate stock before update
  const { data: item } = await supabase
    .from('cart_items')
    .select('medicines(stock)')
    .eq('id', cartItemId)
    .single()

  const raw = item?.medicines as unknown
  let stock = 0
  if (Array.isArray(raw) && raw.length > 0) {
    stock = (raw[0] as { stock: number }).stock
  } else if (raw && typeof raw === 'object') {
    stock = (raw as { stock: number }).stock
  }
  if (quantity > stock) return { error: `Stok tersedia hanya ${stock}` }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)

  if (error) return { error: 'Gagal mengupdate jumlah' }

  revalidatePath('/cart')
  return { success: true }
}

export async function removeFromCartAction(
  cartItemId: string
): Promise<ActionResult> {
  if (!cartItemId) return { error: 'ID item tidak valid' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Silakan login terlebih dahulu' }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) return { error: 'Gagal menghapus item' }

  revalidatePath('/cart')
  revalidatePath('/(dashboard)', 'layout')
  return { success: true }
}

export async function clearCartAction(): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Silakan login terlebih dahulu' }

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: true }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)

  if (error) return { error: 'Gagal mengosongkan keranjang' }

  revalidatePath('/cart')
  revalidatePath('/(dashboard)', 'layout')
  return { success: true }
}

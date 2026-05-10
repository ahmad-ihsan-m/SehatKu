'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import type { CartItemWithMedicine } from '@/types/database'

interface CartInitializerProps {
  items: CartItemWithMedicine[]
}

export function CartInitializer({ items }: CartInitializerProps) {
  const setItems = useCartStore((s) => s.setItems)

  useEffect(() => {
    setItems(items)
  }, [items, setItems])

  return null
}

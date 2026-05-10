import { create } from 'zustand'
import type { CartItemWithMedicine } from '@/types/database'

interface CartState {
  items: CartItemWithMedicine[]
  isLoading: boolean
  snapshot: CartItemWithMedicine[] | null // For rollbacks
  setItems: (items: CartItemWithMedicine[]) => void
  setIsLoading: (loading: boolean) => void
  
  // Optimistic Actions
  optimisticAddItem: (item: CartItemWithMedicine) => void
  optimisticUpdateItem: (cartItemId: string, quantity: number) => void
  optimisticRemoveItem: (cartItemId: string) => void
  
  // Stability Actions
  createSnapshot: () => void
  rollback: () => void
  commit: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  snapshot: null,

  setItems: (items) => set({ items, snapshot: null }),
  setIsLoading: (isLoading) => set({ isLoading }),

  createSnapshot: () => set({ snapshot: get().items }),
  
  rollback: () => {
    const { snapshot } = get()
    if (snapshot) {
      set({ items: snapshot, snapshot: null })
    }
  },

  commit: () => set({ snapshot: null }),

  optimisticAddItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.medicine_id === item.medicine_id
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.medicine_id === item.medicine_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        }
      }
      return { items: [...state.items, item] }
    }),

  optimisticUpdateItem: (cartItemId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.id !== cartItemId)
          : state.items.map((i) =>
              i.id === cartItemId ? { ...i, quantity } : i
            ),
    })),

  optimisticRemoveItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== cartItemId),
    })),
}))

export function useCartTotal() {
  const items = useCartStore((s) => s.items)
  return items.reduce(
    (total, item) => total + item.medicines.price * item.quantity,
    0
  )
}

export function useCartCount() {
  const items = useCartStore((s) => s.items)
  return items.reduce((count, item) => count + item.quantity, 0)
}

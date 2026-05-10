'use client'

import { useState, useTransition } from 'react'
import { Minus, Plus, Trash2, Pill, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateCartItemAction, removeFromCartAction } from '@/features/cart/actions'
import { useCartStore } from '@/store/cart'
import { toast } from 'sonner'
import type { CartItemWithMedicine } from '@/types/database'

interface CartItemRowProps {
  item: CartItemWithMedicine
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function CartItemRow({ item }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition()
  const [localQuantity, setLocalQuantity] = useState(item.quantity)
  const updateItem = useCartStore((s) => s.optimisticUpdateItem)
  const removeItem = useCartStore((s) => s.optimisticRemoveItem)

  const medicine = item.medicines
  const subtotal = medicine.price * localQuantity

  function handleQuantityChange(newQty: number) {
    if (newQty < 1 || newQty > medicine.stock) return
    const prev = localQuantity
    setLocalQuantity(newQty)
    updateItem(item.id, newQty)

    startTransition(async () => {
      const result = await updateCartItemAction(item.id, newQty)
      if (result.error) {
        toast.error(result.error)
        setLocalQuantity(prev)
        updateItem(item.id, prev)
      }
    })
  }

  function handleRemove() {
    removeItem(item.id)
    startTransition(async () => {
      const result = await removeFromCartAction(item.id)
      if (result.error) {
        toast.error(result.error)
        // Re-add item on failure (simplified: just show error)
      } else {
        toast.success('Item dihapus dari keranjang')
      }
    })
  }

  return (
    <div className={`flex gap-3 p-4 ${isPending ? 'opacity-60' : ''} transition-opacity`}>
      {/* Product image */}
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {medicine.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={medicine.image_url}
            alt={medicine.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Pill className="w-6 h-6 text-muted-foreground/50" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
              {medicine.name}
            </h3>
            {medicine.requires_prescription && (
              <Badge variant="warning" className="mt-1 text-[10px]">
                <AlertCircle className="w-2.5 h-2.5" />
                Resep
              </Badge>
            )}
          </div>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            aria-label="Hapus dari keranjang"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2.5 gap-2">
          {/* Quantity control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={localQuantity <= 1 || isPending}
              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Kurangi"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">
              {localQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={localQuantity >= medicine.stock || isPending}
              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Tambah"
            >
              <Plus className="w-3 h-3" />
            </button>
            <span className="text-xs text-muted-foreground">
              (stok: {medicine.stock})
            </span>
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">
              {formatPrice(medicine.price)} × {localQuantity}
            </p>
            <p className="text-sm font-bold text-primary">{formatPrice(subtotal)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

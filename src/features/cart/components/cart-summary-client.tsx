'use client'

import { useState, useTransition } from 'react'
import { Loader2, Trash2, ShoppingBag } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { useCartStore, useCartTotal } from '@/store/cart'
import { clearCartAction } from '@/features/cart/actions'
import { toast } from 'sonner'

const SHIPPING_COST = 15000
const FREE_SHIPPING_THRESHOLD = 200000

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function CartSummaryClient() {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartTotal()
  const setItems = useCartStore((s) => s.setItems)
  const [isClearPending, startClearTransition] = useTransition()

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST
  const total = subtotal + shippingCost
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  function handleClearCart() {
    const prevItems = items
    setItems([])
    startClearTransition(async () => {
      const result = await clearCartAction()
      if (result.error) {
        toast.error(result.error)
        setItems(prevItems)
      } else {
        toast.success('Keranjang dikosongkan')
      }
    })
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ringkasan Belanja</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} item)
          </span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ongkos Kirim</span>
          <span className={isFreeShipping ? 'text-emerald-600 font-medium' : 'font-medium'}>
            {isFreeShipping ? 'GRATIS' : formatPrice(shippingCost)}
          </span>
        </div>

        {!isFreeShipping && (
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary">
              Tambah{' '}
              <span className="font-semibold">
                {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
              </span>{' '}
              lagi untuk gratis ongkir!
            </p>
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary text-lg">
            {formatPrice(total)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        <a
          href="/checkout"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'w-full',
            items.length === 0 && 'pointer-events-none opacity-50'
          )}
          aria-disabled={items.length === 0}
        >
          <ShoppingBag className="w-4 h-4" />
          Lanjutkan ke Pembayaran
        </a>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleClearCart}
          disabled={items.length === 0 || isClearPending}
        >
          {isClearPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Mengosongkan...
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Keranjang
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

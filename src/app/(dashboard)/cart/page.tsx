import Link from 'next/link'
import { ShoppingCart, ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { getCartItems } from '@/features/cart/queries'
import { CartItemRow } from '@/features/cart/components/cart-item-row'
import { CartInitializer } from '@/features/cart/components/cart-initializer'
import { CartSummaryClient } from '@/features/cart/components/cart-summary-client'

export default async function CartPage() {
  const user = await requireAuth()
  const items = await getCartItems(user.id)

  return (
    <div className="max-w-4xl space-y-5">
      {/* Hydrate cart store */}
      <CartInitializer items={items} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/medicines">
          <Button variant="ghost" size="icon-sm" aria-label="Kembali">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length === 0
              ? 'Keranjang Anda kosong'
              : `${items.reduce((n, i) => n + i.quantity, 0)} item dalam keranjang`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Keranjang Kosong</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Belum ada obat di keranjang Anda. Yuk mulai belanja dan temukan obat
            yang Anda butuhkan!
          </p>
          <Link href="/medicines">
            <Button>
              <ShoppingCart className="w-4 h-4" />
              Mulai Belanja
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Item Dipilih</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-between py-3">
                <Link href="/medicines">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Lanjutkan Belanja
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Cart summary (client — reacts to store changes) */}
          <div className="lg:col-span-1">
            <CartSummaryClient />
          </div>
        </div>
      )}
    </div>
  )
}

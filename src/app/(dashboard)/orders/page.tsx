import Link from 'next/link'
import {
  ClipboardList,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireCustomer } from '@/lib/auth/guards'
import { getOrders } from '@/features/orders/queries'
import type { OrderStatus } from '@/types/database'

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive'; icon: React.ElementType }
> = {
  pending: { label: 'Menunggu', variant: 'warning', icon: Clock },
  processing: { label: 'Diproses', variant: 'info', icon: Package },
  shipped: { label: 'Dikirim', variant: 'default', icon: Truck },
  delivered: { label: 'Selesai', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
}

const paymentStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  paid: { label: 'Terbayar', variant: 'success' },
  pending: { label: 'Belum Bayar', variant: 'warning' },
  expired: { label: 'Kedaluwarsa', variant: 'destructive' },
  failed: { label: 'Gagal', variant: 'destructive' },
}

export default async function OrdersPage() {
  const user = await requireCustomer()
  const orders = await getOrders(user.id)

  const tabs = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'processing', label: 'Diproses' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'delivered', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ]

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Pesanan Saya</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Lacak dan kelola semua pesanan Anda.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Belum Ada Pesanan</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Anda belum memiliki pesanan. Mulai belanja dan pesan obat yang Anda butuhkan!
          </p>
          <Link href="/medicines">
            <Button>
              <ShoppingBag className="w-4 h-4" />
              Mulai Belanja
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {tabs.map((tab) => {
              const count =
                tab.value === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status === tab.value).length
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  {tab.label}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {tabs.map((tab) => {
            const filteredOrders =
              tab.value === 'all'
                ? orders
                : orders.filter((o) => o.status === tab.value)

            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-4">
                {filteredOrders.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        Tidak ada pesanan dengan status ini.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const sc = statusConfig[order.status]
                      const StatusIcon = sc.icon
                      const itemNames =
                        order.order_items
                          .slice(0, 2)
                          .map((i) => i.medicines?.name)
                          .filter(Boolean)
                          .join(', ') || 'Item tidak ditemukan'
                      const extraCount = order.order_items.length - 2

                      return (
                        <Link key={order.id} href={`/orders/${order.id}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <StatusIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-mono text-muted-foreground">
                                      #{order.id.slice(0, 8).toUpperCase()}
                                    </p>
                                    <Badge variant={sc.variant}>{sc.label}</Badge>
                                    <Badge variant={paymentStatusConfig[order.payment_status]?.variant || 'secondary'} className="bg-opacity-10 border-none">
                                      {paymentStatusConfig[order.payment_status]?.label || order.payment_status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium truncate">
                                    {itemNames}
                                    {extraCount > 0 && (
                                      <span className="text-muted-foreground">
                                        {' '}+{extraCount} lainnya
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(order.created_at)}
                                    </p>
                                    <p className="text-sm font-semibold text-primary">
                                      {formatPrice(order.total_amount)}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-3" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </div>
  )
}

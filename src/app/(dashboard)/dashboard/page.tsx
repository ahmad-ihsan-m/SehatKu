import Link from 'next/link'
import {
  ShoppingBag,
  ShoppingCart,
  FileText,
  Bell,
  Pill,
  ChevronRight,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import {
  getDashboardStats,
  getRecentOrders,
  getRecentNotifications,
} from '@/features/dashboard/queries'
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

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<
    OrderStatus,
    { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' }
  > = {
    pending: { label: 'Menunggu', variant: 'warning' },
    processing: { label: 'Diproses', variant: 'info' },
    shipped: { label: 'Dikirim', variant: 'default' },
    delivered: { label: 'Selesai', variant: 'success' },
    cancelled: { label: 'Dibatal', variant: 'destructive' },
  }

  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

function OrderStatusIcon({ status }: { status: OrderStatus }) {
  const icons: Record<OrderStatus, React.ElementType> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  }
  const Icon = icons[status]
  return <Icon className="w-4 h-4" />
}

export default async function DashboardPage() {
  const user = await requireAuth()

  // Role-based redirection
  if (user.profile.role === 'admin') {
    redirect('/admin')
  }
  if (user.profile.role === 'pharmacist') {
    redirect('/pharmacist/prescriptions')
  }

  const [stats, recentOrders, recentNotifs] = await Promise.all([
    getDashboardStats(user.id),
    getRecentOrders(user.id, 3),
    getRecentNotifications(user.id, 3),
  ])

  const firstName = user.profile.full_name?.split(' ')[0] ?? 'Pengguna'

  const statCards = [
    {
      label: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingBag,
      href: '/orders',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Item di Keranjang',
      value: stats.cartItems,
      icon: ShoppingCart,
      href: '/cart',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Resep Menunggu',
      value: stats.pendingPrescriptions,
      icon: FileText,
      href: '/prescriptions',
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Notifikasi Baru',
      value: stats.unreadNotifications,
      icon: Bell,
      href: '/notifications',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Selamat datang, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Kelola kesehatan Anda dengan mudah dari sini.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground leading-none mb-2">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aksi Cepat</CardTitle>
          <CardDescription>Apa yang ingin Anda lakukan hari ini?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/medicines">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Beli Obat</p>
                  <p className="text-xs text-muted-foreground">Browse katalog obat</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link href="/prescriptions/upload">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload Resep</p>
                  <p className="text-xs text-muted-foreground">Kirim resep dokter</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-amber-600 transition-colors" />
              </div>
            </Link>

            <Link href="/orders">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pesanan Saya</p>
                  <p className="text-xs text-muted-foreground">Lacak status pesanan</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Lihat semua
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada pesanan</p>
                <Link href="/medicines">
                  <Button size="sm" className="mt-3" variant="outline">
                    Mulai Belanja
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const firstItem = order.order_items[0]
                  const itemNames =
                    order.order_items
                      .slice(0, 2)
                      .map((i) => i.medicines?.name)
                      .filter(Boolean)
                      .join(', ') || 'Item tidak ditemukan'
                  const extraCount = order.order_items.length - 2

                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-transparent hover:border-border"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                        <OrderStatusIcon status={order.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-mono text-muted-foreground truncate">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm font-medium truncate">
                          {itemNames}
                          {extraCount > 0 && (
                            <span className="text-muted-foreground"> +{extraCount} lainnya</span>
                          )}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                          <p className="text-xs font-semibold text-primary">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifikasi</CardTitle>
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Lihat semua
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotifs.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifs.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${
                      !notif.is_read
                        ? 'bg-primary/5 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        !notif.is_read ? 'bg-primary' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(notif.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

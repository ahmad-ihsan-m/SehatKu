import { getAdminStats } from '@/features/admin/queries'
import { ShoppingBag, Users, DollarSign, FileText, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const cards = [
    { label: 'Total Pesanan', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Pendapatan', value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Resep Pending', value: stats.pendingPrescriptions, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', href: '/pharmacist' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Gambaran umum performa SehatKu saat ini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.label} className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              {card.href && (
                <Link href={card.href} className="mt-4 inline-flex items-center text-xs font-semibold text-primary hover:underline">
                  Lihat detail <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full h-24 flex-col gap-2 hover:bg-primary hover:text-white transition-all">
                <ShoppingBag className="w-6 h-6" />
                Kelola Pesanan
              </Button>
            </Link>
            <Link href="/admin/medicines">
              <Button variant="outline" className="w-full h-24 flex-col gap-2 hover:bg-primary hover:text-white transition-all">
                <Pill className="w-6 h-6" />
                Katalog Obat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Pill } from 'lucide-react'

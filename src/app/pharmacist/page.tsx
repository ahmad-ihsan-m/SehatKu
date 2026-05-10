import { getPharmacistStats } from '@/features/pharmacist/queries'
import { FileText, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PharmacistDashboardPage() {
  const stats = await getPharmacistStats()

  const cards = [
    { label: 'Pending Validasi', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resep Disetujui', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Resep Ditolak', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Portal Apoteker</h1>
        <p className="text-muted-foreground mt-2">Kelola validasi resep medis dari pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-primary text-primary-foreground">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Terdapat {stats.pending} resep menunggu validasi</h2>
            <p className="opacity-90">Segera periksa berkas resep untuk memproses pesanan pelanggan.</p>
          </div>
          <Link href="/pharmacist/prescriptions">
            <Button size="lg" variant="secondary" className="font-bold">
              Mulai Validasi Sekarang
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

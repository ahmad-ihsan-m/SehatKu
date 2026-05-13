import Link from 'next/link'
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireCustomer } from '@/lib/auth/guards'
import { getPrescriptions } from '@/features/prescriptions/queries'
import type { PrescriptionStatus } from '@/types/database'
import { SafeImage } from '@/components/ui/safe-image'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const statusConfig: Record<
  PrescriptionStatus,
  { label: string; variant: 'warning' | 'success' | 'destructive'; icon: React.ElementType }
> = {
  pending: { label: 'Menunggu', variant: 'warning', icon: Clock },
  approved: { label: 'Disetujui', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'destructive', icon: XCircle },
}

export default async function PrescriptionsPage() {
  const user = await requireCustomer()
  const prescriptions = await getPrescriptions(user.id)

  const tabs = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
  ]

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Resep Saya</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Kelola dan lacak status resep dokter Anda.
          </p>
        </div>
        <Link href="/prescriptions/upload">
          <Button>
            <Upload className="w-4 h-4" />
            Upload Resep
          </Button>
        </Link>
      </div>

      {prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Belum Ada Resep</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Upload resep dokter Anda untuk diverifikasi oleh apoteker kami.
          </p>
          <Link href="/prescriptions/upload">
            <Button>
              <Upload className="w-4 h-4" />
              Upload Resep Pertama
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            {tabs.map((tab) => {
              const count =
                tab.value === 'all'
                  ? prescriptions.length
                  : prescriptions.filter((p) => p.status === tab.value).length
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
            const filtered =
              tab.value === 'all'
                ? prescriptions
                : prescriptions.filter((p) => p.status === tab.value)

            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-4">
                {filtered.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        Tidak ada resep dengan status ini.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map((rx) => {
                      const sc = statusConfig[rx.status]
                      const StatusIcon = sc.icon
                      return (
                        <Card key={rx.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 rounded-lg shrink-0 overflow-hidden">
                                <SafeImage
                                  src={rx.signedImageUrl}
                                  alt="Resep"
                                  className="object-cover"
                                  sizes="64px"
                                  fallback={
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                      <FileText className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  }
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-mono text-muted-foreground">
                                    #{rx.id.slice(0, 8).toUpperCase()}
                                  </p>
                                  <Badge variant={sc.variant} className="text-[10px]">
                                    <StatusIcon className="w-3 h-3" />
                                    {sc.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(rx.created_at)}
                                </p>
                                {rx.pharmacist_notes && (
                                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 bg-muted/50 rounded px-2 py-1">
                                    <span className="font-medium">Catatan:</span>{' '}
                                    {rx.pharmacist_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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

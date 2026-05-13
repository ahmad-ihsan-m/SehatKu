'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
  Pill,
  ShoppingBag,
  Loader2,
  Lock,
  Banknote,
  Wallet,
  QrCode,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SafeImage } from '@/components/ui/safe-image'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cancelOrderAction } from '@/features/orders/actions'
import { toast } from 'sonner'
import type { OrderStatus } from '@/types/database'
import type { OrderListItem } from '@/features/orders/queries'

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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive'; icon: React.ElementType; color: string }
> = {
  pending: { label: 'Menunggu', variant: 'warning', icon: Clock, color: 'text-amber-600' },
  processing: { label: 'Diproses', variant: 'info', icon: Package, color: 'text-blue-600' },
  shipped: { label: 'Dikirim', variant: 'default', icon: Truck, color: 'text-indigo-600' },
  delivered: { label: 'Selesai', variant: 'success', icon: CheckCircle, color: 'text-green-600' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle, color: 'text-red-600' },
}

const statusTimeline: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

interface OrderDetailClientProps {
  order: OrderListItem
}

import { useEffect } from 'react'
import { initializePaymentAction } from '@/features/payments/actions'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void
    }
  }
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  
  useEffect(() => {
    // Load Midtrans Snap Script
    const midtransScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
    
    const script = document.createElement('script')
    script.src = midtransScriptUrl
    script.setAttribute('data-client-key', clientKey)
    script.async = true
    
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const sc = statusConfig[order.status]
  const StatusIcon = sc.icon

  const currentStepIdx = statusTimeline.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'
  const needsPayment = order.payment_status === 'pending' || order.payment_status === 'failed'

  async function handlePayment() {
    setIsPaying(true)
    let snapToken = order.payments?.snap_token

    if (!snapToken) {
      const result = await initializePaymentAction(order.id)
      if (result.error) {
        toast.error(result.error)
        setIsPaying(false)
        return
      }
      snapToken = result.snapToken
    }

    if (snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: () => {
          toast.success('Pembayaran Berhasil!')
          router.refresh()
        },
        onPending: () => {
          toast.info('Menunggu penyelesaian pembayaran.')
          router.refresh()
        },
        onError: () => {
          toast.error('Pembayaran Gagal.')
          setIsPaying(false)
        },
        onClose: () => {
          toast.warning('Pembayaran belum selesai.')
          setIsPaying(false)
        }
      })
    }
  }

  async function handleCancel() {
    setCancelling(true)
    const result = await cancelOrderAction(order.id)
    if (result.error) {
      toast.error(result.error)
      setCancelling(false)
    } else {
      toast.success('Pesanan berhasil dibatalkan')
      router.refresh()
    }
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-muted-foreground/20">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">
              Pesanan #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <Badge variant={sc.variant}>{sc.label}</Badge>
            <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'} className="bg-opacity-10 border-none capitalize">
              {order.payment_status === 'paid' ? 'Terbayar' : 'Belum Bayar'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Dibuat pada {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Status Timeline */}
          {!isCancelled && (
            <Card className="rounded-3xl border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-muted/20">
                <CardTitle className="text-base font-bold">Lacak Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  {statusTimeline.map((step, idx) => {
                    const stepSc = statusConfig[step]
                    const StepIcon = stepSc.icon
                    const isCompleted = idx <= currentStepIdx
                    const isCurrent = idx === currentStepIdx

                    return (
                      <div key={step} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                              isCompleted
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'scale-110' : ''}`}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                              isCompleted ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            {stepSc.label}
                          </span>
                        </div>
                        {idx < statusTimeline.length - 1 && (
                          <div
                            className={`flex-1 h-1 mx-2 mb-6 rounded-full ${
                              idx < currentStepIdx ? 'bg-primary shadow-sm' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancelled notice */}
          {isCancelled && (
            <Card className="rounded-3xl border-2 border-destructive/20 bg-destructive/5">
              <CardContent className="py-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="font-black text-destructive tracking-tight">Pesanan Dibatalkan</p>
                  <p className="text-sm text-muted-foreground font-medium">
                    Pesanan ini telah dibatalkan pada {formatDate(order.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Item Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-muted/20">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/5 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-muted-foreground/5 relative overflow-hidden">
                      <SafeImage
                        src={item.medicines?.image_url ?? null}
                        alt={item.medicines?.name || 'Obat'}
                        fill
                        className="object-cover"
                        fallback={<Pill className="w-5 h-5 text-muted-foreground/30" />}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {item.medicines?.name ?? 'Obat tidak ditemukan'}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {item.quantity} unit x {formatPrice(item.price_at_time)}
                      </p>
                    </div>
                    <p className="font-bold text-sm">
                      {formatPrice(item.quantity * item.price_at_time)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-t border-primary/10">
                <p className="text-sm font-bold text-primary">Total Pembayaran</p>
                <p className="text-xl font-black text-primary tracking-tight">
                  {formatPrice(order.total_amount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* ── Payment Pending Card ── */}
          {needsPayment && !isCancelled && (
            <div className="rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-900/50 shadow-lg shadow-amber-100/50 dark:shadow-amber-900/20">
              {/* Urgent header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      {/* Pulsing dot */}
                      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-black text-sm leading-none">Selesaikan Pembayaran</p>
                      <p className="text-white/70 text-[10px] font-medium mt-0.5">Menunggu konfirmasi pembayaran</p>
                    </div>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-white/80" />
                </div>
              </div>

              <div className="bg-background px-5 py-4 space-y-4">
                {/* Total amount */}
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total yang Harus Dibayar
                  </p>
                  <p className="text-3xl font-black text-foreground tracking-tight">
                    {formatPrice(order.total_amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Pesanan #{order.id.slice(0, 8).toUpperCase()} &middot; {order.order_items.length} item
                  </p>
                </div>

                <Separator className="bg-border/40" />

                {/* Payment methods */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Metode Pembayaran
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { icon: Banknote, label: 'Transfer\nBank' },
                      { icon: Wallet, label: 'E-\nWallet' },
                      { icon: QrCode, label: 'QRIS' },
                      { icon: CreditCard, label: 'Kartu\nKredit' },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/50 border border-border/30"
                      >
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[8px] font-bold text-center leading-tight text-muted-foreground whitespace-pre-line">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA button */}
                <Button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="w-full h-12 font-black text-sm rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-200 dark:shadow-amber-900/30"
                >
                  {isPaying ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memuat pembayaran...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Bayar Sekarang
                    </span>
                  )}
                </Button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Diproses aman oleh <span className="text-foreground font-bold">Midtrans</span> &middot; SSL Encrypted
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Details info */}
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader className="pb-3 border-b border-muted/20">
              <CardTitle className="text-sm font-bold">Informasi Pengiriman</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {order.shipping_address}
                </p>
              </div>
              <Separator className="bg-muted/30" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metode Pembayaran</span>
                <span className="text-xs font-bold text-foreground">
                  {order.payments?.payment_method || 'Online Payment (Midtrans)'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cancel button */}
          {order.status === 'pending' && !isCancelled && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-bold rounded-2xl h-10">
                  <XCircle className="w-3.5 h-3.5 mr-2" />
                  Batalkan Pesanan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">Batalkan Pesanan?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium">
                    Apakah Anda yakin ingin membatalkan pesanan ini? Stok yang telah dikunci akan dikembalikan ke sistem.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-xl font-bold">Kembali</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
                  >
                    Ya, Batalkan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  )
}

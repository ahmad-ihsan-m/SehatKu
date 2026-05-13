'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Loader2,
  Pill,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ShoppingCart,
  Banknote,
  Wallet,
  QrCode,
  Lock,
  Tag,
  ChevronRight,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { checkoutAction } from '@/features/checkout/actions'
import { toast } from 'sonner'
import type { CartItemWithMedicine, Prescription } from '@/types/database'

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

interface CheckoutClientProps {
  items: CartItemWithMedicine[]
  approvedPrescription: Prescription | null
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void
    }
  }
}

const paymentMethods = [
  { icon: Banknote, label: 'Transfer Bank' },
  { icon: Wallet, label: 'E-Wallet' },
  { icon: QrCode, label: 'QRIS' },
  { icon: CreditCard, label: 'Kartu Kredit' },
]

// Step indicator component
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { icon: ShoppingCart, label: 'Keranjang' },
    { icon: MapPin, label: 'Checkout' },
    { icon: CreditCard, label: 'Pembayaran' },
    { icon: CheckCircle, label: 'Selesai' },
  ]
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-xs mx-auto">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const done = idx < current
        const active = idx === current
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                  done
                    ? 'bg-primary border-primary text-primary-foreground'
                    : active
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span
                className={`text-[9px] font-bold whitespace-nowrap ${
                  active ? 'text-primary' : done ? 'text-primary/70' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mb-4 mx-0.5 rounded-full ${
                  idx < current ? 'bg-primary' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutClient({ items, approvedPrescription }: CheckoutClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    const midtransScriptUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const script = document.createElement('script')
    script.src = midtransScriptUrl
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const requiresPrescription = items.some((i) => i.medicines.requires_prescription)
  const canCheckout = !requiresPrescription || !!approvedPrescription
  const subtotal = items.reduce((s, i) => s + i.medicines.price * i.quantity, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const addressReady = address.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canCheckout) {
      toast.error('Anda memerlukan resep yang disetujui untuk melanjutkan')
      return
    }
    if (!addressReady) {
      toast.error('Alamat pengiriman minimal 10 karakter')
      return
    }
    setIsLoading(true)
    const formData = new FormData()
    formData.append('shippingAddress', address)
    const result = await checkoutAction(formData)
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }
    if (result.snapToken) {
      if (typeof window.snap === 'undefined') {
        toast.error('Sistem pembayaran belum siap. Silakan refresh halaman.')
        setIsLoading(false)
        return
      }
      window.snap.pay(result.snapToken, {
        onSuccess: () => { toast.success('Pembayaran Berhasil!'); window.location.href = '/orders' },
        onPending: () => { toast.info('Pembayaran sedang diproses.'); window.location.href = '/orders' },
        onError: () => { toast.error('Pembayaran Gagal. Silakan coba lagi.'); setIsLoading(false) },
        onClose: () => { toast.warning('Anda menutup pembayaran sebelum selesai.'); setIsLoading(false); window.location.href = '/orders' },
      })
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border border-border/50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black tracking-tight">Konfirmasi Pesanan</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{totalItems} item &middot; {formatPrice(subtotal)}</p>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator current={1} />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left Column ── */}
          <div className="lg:col-span-7 space-y-4">

            {/* Prescription alert */}
            {requiresPrescription && (
              <Alert
                variant={approvedPrescription ? 'default' : 'destructive'}
                className="rounded-2xl border-2"
              >
                {approvedPrescription ? (
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle className="font-bold text-sm">Verifikasi Resep Dokter</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {approvedPrescription ? (
                    <div className="flex flex-col gap-1.5">
                      <p>Resep Anda telah diverifikasi. Silakan lanjutkan pembelian.</p>
                      <Badge variant="success" className="w-fit text-[10px] rounded-full px-2 py-0.5">
                        Verified &middot; {approvedPrescription.id.slice(0, 8).toUpperCase()}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p>Keranjang Anda mengandung obat keras yang memerlukan resep dokter.</p>
                      <Link href="/prescriptions/upload">
                        <Button variant="destructive" size="sm" className="rounded-xl font-bold h-7 text-xs">
                          Upload Resep Sekarang
                        </Button>
                      </Link>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Order Items */}
            <div className="bg-background rounded-2xl border border-border/50 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Pesanan Anda</span>
                <span className="ml-auto text-xs text-muted-foreground">{totalItems} item</span>
              </div>
              <div className="divide-y divide-border/30">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/30">
                      {item.medicines.image_url ? (
                        <img
                          src={item.medicines.image_url}
                          alt={item.medicines.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Pill className="w-5 h-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate leading-tight">{item.medicines.name}</p>
                        {item.medicines.requires_prescription && (
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-amber-500 text-amber-600 font-bold uppercase shrink-0">
                            Rx
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity} unit &times; {formatPrice(item.medicines.price)}
                      </p>
                    </div>
                    <p className="text-sm font-bold shrink-0">
                      {formatPrice(item.medicines.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              {/* Free shipping indicator */}
              <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-t border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Selamat! Pesanan ini mendapat <strong>gratis ongkir</strong>
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-background rounded-2xl border border-border/50 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Alamat Pengiriman</span>
              </div>
              <div className="px-5 py-4 space-y-2">
                <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Alamat Lengkap
                </Label>
                <Textarea
                  id="address"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos..."
                  className="rounded-xl min-h-[90px] text-sm border-border/50 focus-visible:ring-primary/20 resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                {address.length > 0 && address.trim().length < 10 && (
                  <p className="text-xs text-destructive font-medium">
                    Alamat minimal 10 karakter ({address.trim().length}/10)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column: Payment Summary ── */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 space-y-3">

              {/* Main payment card */}
              <div className="bg-background rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                {/* Card header */}
                <div className="px-5 py-4 border-b border-border/40">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ringkasan Pembayaran</p>
                </div>

                {/* Price breakdown */}
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Subtotal ({totalItems} item)</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      Ongkos Kirim
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground/60 line-through">Rp&nbsp;15.000</span>
                      <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4 rounded-full font-bold">
                        GRATIS
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-border/40" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Total Tagihan</span>
                    <span className="text-2xl font-black text-primary tracking-tight">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="px-5 pb-4 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Metode Pembayaran Tersedia
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {paymentMethods.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/40 border border-border/30"
                      >
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-[8px] font-bold text-center leading-tight text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    BCA, Mandiri, BNI, GoPay, OVO, DANA, QRIS & lainnya
                  </p>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 font-black text-sm rounded-xl shadow-lg shadow-primary/25 relative overflow-hidden"
                    disabled={isLoading || !canCheckout || !addressReady}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses pesanan...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Konfirmasi &amp; Bayar
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </span>
                    )}
                  </Button>

                  {/* Security badge */}
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-semibold">
                      Pembayaran diproses aman oleh <span className="text-foreground font-bold">Midtrans</span>
                    </span>
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    Dengan melanjutkan, Anda menyetujui{' '}
                    <span className="text-primary font-semibold cursor-pointer hover:underline underline-offset-2">
                      Syarat &amp; Ketentuan
                    </span>{' '}
                    SehatKu.
                  </p>
                </div>
              </div>

              {/* Disabled reason hints */}
              {!canCheckout && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                    Upload dan tunggu persetujuan resep dokter sebelum melanjutkan pembayaran.
                  </p>
                </div>
              )}
              {canCheckout && !addressReady && address.length > 0 && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-muted/50 border border-border/40">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Lengkapi alamat pengiriman untuk melanjutkan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

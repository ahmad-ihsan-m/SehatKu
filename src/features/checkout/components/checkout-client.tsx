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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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

export default function CheckoutClient({ items, approvedPrescription }: CheckoutClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [address, setAddress] = useState('')

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

  const requiresPrescription = items.some(item => item.medicines.requires_prescription)
  const canCheckout = !requiresPrescription || !!approvedPrescription

  const total = items.reduce(
    (sum, item) => sum + item.medicines.price * item.quantity,
    0
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canCheckout) {
      toast.error('Anda memerlukan resep yang disetujui untuk melanjutkan')
      return
    }
    if (address.trim().length < 10) {
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
      // Trigger Midtrans Snap
      if (typeof window.snap === 'undefined') {
        toast.error('Sistem pembayaran belum siap. Silakan refresh halaman.')
        setIsLoading(false)
        return
      }

      window.snap.pay(result.snapToken, {
        onSuccess: (result: any) => {
          toast.success('Pembayaran Berhasil!')
          setIsLoading(false)
          window.location.href = `/orders`
        },
        onPending: (result: any) => {
          toast.info('Pembayaran sedang diproses. Silakan selesaikan segera.')
          setIsLoading(false)
          window.location.href = `/orders`
        },
        onError: (result: any) => {
          toast.error('Pembayaran Gagal. Silakan coba lagi.')
          setIsLoading(false)
        },
        onClose: () => {
          toast.warning('Anda menutup pembayaran sebelum selesai.')
          setIsLoading(false)
          window.location.href = `/orders`
        }
      })
    }
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cart">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-muted-foreground/20">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground font-medium">Selesaikan pesanan Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Prescription Alert if needed */}
          {requiresPrescription && (
            <Alert variant={approvedPrescription ? "default" : "destructive"} className="rounded-3xl border-2">
              {approvedPrescription ? (
                <FileCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <AlertTitle className="font-bold">Verifikasi Resep Dokter</AlertTitle>
              <AlertDescription className="text-sm mt-1">
                {approvedPrescription ? (
                  <div className="flex flex-col gap-1">
                    <p>Resep Anda telah diverifikasi oleh Apoteker kami. Anda dapat melanjutkan pembelian.</p>
                    <Badge variant="success" className="w-fit text-[10px] rounded-full px-2 py-0.5">
                      Verified ID: {approvedPrescription.id.slice(0, 8).toUpperCase()}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p>Keranjang Anda berisi obat keras yang memerlukan resep dokter.</p>
                    <Link href="/prescriptions/upload">
                      <Button variant="destructive" size="sm" className="rounded-xl font-bold h-8">
                        Upload Resep Sekarang
                      </Button>
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Shipping Address */}
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Alamat Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label htmlFor="address" className="font-bold">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos..."
                  className="rounded-2xl min-h-[100px] border-muted-foreground/10 focus-visible:ring-primary/20"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Review */}
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Review Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-muted/30">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/5 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-muted-foreground/5 relative overflow-hidden">
                      {item.medicines.image_url ? (
                        <img src={item.medicines.image_url} alt={item.medicines.name} className="w-full h-full object-cover" />
                      ) : (
                        <Pill className="w-6 h-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold truncate">{item.medicines.name}</p>
                        {item.medicines.requires_prescription && (
                          <Badge variant="outline" className="text-[9px] h-4 border-amber-500 text-amber-600 font-bold uppercase">Rx</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {item.quantity} unit x {formatPrice(item.medicines.price)}
                      </p>
                    </div>
                    <p className="font-bold text-sm">
                      {formatPrice(item.medicines.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-4">
          <Card className="rounded-3xl border-none shadow-xl sticky top-6 overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground pb-6">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Ringkasan Biaya
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Subtotal Produk</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Biaya Pengiriman</span>
                <span className="text-emerald-600 font-bold">GRATIS</span>
              </div>
              <Separator className="bg-muted/50" />
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold">Total Tagihan</span>
                <span className="text-2xl font-black text-primary tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="bg-muted/30 p-4 rounded-2xl space-y-2 mt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metode Pembayaran</p>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <div className="p-1.5 bg-white rounded-lg border">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  Transfer Bank
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 pb-8">
              <Button
                type="submit"
                className="w-full rounded-2xl h-14 font-black text-lg shadow-lg shadow-primary/20"
                disabled={isLoading || !canCheckout || address.trim().length < 10}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'KONFIRMASI PESANAN'
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
                Dengan menekan tombol di atas, Anda menyetujui syarat dan ketentuan SehatKu.
              </p>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

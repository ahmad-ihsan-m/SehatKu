'use client'

import { useState } from 'react'
import { Pill, Package, AlertCircle, Minus, Plus, ShoppingCart, Loader2, FileUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SafeImage } from '@/components/ui/safe-image'
import type { MedicineWithCategory } from '@/types/database'
import Link from 'next/link'

interface MedicineDetailModalProps {
  medicine: MedicineWithCategory
  isApproved?: boolean
  onClose: () => void
  onAddToCart: (medicine: MedicineWithCategory, quantity: number) => Promise<void>
  isAdding: boolean
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function MedicineDetailModal({
  medicine,
  isApproved,
  onClose,
  onAddToCart,
  isAdding,
}: MedicineDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const isOutOfStock = medicine.stock === 0
  const needsRx = medicine.requires_prescription && !isApproved

  const increment = () => setQuantity((q) => Math.min(q + 1, medicine.stock))
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1))

  async function handleAddToCart() {
    await onAddToCart(medicine, quantity)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-5 pb-2 border-b">
          <div className="space-y-1">
            {medicine.categories && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {medicine.categories.name}
              </span>
            )}
            <DialogTitle className="text-xl font-bold leading-tight">
              {medicine.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {/* Image */}
          <SafeImage
            src={medicine.image_url}
            alt={medicine.name}
            width={600}
            height={400}
            containerClassName="h-52 w-full"
            className="object-cover w-full h-full"
          />

          <div className="p-5 space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {medicine.requires_prescription ? (
                <Badge variant={isApproved ? "success" : "warning"} className="rounded-full px-3 py-1">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {isApproved ? "Resep Disetujui" : "Butuh Resep Dokter"}
                </Badge>
              ) : (
                <Badge variant="success" className="rounded-full px-3 py-1">
                  Obat Bebas
                </Badge>
              )}
              
              <Badge 
                variant={isOutOfStock ? "destructive" : medicine.stock <= 10 ? "warning" : "info"} 
                className="rounded-full px-3 py-1"
              >
                <Package className="w-3.5 h-3.5 mr-1" />
                {isOutOfStock ? "Stok Habis" : `Stok: ${medicine.stock}`}
              </Badge>
            </div>

            {/* Description */}
            {medicine.description && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deskripsi</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {medicine.description}
                </p>
              </div>
            )}

            {needsRx && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      Informasi Resep
                    </p>
                    <p className="text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                      Obat ini tergolong obat keras. Anda diwajibkan mengunggah resep dokter yang sah dan menunggu persetujuan apoteker sebelum dapat memproses pembelian.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-5 border-t bg-muted/30 flex-col sm:flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Pembayaran</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(medicine.price * (needsRx ? 1 : quantity))}
              </p>
            </div>

            {!isOutOfStock && !needsRx && (
              <div className="flex items-center bg-background rounded-xl border p-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrement}
                  disabled={quantity <= 1}
                  className="h-8 w-8 rounded-lg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-10 text-center text-sm font-bold">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={increment}
                  disabled={quantity >= medicine.stock}
                  className="h-8 w-8 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {needsRx ? (
            <Link href={`/prescriptions/upload?medicineId=${medicine.id}`} className="w-full">
              <Button
                className="w-full h-12 text-sm font-bold bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-200"
              >
                <FileUp className="w-4 h-4 mr-2" />
                Upload Resep Sekarang
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20"
              disabled={isOutOfStock || isAdding}
              onClick={handleAddToCart}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : isOutOfStock ? (
                'Stok Habis'
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Tambah ke Keranjang
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

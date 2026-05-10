import { Pill, AlertCircle, Package, Plus, FileUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SafeImage } from '@/components/ui/safe-image'
import type { MedicineWithCategory } from '@/types/database'
import Link from 'next/link'

interface MedicineCardProps {
  medicine: MedicineWithCategory
  isApproved?: boolean
  onViewDetail: (medicine: MedicineWithCategory) => void
  onAddToCart: (medicine: MedicineWithCategory) => void
  isAddingToCart: boolean
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function MedicineCard({
  medicine,
  isApproved,
  onViewDetail,
  onAddToCart,
  isAddingToCart,
}: MedicineCardProps) {
  const isOutOfStock = medicine.stock === 0
  const isLowStock = medicine.stock > 0 && medicine.stock <= 10
  const needsRx = medicine.requires_prescription && !isApproved

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-card group shadow-sm hover:-translate-y-1">
      {/* Product image container */}
      <div
        className="relative aspect-square bg-muted/30 cursor-pointer overflow-hidden"
        onClick={() => onViewDetail(medicine)}
      >
        <SafeImage
          src={medicine.image_url}
          alt={medicine.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110"
        />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {medicine.requires_prescription && (
            <Badge variant="warning" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm backdrop-blur-md bg-amber-500/90 text-white border-none">
              <AlertCircle className="w-3 h-3 mr-1" />
              Resep
            </Badge>
          )}
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
              Habis
            </Badge>
          ) : isLowStock && (
            <Badge variant="warning" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
              Limit
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex flex-col flex-1 p-4 gap-3">
        <div className="space-y-1">
          {medicine.categories && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              {medicine.categories.name}
            </span>
          )}

          <h3 
            className="text-sm font-bold text-foreground leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onViewDetail(medicine)}
          >
            {medicine.name}
          </h3>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium">Harga mulai</span>
              <span className="text-base font-black text-primary tracking-tight">
                {formatPrice(medicine.price)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Package className="w-3 h-3" />
              {medicine.stock}
            </div>
          </div>

          {needsRx ? (
            <Link href={`/prescriptions/upload?medicineId=${medicine.id}`} className="w-full">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 text-[10px] font-bold rounded-xl border-amber-500/50 text-amber-600 hover:bg-amber-50"
              >
                <FileUp className="w-3 h-3 mr-1" />
                Upload Resep
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              className="w-full h-9 text-xs font-bold rounded-xl shadow-md shadow-primary/10 group-active:scale-95 transition-transform"
              disabled={isOutOfStock || isAddingToCart}
              onClick={() => onAddToCart(medicine)}
              variant={isOutOfStock ? 'secondary' : 'default'}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <Plus className="w-3 h-3 animate-spin" />
                  Sabar...
                </span>
              ) : isOutOfStock ? (
                'Kosong'
              ) : (
                <span className="flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Keranjang
                </span>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

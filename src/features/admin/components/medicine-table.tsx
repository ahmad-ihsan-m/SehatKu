'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, AlertTriangle, Pill, Eye, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import type { MedicineWithCategory, Category } from '@/types/database'
import { EditMedicineDialog } from './edit-medicine-dialog'
import { MedicineDeleteButton } from './medicine-delete-button'
import { useRouter, useSearchParams } from 'next/navigation'

interface MedicineTableProps {
  medicines: MedicineWithCategory[]
  total: number
  categories: Category[]
}

export function MedicineTable({ medicines, total, categories }: MedicineTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const page = Number(searchParams.get('page')) || 1
  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Pill className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-bold">Tidak Ada Obat Ditemukan</h3>
        <p className="text-muted-foreground text-sm max-w-xs mt-2">
          Sesuaikan filter atau kata kunci pencarian Anda untuk menemukan obat yang dicari.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] font-bold">Produk</TableHead>
              <TableHead className="font-bold">Nama & Kategori</TableHead>
              <TableHead className="font-bold">Harga</TableHead>
              <TableHead className="font-bold">Stok</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((medicine) => {
              const isLowStock = medicine.stock <= 10 && medicine.stock > 0
              const isOutOfStock = medicine.stock === 0

              return (
                <TableRow key={medicine.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border bg-muted group-hover:border-primary/50 transition-colors">
                      {medicine.image_url ? (
                        <Image
                          src={medicine.image_url}
                          alt={medicine.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <Pill className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        {medicine.name}
                        {medicine.requires_prescription && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-amber-500 text-amber-600 font-bold uppercase tracking-tighter">
                            Rx
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {medicine.categories?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatCurrency(medicine.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isOutOfStock ? 'text-destructive' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {medicine.stock}
                      </span>
                      {isOutOfStock ? (
                        <Badge variant="destructive" className="text-[9px] h-4 rounded-full px-1.5 uppercase font-bold">Habis</Badge>
                      ) : isLowStock ? (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Tipis
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={medicine.is_active ? 'success' : 'secondary'} 
                      className={`uppercase text-[10px] font-bold rounded-full px-2 ${!medicine.is_active ? 'opacity-50' : ''}`}
                    >
                      {medicine.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditMedicineDialog categories={categories} medicine={medicine} />
                      <MedicineDeleteButton id={medicine.id} name={medicine.name} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground font-medium">
          Menampilkan <span className="text-foreground font-bold">{medicines.length}</span> dari <span className="text-foreground font-bold">{total}</span> obat
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(page - 1)}
            disabled={page <= 1}
            className="rounded-xl h-9 w-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => updatePage(p)}
                className={`rounded-xl h-9 w-9 p-0 text-xs font-bold ${p === page ? 'shadow-md shadow-primary/20' : ''}`}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-xl h-9 w-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useTransition } from 'react'
import { Search, SlidersHorizontal, Pill, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MedicineCard } from './medicine-card'
import { MedicineDetailModal } from './medicine-detail-modal'
import { addToCartAction } from '@/features/cart/actions'
import { useCartStore } from '@/store/cart'
import { toast } from 'sonner'
import type { Category, MedicineWithCategory } from '@/types/database'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect } from 'react'

interface MedicinesClientProps {
  medicines: MedicineWithCategory[]
  categories: Category[]
  approvedMedicineIds: string[]
  total: number
}

export function MedicinesClient({ medicines, categories, approvedMedicineIds, total }: MedicinesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Internal state for input to avoid laggy typing
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const selectedCategory = searchParams.get('category') || null

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    if (!updates.page) params.delete('page')
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [router, pathname, searchParams])

  // Sync internal state when URL changes externally (e.g. back button)
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '')
  }, [searchParams])

  // Automatic debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || ''
      if (searchInput !== currentSearch) {
        updateFilters({ search: searchInput || null })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput, updateFilters, searchParams])

  const [addingMedicineId, setAddingMedicineId] = useState<string | null>(null)
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineWithCategory | null>(null)

  function clearFilters() {
    setSearchInput('')
    router.push(pathname)
  }

  async function handleAddToCart(medicine: MedicineWithCategory, quantity = 1) {
    const store = useCartStore.getState()
    
    // Create snapshot for potential rollback
    store.createSnapshot()
    setAddingMedicineId(medicine.id)

    // Optimistic update
    store.optimisticAddItem({
      id: `temp-${medicine.id}`,
      cart_id: '',
      medicine_id: medicine.id,
      quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      medicines: {
        id: medicine.id,
        name: medicine.name,
        price: medicine.price,
        stock: medicine.stock,
        requires_prescription: medicine.requires_prescription,
        image_url: medicine.image_url,
      },
    })

    startTransition(async () => {
      try {
        const result = await addToCartAction(medicine.id, quantity)
        setAddingMedicineId(null)

        if (result.error) {
          toast.error(result.error)
          store.rollback()
        } else {
          toast.success(`${medicine.name} ditambahkan ke keranjang`)
          store.commit()
        }
      } catch (err) {
        console.error('[CartAction] Error:', err)
        toast.error('Gagal menghubungkan ke server')
        store.rollback()
        setAddingMedicineId(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Cari obat..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              updateFilters({ search: searchInput })
            }
          }}
          className="pl-9 pr-4"
          aria-label="Cari obat"
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput('')
              updateFilters({ search: null })
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter:
        </span>

        {/* Category filter */}
        <button
          onClick={() => updateFilters({ category: null })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
          }`}
        >
          Semua
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateFilters({ category: cat.id === selectedCategory ? null : cat.id })}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            {cat.name}
          </button>
        ))}

        {searchParams.get('category') || searchParams.get('search') ? (
          <button
            onClick={clearFilters}
            className="text-xs px-2 py-1.5 text-destructive hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        ) : null}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan{' '}
          <span className="font-semibold text-foreground">{medicines.length}</span> dari{' '}
          {total} produk
        </p>
        {isPending && <span className="text-[10px] text-primary animate-pulse font-bold uppercase tracking-widest">Memperbarui...</span>}
      </div>

      {/* Grid */}
      {medicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Pill className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">
            Produk tidak ditemukan
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Coba ubah kata kunci atau filter pencarian.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Reset Pencarian
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                isApproved={approvedMedicineIds.includes(medicine.id)}
                onViewDetail={setSelectedMedicine}
                onAddToCart={(m) => handleAddToCart(m, 1)}
                isAddingToCart={addingMedicineId === medicine.id}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-2 pt-8 pb-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                disabled={parseInt(searchParams.get('page') || '1') <= 1 || isPending}
                onClick={() => {
                  const currentPage = parseInt(searchParams.get('page') || '1')
                  updateFilters({ page: (currentPage - 1).toString() })
                }}
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1 px-4">
                <span className="text-sm font-black text-primary">
                  {searchParams.get('page') || '1'}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {Math.ceil(total / 12)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                disabled={parseInt(searchParams.get('page') || '1') >= Math.ceil(total / 12) || isPending}
                onClick={() => {
                  const currentPage = parseInt(searchParams.get('page') || '1')
                  updateFilters({ page: (currentPage + 1).toString() })
                }}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedMedicine && (
        <MedicineDetailModal
          medicine={selectedMedicine}
          isApproved={approvedMedicineIds.includes(selectedMedicine.id)}
          onClose={() => setSelectedMedicine(null)}
          onAddToCart={handleAddToCart}
          isAdding={addingMedicineId === selectedMedicine.id}
        />
      )}
    </div>
  )
}

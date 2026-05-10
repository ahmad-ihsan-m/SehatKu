'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types/database'
import { useDebounce } from '@/hooks/use-debounce'

interface MedicineFiltersProps {
  categories: Category[]
}

export function MedicineFilters({ categories }: MedicineFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(search, 500)

  const currentCategory = searchParams.get('category') || 'all'
  const currentStock = searchParams.get('stock') || 'all'
  const currentStatus = searchParams.get('status') || 'active'

  useEffect(() => {
    updateFilters({ search: debouncedSearch })
  }, [debouncedSearch])

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset page on filter change
    if (updates.page === undefined) {
      params.delete('page')
    }

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSearch('')
    router.push('?')
  }

  const hasActiveFilters = searchParams.toString().length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama obat..." 
            className="pl-9 h-11 rounded-xl border-muted-foreground/10 focus-visible:ring-primary/20" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={currentCategory} onValueChange={(val) => updateFilters({ category: val })}>
            <SelectTrigger className="h-11 w-[160px] rounded-xl border-muted-foreground/10">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentStock} onValueChange={(val) => updateFilters({ stock: val })}>
            <SelectTrigger className="h-11 w-[150px] rounded-xl border-muted-foreground/10">
              <SelectValue placeholder="Stok" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Stok</SelectItem>
              <SelectItem value="available">Tersedia</SelectItem>
              <SelectItem value="low">Stok Menipis</SelectItem>
              <SelectItem value="out">Stok Habis</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentStatus} onValueChange={(val) => updateFilters({ status: val })}>
            <SelectTrigger className="h-11 w-[140px] rounded-xl border-muted-foreground/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
              <SelectItem value="all">Semua Status</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={clearFilters}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

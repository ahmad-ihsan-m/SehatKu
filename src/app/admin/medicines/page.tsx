import { getAllMedicines, getCategories, type MedicineFilters as MedicineFilterParams } from '@/features/admin/queries'
import { Pill } from 'lucide-react'
import { AddMedicineDialog } from '@/features/admin/components/add-medicine-dialog'
import { MedicineFilters } from '@/features/admin/components/medicine-filters'
import { MedicineTable } from '@/features/admin/components/medicine-table'
import { requireAdmin } from '@/lib/auth/guards'

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    stock?: 'low' | 'out' | 'available'
    status?: 'active' | 'inactive' | 'all'
    page?: string
  }>
}

export default async function AdminMedicinesPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = await searchParams
  
  const filters: MedicineFilterParams = {
    search: params.search,
    categoryId: params.category,
    stockStatus: params.stock,
    isActive: params.status === 'inactive' ? false : params.status === 'all' ? undefined : true,
    page: Number(params.page) || 1,
    pageSize: 10
  }

  const [categories, { medicines, total }] = await Promise.all([
    getCategories(),
    getAllMedicines(filters)
  ])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Pill className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Katalog Obat</h1>
              <p className="text-muted-foreground text-sm font-medium">
                Kelola inventaris, harga, dan ketersediaan obat secara real-time.
              </p>
            </div>
          </div>
        </div>
        <AddMedicineDialog categories={categories} />
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-muted/20">
        <MedicineFilters categories={categories} />
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-bold text-muted-foreground text-sm uppercase tracking-wider">
            Daftar Inventaris
          </h2>
        </div>
        <MedicineTable 
          medicines={medicines} 
          total={total} 
          categories={categories} 
        />
      </div>
    </div>
  )
}


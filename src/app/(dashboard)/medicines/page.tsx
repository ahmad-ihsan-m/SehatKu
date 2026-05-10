import { Pill } from 'lucide-react'
import { getMedicines, getCategories } from '@/features/medicines/queries'
import { MedicinesClient } from '@/features/medicines/components/medicines-client'

import { createClient } from '@/lib/supabase/server'
import { getUserApprovedMedicineIds } from '@/features/prescriptions/queries'

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const filters = {
    search: params.search,
    categoryId: params.category,
    page: params.page && !isNaN(parseInt(params.page)) ? parseInt(params.page) : 1
  }

  const [{ medicines, total }, categories, approvedMedicineIds] = await Promise.all([
    getMedicines(filters),
    getCategories(),
    user ? getUserApprovedMedicineIds(user.id) : Promise.resolve([] as string[])
  ])

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Pill className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Katalog Obat</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Temukan obat yang Anda butuhkan. Kami menyediakan obat bermutu dengan harga terjangkau.
        </p>
      </div>

      {/* Client component handles search, filter, add-to-cart */}
      <MedicinesClient 
        medicines={medicines} 
        categories={categories} 
        approvedMedicineIds={approvedMedicineIds} 
        total={total}
      />
    </div>
  )
}

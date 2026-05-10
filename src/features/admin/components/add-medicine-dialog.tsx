'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MedicineForm } from './medicine-form'
import { createMedicineAction } from '../actions'
import { toast } from 'sonner'
import type { Category } from '@/types/database'
import type { MedicineFormValues } from '../schemas'

interface AddMedicineDialogProps {
  categories: Category[]
}

export function AddMedicineDialog({ categories }: AddMedicineDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (values: MedicineFormValues) => {
    setIsLoading(true)
    const result = await createMedicineAction(values)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Obat berhasil ditambahkan ke katalog')
      setOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold gap-2 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="w-4 h-4" />
          Tambah Obat
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          w-[95vw]
          max-w-[95vw]
          sm:max-w-2xl
          lg:max-w-4xl
          p-0
          overflow-hidden
          rounded-[1.5rem]
          sm:rounded-[2rem]
          border-none
          shadow-2xl
          gap-0
        "
      >
        <div className="flex max-h-[90vh] flex-col">
          {/* Sticky Header with Backdrop Blur */}
          <DialogHeader
            className="
              sticky
              top-0
              z-10
              border-b
              bg-background/80
              backdrop-blur-md
              px-4
              py-4
              sm:px-6
              sm:py-5
            "
          >
            <DialogTitle className="flex items-center gap-4 pr-10">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-primary/10
                  text-primary
                "
              >
                <Plus className="h-5 w-5" />
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="text-base font-black sm:text-xl leading-tight">
                  Tambah Obat Baru
                </span>

                <span className="mt-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground line-clamp-1">
                  Daftarkan produk farmasi baru ke dalam katalog SehatKu
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Form Content */}
          <div
            className="
              flex-1
              overflow-y-auto
              px-6
              py-6
              sm:px-8
              sm:py-8
              lg:px-10
            "
          >
            <MedicineForm
              categories={categories}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

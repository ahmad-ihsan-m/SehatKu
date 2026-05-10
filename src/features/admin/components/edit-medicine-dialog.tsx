'use client'

import { useState } from 'react'
import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MedicineForm } from './medicine-form'
import { updateMedicineAction } from '../actions'
import { toast } from 'sonner'
import type { Category, Medicine } from '@/types/database'
import type { MedicineFormValues } from '../schemas'

interface EditMedicineDialogProps {
  categories: Category[]
  medicine: Medicine
}

export function EditMedicineDialog({
  categories,
  medicine,
}: EditMedicineDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (values: MedicineFormValues) => {
    setIsLoading(true)

    const result = await updateMedicineAction(medicine.id, values)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Informasi obat berhasil diperbarui')
      setOpen(false)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Edit className="h-4 w-4" />
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
                <Edit className="h-5 w-5" />
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="text-base font-black sm:text-xl leading-tight">
                  Edit Informasi Obat
                </span>

                <span className="mt-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground line-clamp-1">
                  Perbarui detail katalog dan stok farmasi untuk SehatKu
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
              initialData={medicine}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
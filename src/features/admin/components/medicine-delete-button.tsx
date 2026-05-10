'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteMedicineAction } from '@/features/admin/actions'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface MedicineDeleteButtonProps {
  id: string
  name: string
}

export function MedicineDeleteButton({ id, name }: MedicineDeleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    const result = await deleteMedicineAction(id)
    if (result.success) {
      toast.success(`Obat ${name} berhasil dihapus`)
    } else {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold">Nonaktifkan Obat?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menonaktifkan <strong>{name}</strong>? Obat ini tidak akan muncul lagi di katalog pelanggan, namun riwayat transaksi tetap tersimpan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Ya, Nonaktifkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

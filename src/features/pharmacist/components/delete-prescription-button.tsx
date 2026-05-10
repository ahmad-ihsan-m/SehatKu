'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { deletePrescriptionAction } from '../actions'
import { toast } from 'sonner'

interface DeletePrescriptionButtonProps {
  prescriptionId: string
}

export function DeletePrescriptionButton({ prescriptionId }: DeletePrescriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onDelete = async () => {
    setIsLoading(true)
    const result = await deletePrescriptionAction(prescriptionId)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Resep berhasil dihapus')
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-sm">
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-xl font-black">Hapus Resep?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              Tindakan ini tidak dapat dibatalkan. Resep akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <AlertDialogCancel className="rounded-2xl h-12 font-bold border-none bg-muted/50 hover:bg-muted transition-all">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            className="rounded-2xl h-12 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20 transition-all"
          >
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

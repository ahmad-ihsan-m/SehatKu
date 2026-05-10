'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { reviewPrescriptionAction } from '@/features/pharmacist/actions'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Loader2, FileText } from 'lucide-react'
import type { PrescriptionStatus } from '@/types/database'

interface PrescriptionReviewPanelProps {
  prescriptionId: string
  currentStatus: PrescriptionStatus
  currentNotes: string | null
}

export function PrescriptionReviewPanel({ prescriptionId, currentStatus, currentNotes }: PrescriptionReviewPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState(currentNotes || '')
  const [isOpen, setIsOpen] = useState(false)

  async function handleReview(status: PrescriptionStatus) {
    if (status === 'rejected' && !notes.trim()) {
      toast.error('Harap isi alasan penolakan pada kolom catatan')
      return
    }

    setIsLoading(true)
    const result = await reviewPrescriptionAction(prescriptionId, status, notes)
    if (result.success) {
      toast.success(`Resep berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`)
      setIsOpen(false)
    } else {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  if (currentStatus !== 'pending') {
    return (
      <div className="pt-2">
        <p className="text-[11px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Catatan Apoteker:</p>
        <p className="text-xs bg-muted p-2 rounded italic text-muted-foreground leading-relaxed">{currentNotes || 'Tidak ada catatan'}</p>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-9 text-xs font-bold gap-2">
          <FileText className="w-3.5 h-3.5" />
          Review Resep
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verifikasi Resep</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan Apoteker / Alasan Penolakan</label>
            <Textarea 
              placeholder="Berikan catatan medis atau alasan jika resep ditolak..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex-row gap-3">
          <Button 
            variant="destructive" 
            className="flex-1 font-bold gap-2" 
            onClick={() => handleReview('rejected')}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Tolak
          </Button>
          <Button 
            variant="default" 
            className="flex-1 font-bold gap-2 bg-green-600 hover:bg-green-700" 
            onClick={() => handleReview('approved')}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Setujui
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

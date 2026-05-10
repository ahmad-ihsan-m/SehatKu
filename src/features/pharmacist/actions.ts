'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requirePharmacist } from '@/lib/auth/guards'
import type { ActionResult, PrescriptionStatus } from '@/types/database'

export async function reviewPrescriptionAction(
  prescriptionId: string, 
  status: PrescriptionStatus, 
  notes: string
): Promise<ActionResult> {
  await requirePharmacist()
  const supabase = await createClient()

  const { data: rx, error: rxError } = await supabase
    .from('prescriptions')
    .select('user_id')
    .eq('id', prescriptionId)
    .single()

  if (rxError) return { error: 'Resep tidak ditemukan' }

  const { error } = await supabase
    .from('prescriptions')
    .update({ 
      status, 
      pharmacist_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', prescriptionId)

  if (error) return { error: error.message }

  // Create notification for customer
  const statusLabel = status === 'approved' ? 'DISETUJUI' : 'DITOLAK'
  await supabase.from('notifications').insert({
    user_id: rx.user_id,
    title: `Resep Anda ${statusLabel}`,
    message: status === 'approved' 
      ? 'Resep Anda telah diverifikasi. Anda sekarang dapat melanjutkan pembelian obat keras.' 
      : `Resep Anda ditolak. Alasan: ${notes}`
  })

  revalidatePath('/pharmacist/prescriptions')
  revalidatePath('/prescriptions')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deletePrescriptionAction(prescriptionId: string): Promise<ActionResult> {
  await requirePharmacist()
  const supabase = await createClient()

  // 1. Get the prescription details to find the image path
  const { data: rx, error: fetchError } = await supabase
    .from('prescriptions')
    .select('image_url')
    .eq('id', prescriptionId)
    .single()

  if (fetchError) return { error: 'Resep tidak ditemukan' }

  // 2. Delete the database record (Orders will set prescription_id to NULL automatically)
  const { error } = await supabase
    .from('prescriptions')
    .delete()
    .eq('id', prescriptionId)

  if (error) return { error: error.message }

  // 3. Clean up storage if record deletion was successful
  if (rx.image_url) {
    const { deleteFileServer } = await import('@/lib/supabase/storage-server')
    // Extract path from URL (e.g., "userid/filename.jpg")
    const path = rx.image_url.split('prescriptions/')[1]
    if (path) {
      await deleteFileServer('prescriptions', path)
    }
  }

  revalidatePath('/pharmacist/prescriptions')
  revalidatePath('/prescriptions')
  return { success: true }
}

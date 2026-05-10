'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireCustomer } from '@/lib/auth/guards'
import type { ActionResult } from '@/types/database'

/**
 * Registers a prescription in the database after successful storage upload.
 * Using this "split" architecture ensures we don't hit Server Action payload limits.
 */
export async function registerPrescriptionAction(
  imageUrl: string,
  medicineId?: string
): Promise<ActionResult> {
  if (!imageUrl) {
    return { error: 'URL gambar resep tidak valid' }
  }

  const user = await requireCustomer()
  const supabase = await createClient()

  try {
    // Create prescription record
    const { error: insertError } = await supabase.from('prescriptions').insert({
      user_id: user.id,
      image_url: imageUrl,
      medicine_id: medicineId || null,
      status: 'pending',
    })

    if (insertError) throw insertError

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Resep Berhasil Terkirim',
      message:
        'Resep Anda sedang dalam proses verifikasi oleh apoteker kami. Mohon tunggu dalam 1x24 jam.',
    })

    revalidatePath('/prescriptions')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (err: any) {
    console.error('[PrescriptionAction] Error:', err)
    return { error: 'Gagal menyimpan data resep ke database' }
  }
}

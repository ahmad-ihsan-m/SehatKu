import { createClient } from '@/lib/supabase/server'
import type { Prescription } from '@/types/database'

export interface PrescriptionWithSignedUrl extends Prescription {
  signedImageUrl: string | null
}

function extractStoragePath(imageUrl: string): string {
  // Raw storage path stored by clientUploadPrivate (most common case)
  if (!imageUrl.startsWith('http')) return imageUrl
  // Legacy: full Supabase URL — extract path after bucket name
  const marker = '/object/prescriptions/'
  const idx = imageUrl.indexOf(marker)
  if (idx === -1) return imageUrl
  return imageUrl.slice(idx + marker.length)
}

async function attachSignedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  prescription: Prescription
): Promise<PrescriptionWithSignedUrl> {
  const storagePath = extractStoragePath(prescription.image_url)
  const { data, error } = await supabase.storage
    .from('prescriptions')
    .createSignedUrl(storagePath, 3600) // 1-hour expiry

  return {
    ...prescription,
    signedImageUrl: error ? null : (data?.signedUrl ?? null),
  }
}

export async function getPrescriptions(
  userId: string
): Promise<PrescriptionWithSignedUrl[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return Promise.all(
    (data as Prescription[]).map((rx) => attachSignedUrl(supabase, rx))
  )
}

export async function getPrescriptionById(
  userId: string,
  prescriptionId: string
): Promise<PrescriptionWithSignedUrl | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', prescriptionId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return attachSignedUrl(supabase, data as Prescription)
}
export async function getApprovedPrescription(
  userId: string, 
  medicineId?: string
): Promise<Prescription | null> {
  const supabase = await createClient()

  let query = supabase
    .from('prescriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (medicineId) {
    query = query.eq('medicine_id', medicineId)
  }

  const { data, error } = await query.limit(1).single()

  if (error || !data) return null
  return data as Prescription
}

export async function getUserApprovedMedicineIds(userId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prescriptions')
    .select('medicine_id')
    .eq('user_id', userId)
    .eq('status', 'approved')

  if (error || !data) return []
  return data.map(rx => rx.medicine_id).filter((id): id is string => !!id)
}

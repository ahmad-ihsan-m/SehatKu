import { createClient } from '@/lib/supabase/server'
import type { Prescription, Profile } from '@/types/database'

export async function getPharmacistStats() {
  const supabase = await createClient()

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('status', 'rejected')
  ])

  return {
    pending: pendingCount.count ?? 0,
    approved: approvedCount.count ?? 0,
    rejected: rejectedCount.count ?? 0
  }
}

export interface PrescriptionWithProfile extends Prescription {
  profiles: { full_name: string | null }
  medicines: { name: string | null } | null
  signedImageUrl?: string | null
}

function extractStoragePath(imageUrl: string): string {
  // If it's already a path (doesn't start with http), return it
  if (!imageUrl.startsWith('http')) return imageUrl
  
  const marker = '/object/prescriptions/'
  const idx = imageUrl.indexOf(marker)
  if (idx === -1) return imageUrl
  return imageUrl.slice(idx + marker.length)
}

export async function getAllPrescriptions(): Promise<PrescriptionWithProfile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, profiles(full_name), medicines(name)')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  const prescriptions = data as unknown as PrescriptionWithProfile[]
  
  // Generate signed URLs for all prescriptions
  return Promise.all(
    prescriptions.map(async (rx) => {
      const storagePath = extractStoragePath(rx.image_url)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('prescriptions')
        .createSignedUrl(storagePath, 3600)
      
      if (signedError) {
        console.error(`[SignedUrl] Error for ${storagePath}:`, signedError.message)
      }
        
      return {
        ...rx,
        signedImageUrl: signedData?.signedUrl ?? null
      }
    })
  )
}


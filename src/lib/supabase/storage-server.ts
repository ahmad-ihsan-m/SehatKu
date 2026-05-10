import { createClient } from '@/lib/supabase/server'

/**
 * Server-side: generates a short-lived signed URL for a private bucket object.
 * Default expiry: 1 hour (3600 seconds). Use for prescription images.
 *
 * This file contains 'next/headers' dependencies and should only be imported
 * in Server Components or Server Actions.
 */
export async function getSignedUrlServer(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('[StorageSignedUrl] Error:', error.message)
    return null
  }

  return data.signedUrl
}

export async function deleteFileServer(bucket: string, path: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  
  if (error) {
    console.error('[StorageDelete] Error:', error.message)
    return false
  }
  
  return true
}

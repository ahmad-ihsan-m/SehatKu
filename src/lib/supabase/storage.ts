import { createClient } from '@/lib/supabase/browser'

/**
 * Client-side upload for public buckets (e.g. avatars).
 * Uses getPublicUrl — only call this for truly public buckets.
 */
export async function clientUploadPublic(
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string; publicUrl: string } | { error: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return { path: data.path, publicUrl: urlData.publicUrl }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengupload file'
    console.error('[StorageUpload] Client error:', message)
    return { error: message }
  }
}

/**
 * Client-side upload for PRIVATE buckets (e.g. prescriptions).
 * Returns the storage path only — do NOT expose this path directly as a URL.
 * Use getSignedUrlServer() on the server to generate a temporary signed URL.
 */
export async function clientUploadPrivate(
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string } | { error: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    return { path: data.path }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengupload file'
    console.error('[StorageUpload] Private upload error:', message)
    return { error: message }
  }
}

/**
 * @deprecated Use clientUploadPrivate for prescriptions and clientUploadPublic for avatars.
 * Kept temporarily for backward compatibility during migration.
 */
export async function clientUpload(
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string; publicUrl: string } | { error: string }> {
  return clientUploadPublic(bucket, path, file)
}

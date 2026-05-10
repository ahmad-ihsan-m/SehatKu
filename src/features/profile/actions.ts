'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/database'

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl = formData.get('currentAvatarUrl') as string

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) return { error: 'Gagal mengupload avatar' }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    avatarUrl = urlData.publicUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/(dashboard)', 'layout')
  return { success: true }
}

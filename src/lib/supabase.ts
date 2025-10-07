import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadImage(file: File, path: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${path}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return {
    path: fileName,
    url: publicUrl
  }
}

export async function deleteImage(path: string) {
  const { error } = await supabase.storage
    .from('product-images')
    .remove([path])

  if (error) {
    throw error
  }
}
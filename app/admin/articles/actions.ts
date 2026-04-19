'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function bulkDeleteArticles(ids: string[]) {
  if (!ids.length) return
  const supabase = await createClient()
  const { error } = await supabase.from('articles').delete().in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/articles')
  revalidatePath('/')
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function bulkDeleteEvents(ids: string[]) {
  if (!ids.length) return
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/events')
  revalidatePath('/')
}

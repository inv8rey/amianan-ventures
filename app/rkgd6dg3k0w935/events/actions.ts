'use server'

import { requireAdmin } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function bulkDeleteEvents(ids: string[]) {
  await requireAdmin()
  if (!ids.length) return
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/rkgd6dg3k0w935/events')
  revalidatePath('/')
}

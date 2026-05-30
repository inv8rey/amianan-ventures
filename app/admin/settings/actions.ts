'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export type AnnouncementInput = {
  enabled: boolean
  message: string
  link_text: string
  link_url: string
  bg_color: 'green' | 'dark' | 'amber' | 'black' | 'white'
}

export async function saveAnnouncement(input: AnnouncementInput) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key: 'announcement_bar', value: input },
        { onConflict: 'key' },
      )
    if (error) return { ok: false as const, error: error.message }
    revalidatePath('/', 'layout')
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: String(e) }
  }
}

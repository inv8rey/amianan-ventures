'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export type BgColor = 'green' | 'dark' | 'amber' | 'black' | 'white'

export type Announcement = {
  message: string
  link_text: string
  link_url: string
  bg_color: BgColor
}

export type AnnouncementBarInput = {
  enabled: boolean
  announcements: Announcement[]
}

export async function saveAnnouncement(input: AnnouncementBarInput) {
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

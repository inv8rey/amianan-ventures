import { AnnouncementBar } from './AnnouncementBar'
import type { Announcement, AnnouncementBarInput } from '@/app/admin/settings/actions'

const DEFAULT: AnnouncementBarInput = { enabled: false, announcements: [] }

async function getAnnouncementConfig(): Promise<AnnouncementBarInput> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_bar')
      .single()

    if (!data?.value) return DEFAULT

    const v = data.value as Record<string, unknown>

    // Backwards compat: old shape had a single `message` at root
    if (typeof v.message === 'string') {
      const single: Announcement = {
        message:   v.message as string,
        link_text: (v.link_text as string) ?? '',
        link_url:  (v.link_url as string) ?? '',
        bg_color:  (v.bg_color as Announcement['bg_color']) ?? 'green',
      }
      return { enabled: !!(v.enabled), announcements: [single] }
    }

    return {
      enabled: !!(v.enabled),
      announcements: Array.isArray(v.announcements) ? v.announcements as Announcement[] : [],
    }
  } catch {
    return DEFAULT
  }
}

export async function AnnouncementBarServer() {
  const config = await getAnnouncementConfig()
  if (!config.enabled || config.announcements.length === 0) return null
  return <AnnouncementBar announcements={config.announcements} />
}

import { AnnouncementBar, type AnnouncementConfig } from './AnnouncementBar'

const DEFAULT_CONFIG: AnnouncementConfig = {
  enabled: false,
  message: '',
  link_text: '',
  link_url: '',
  bg_color: 'green',
}

async function getAnnouncementConfig(): Promise<AnnouncementConfig> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_bar')
      .single()
    if (!data) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...data.value }
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function AnnouncementBarServer() {
  const config = await getAnnouncementConfig()
  if (!config.enabled || !config.message) return null
  return <AnnouncementBar config={config} />
}

import { Megaphone } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { AnnouncementForm } from './AnnouncementForm'
import type { AnnouncementInput } from './actions'

export const dynamic = 'force-dynamic'

const DEFAULT: AnnouncementInput = {
  enabled: false,
  message: '',
  link_text: '',
  link_url: '',
  bg_color: 'green',
}

async function getAnnouncement(): Promise<AnnouncementInput> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_bar')
      .single()
    if (!data) return DEFAULT
    return { ...DEFAULT, ...data.value }
  } catch {
    return DEFAULT
  }
}

export default async function SettingsPage() {
  const announcement = await getAnnouncement()

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-xl font-bold">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage global site configuration</p>
      </div>

      {/* Announcement Bar */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[#00a855]" />
          <h2 className="text-sm font-bold text-zinc-900">Announcement Bar</h2>
        </div>
        <AnnouncementForm initial={announcement} />
      </section>
    </div>
  )
}

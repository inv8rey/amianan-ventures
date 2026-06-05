import Link from 'next/link'
import { Megaphone, Upload, ArrowRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { AnnouncementForm } from './AnnouncementForm'
import type { AnnouncementBarInput, Announcement } from './actions'

export const dynamic = 'force-dynamic'

const DEFAULT: AnnouncementBarInput = { enabled: false, announcements: [] }

async function getAnnouncement(): Promise<AnnouncementBarInput> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'announcement_bar')
      .single()

    if (!data?.value) return DEFAULT

    const v = data.value as Record<string, unknown>

    // Backwards compat: old single-message shape
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

      {/* Import CSV */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-zinc-900">Import CSV</h2>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Bulk Import from Framer CSV</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Upload a Framer CMS export to bulk-import articles and directory listings. Duplicates are automatically skipped.
            </p>
          </div>
          <Link
            href="/admin/import"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-700 transition-colors"
          >
            Open Import <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

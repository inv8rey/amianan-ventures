import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, FileText, Calendar, Building2, ImageIcon, Inbox, Mail, PenLine, Settings2, TrendingUp, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { AdminLogout } from '@/components/admin/AdminLogout'

// Runs on every admin page load — flips past-due scheduled articles to published.
// Uses the service role key so it can see and update scheduled articles (bypasses RLS).
async function autoPublish() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      console.warn('[autoPublish] SUPABASE_SERVICE_ROLE_KEY not set — skipping auto-publish')
      return
    }

    const supabase = createAdminClient(url, serviceKey, { auth: { persistSession: false } })
    const now = new Date().toISOString()

    const { data: due, error: fetchErr } = await supabase
      .from('articles')
      .select('id, slug, category')
      .eq('status', 'scheduled')
      .lte('published_at', now)

    if (fetchErr) {
      console.error('[autoPublish] fetch failed:', fetchErr.message)
      return
    }

    if (!due?.length) return

    const { error } = await supabase
      .from('articles')
      .update({ status: 'published' })
      .in('id', due.map((a) => a.id))

    if (error) {
      console.error('[autoPublish] update failed:', error.message)
      return
    }

    revalidatePath('/news')
    revalidatePath('/founder-stories')
    revalidatePath('/')
    for (const a of due) revalidatePath(`/${a.category}/${a.slug}`)
    console.log(`[autoPublish] published ${due.length} article(s)`)
  } catch (e) {
    console.error('[autoPublish] unexpected error:', e)
  }
}

const navItems = [
  { href: '/admin',                  label: 'Dashboard',        icon: LayoutDashboard, exact: true  },
  { href: '/admin/articles',         label: 'Articles',         icon: FileText,        exact: false },
  { href: '/admin/events',           label: 'Events',           icon: Calendar,        exact: false },
  { href: '/admin/directory',        label: 'Directory',        icon: Building2,       exact: false },
  { href: '/admin/featured-listings',label: 'Featured Listings',icon: ImageIcon,       exact: false },
  { href: '/admin/contributions',    label: 'Contributions',    icon: PenLine,         exact: false },
  { href: '/admin/comments',         label: 'Comments',         icon: MessageCircle,   exact: false },
  { href: '/admin/ecosystem-pulse',  label: 'Ecosystem Pulse',  icon: TrendingUp,      exact: false },
  { href: '/admin/submissions',      label: 'Submissions',      icon: Inbox,           exact: false },
  { href: '/admin/newsletter',       label: 'Newsletter',       icon: Mail,            exact: false },
  { href: '/admin/settings',         label: 'Settings',         icon: Settings2,       exact: false },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Auto-publish any past-due scheduled articles on every admin page load
  await autoPublish()

  // ── Notification badge counts ──────────────────────────────
  let contributionsBadge = 0
  let submissionsBadge = 0
  let commentsBadge = 0
  try {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supa = createAdminClient(url, key, { auth: { persistSession: false } })
    const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
      supa.from('contributor_submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
      supa.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supa.from('article_comments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    contributionsBadge = c1 ?? 0
    submissionsBadge   = c2 ?? 0
    commentsBadge      = c3 ?? 0
  } catch { /* non-critical — skip badges on error */ }

  const badgeMap: Record<string, number> = {
    '/admin/contributions': contributionsBadge,
    '/admin/submissions':   submissionsBadge,
    '/admin/comments':      commentsBadge,
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border/40 bg-card flex flex-col">
        <div className="p-5 border-b border-border/40">
          <Link href="/admin" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/amianan.svg" alt="Amianan Ventures" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold">AV Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const badge = badgeMap[item.href] ?? 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border/40">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <AdminLogout />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

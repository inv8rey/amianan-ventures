import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, FileText, Calendar, Building2, Upload, ImageIcon, Inbox, Mail, BarChart2, PenLine, Users, Target } from 'lucide-react'
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
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2, exact: false },
  { href: '/admin/goals', label: 'Goals & OKRs', icon: Target, exact: false },
  { href: '/admin/articles', label: 'Articles', icon: FileText, exact: false },
  { href: '/admin/events', label: 'Events', icon: Calendar, exact: false },
  { href: '/admin/directory', label: 'Directory', icon: Building2, exact: false },
  { href: '/admin/featured-listings', label: 'Featured Listings', icon: ImageIcon, exact: false },
  { href: '/admin/contributions', label: 'Contributions', icon: PenLine, exact: false },
  { href: '/admin/contributors', label: 'Contributors', icon: Users, exact: false },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox, exact: false },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, exact: false },
  { href: '/admin/import', label: 'Import CSV', icon: Upload, exact: false },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Auto-publish any past-due scheduled articles on every admin page load
  await autoPublish()

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

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
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

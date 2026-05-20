import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, FileText, Calendar, Building2, Upload, ImageIcon, Inbox, Mail, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { AdminLogout } from '@/components/admin/AdminLogout'

// Runs on every admin page load — flips past-due scheduled articles to published.
async function autoPublish(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const now = new Date().toISOString()
    const { data: due } = await supabase
      .from('articles')
      .select('id, slug, category')
      .eq('status', 'scheduled')
      .lte('published_at', now)

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
  { href: '/admin/articles', label: 'Articles', icon: FileText, exact: false },
  { href: '/admin/events', label: 'Events', icon: Calendar, exact: false },
  { href: '/admin/directory', label: 'Directory', icon: Building2, exact: false },
  { href: '/admin/featured-listings', label: 'Featured Listings', icon: ImageIcon, exact: false },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox, exact: false },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, exact: false },
  { href: '/admin/import', label: 'Import CSV', icon: Upload, exact: false },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Auto-publish any past-due scheduled articles on every admin page load
  await autoPublish(supabase)

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

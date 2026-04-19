import Link from 'next/link'
import { FileText, Calendar, Building2, PlusCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: articleCount },
    { count: eventCount },
    { count: directoryCount },
    { data: recentArticles },
    { data: recentDirectory },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('directory').select('*', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id, title, status, category, published_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('directory')
      .select('id, name, type, status')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Total Articles', value: articleCount ?? 0, icon: FileText, color: 'text-primary', href: '/admin/articles' },
    { label: 'Total Events', value: eventCount ?? 0, icon: Calendar, color: 'text-emerald-400', href: '/admin/events' },
    { label: 'Directory Listings', value: directoryCount ?? 0, icon: Building2, color: 'text-blue-400', href: '/admin/directory' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Amianan Ventures CMS</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View site <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-border/40 bg-card p-5 hover:border-border transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/admin/articles/new', label: 'New Article', sub: 'Write a news story or founder story', color: 'text-primary', bg: 'bg-primary/10 group-hover:bg-primary/20' },
          { href: '/admin/events/new', label: 'New Event', sub: 'Add an upcoming event or workshop', color: 'text-emerald-400', bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20' },
          { href: '/admin/directory/new', label: 'New Listing', sub: 'Add a startup, program, or organization', color: 'text-blue-400', bg: 'bg-blue-500/10 group-hover:bg-blue-500/20' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 p-4 rounded-lg border border-border/40 bg-card hover:border-border transition-colors group"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${action.bg}`}>
              <PlusCircle className={`h-4.5 w-4.5 ${action.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column: recent articles + recent directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent articles */}
        <div className="rounded-lg border border-border/40 bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <h2 className="text-sm font-semibold">Recent Articles</h2>
            <Link href="/admin/articles" className="text-xs text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-border/40">
            {recentArticles?.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articles/${article.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{article.category.replace('-', ' ')}</p>
                </div>
                <span className={`ml-3 shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  article.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
                }`}>
                  {article.status}
                </span>
              </Link>
            ))}
            {!recentArticles?.length && (
              <p className="p-4 text-sm text-muted-foreground text-center">No articles yet.</p>
            )}
          </div>
        </div>

        {/* Recent directory */}
        <div className="rounded-lg border border-border/40 bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <h2 className="text-sm font-semibold">Recent Directory</h2>
            <Link href="/admin/directory" className="text-xs text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-border/40">
            {recentDirectory?.map((entry) => (
              <Link
                key={entry.id}
                href={`/admin/directory/${entry.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{entry.type}</p>
                </div>
                <span className={`ml-3 shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  entry.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
                }`}>
                  {entry.status}
                </span>
              </Link>
            ))}
            {!recentDirectory?.length && (
              <p className="p-4 text-sm text-muted-foreground text-center">
                No listings yet.{' '}
                <Link href="/admin/directory/new" className="text-primary hover:underline">Add one</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

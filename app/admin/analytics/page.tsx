import { createClient } from '@/lib/supabase/server'
import { fetchGa4Stats } from '@/lib/ga4'
import {
  Globe, Users, FileText, Eye, Mail, TrendingUp,
  BarChart2, ArrowUpRight, Settings, Activity,
} from 'lucide-react'
import Link from 'next/link'
import type { Article } from '@/types'

export const revalidate = 300 // 5-minute cache

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SOURCE_COLORS: Record<string, string> = {
  'Organic Search': 'bg-emerald-500',
  'Direct': 'bg-blue-500',
  'Organic Social': 'bg-pink-500',
  'Referral': 'bg-purple-500',
  'Email': 'bg-amber-500',
  'Paid Search': 'bg-red-500',
  'Unassigned': 'bg-zinc-500',
}
function sourceColor(name: string) {
  return SOURCE_COLORS[name] ?? 'bg-zinc-400'
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function Bar({ pct, color = 'bg-primary' }: { pct: number; color?: string }) {
  return (
    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function AnalyticsPage() {
  const supabase = await createClient()

  // ---- Supabase queries (all in parallel) ----------------------------------
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    { count: publishedCount },
    { count: draftCount },
    { count: scheduledCount },
    { count: newsCount },
    { count: founderCount },
    { count: subscriberCount },
    { count: newSubsCount },
    { count: submissionCount },
    { data: topArticles },
    { data: recentArticles },
    { data: allPublished },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published').eq('category', 'news'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published').eq('category', 'founder-stories'),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', thisMonthStart),
    supabase.from('form_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('articles').select('id, title, slug, category, views, published_at').order('views', { ascending: false }).limit(10),
    supabase.from('articles').select('published_at').eq('status', 'published').gte('published_at', sixMonthsAgo.toISOString()).order('published_at'),
    supabase.from('articles').select('views').eq('status', 'published'),
  ])

  const totalViews = (allPublished ?? []).reduce((s, a) => s + ((a as Article).views ?? 0), 0)

  // Group articles by month for publishing chart
  const monthlyMap: Record<string, number> = {}
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = 0
  }
  for (const row of recentArticles ?? []) {
    if (!row.published_at) continue
    const d = new Date(row.published_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in monthlyMap) monthlyMap[key]++
  }
  const monthlyData = Object.entries(monthlyMap).map(([key, count]) => {
    const [yr, mo] = key.split('-')
    const label = new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' })
    return { label, count }
  })
  const maxMonthly = Math.max(...monthlyData.map((d) => d.count), 1)

  // ---- GA4 ------------------------------------------------------------------
  const ga4 = await fetchGa4Stats()
  const ga4Ready = !!process.env.GA4_PROPERTY_ID

  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {ga4 ? 'GA4 + Supabase data · Last 30 days' : 'Supabase content data · GA4 not connected'}
          </p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">Refreshes every 5 min</span>
      </div>

      {/* ── TOP STAT CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* GA4 stats */}
        <div className="rounded-lg border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Pageviews (30d)</p>
            <Globe className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{ga4 ? fmt(ga4.totalPageviews) : '—'}</p>
          {!ga4Ready && <p className="text-[10px] text-muted-foreground mt-1">GA4 not set up</p>}
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Sessions (30d)</p>
            <Users className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold">{ga4 ? fmt(ga4.totalSessions) : '—'}</p>
          {!ga4Ready && <p className="text-[10px] text-muted-foreground mt-1">GA4 not set up</p>}
        </div>

        {/* Supabase stats */}
        <div className="rounded-lg border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Published Articles</p>
            <FileText className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{publishedCount ?? 0}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{draftCount ?? 0} draft · {scheduledCount ?? 0} scheduled</p>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Total Article Views</p>
            <Eye className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold">{fmt(totalViews)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">across all published</p>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Subscribers</p>
            <Mail className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold">{subscriberCount ?? 0}</p>
          <p className="text-[10px] text-muted-foreground mt-1">+{newSubsCount ?? 0} this month</p>
        </div>
      </div>

      {/* ── ROW 2: Traffic Sources + Content Breakdown ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Traffic Sources */}
        <div className="rounded-lg border border-border/40 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Traffic Sources</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">last 30 days</span>
          </div>
          {ga4 && ga4.sources.length > 0 ? (
            <div className="space-y-3">
              {ga4.sources.map((src) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{src.source}</span>
                    <span className="text-muted-foreground">{fmt(src.sessions)} sessions · {src.pct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bar pct={src.pct} color={sourceColor(src.source)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Globe className="h-6 w-6 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">GA4 not connected</p>
              <p className="text-xs text-muted-foreground mt-1">Set up GA4 API to see traffic sources</p>
            </div>
          )}
        </div>

        {/* Content Breakdown */}
        <div className="rounded-lg border border-border/40 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Content Breakdown</h2>
          </div>
          <div className="space-y-5">
            {/* By Category */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Category</p>
              <div className="space-y-2">
                {[
                  { label: 'News', count: newsCount ?? 0, color: 'bg-primary' },
                  { label: 'Founder Stories', count: founderCount ?? 0, color: 'bg-amber-500' },
                ].map((item) => {
                  const total = (newsCount ?? 0) + (founderCount ?? 0)
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.count} · {pct}%</span>
                      </div>
                      <Bar pct={pct} color={item.color} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* By Status */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Status</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Published', count: publishedCount ?? 0, color: 'text-emerald-400 bg-emerald-500/15' },
                  { label: 'Scheduled', count: scheduledCount ?? 0, color: 'text-amber-400 bg-amber-500/15' },
                  { label: 'Draft', count: draftCount ?? 0, color: 'text-muted-foreground bg-muted' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-md p-3 text-center ${item.color}`}>
                    <p className="text-lg font-bold">{item.count}</p>
                    <p className="text-[10px] font-medium opacity-80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submissions */}
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">Pending Submissions</p>
                  <p className="text-[10px] text-muted-foreground">unread form entries</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{submissionCount ?? 0}</span>
                  <Link href="/admin/submissions" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                    View <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Top Articles + GA4 Top Pages ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Articles by site views */}
        <div className="rounded-lg border border-border/40 bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Top Articles by Views</h2>
            </div>
            <span className="text-[10px] text-muted-foreground">all time</span>
          </div>
          <div className="divide-y divide-border/40">
            {(topArticles ?? []).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No view data yet — views are tracked on each article visit.</p>
            ) : (
              (topArticles ?? []).map((article, i) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{article.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{(article.category as string).replace('-', ' ')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-semibold">{fmt((article as Article).views ?? 0)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* GA4 Top Pages */}
        <div className="rounded-lg border border-border/40 bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Top Pages (GA4)</h2>
            </div>
            <span className="text-[10px] text-muted-foreground">last 30 days</span>
          </div>
          <div className="divide-y divide-border/40">
            {!ga4 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">GA4 not connected</p>
              </div>
            ) : ga4.topPages.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No page data yet.</p>
            ) : (
              ga4.topPages.map((page, i) => {
                const label = page.page === '/' ? 'Homepage' : page.page
                return (
                  <div key={page.page} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <p className="flex-1 text-sm font-mono text-xs truncate text-muted-foreground">{label}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-semibold">{fmt(page.views)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Publishing Activity ───────────────────────────────────── */}
      <div className="rounded-lg border border-border/40 bg-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Publishing Activity</h2>
          <span className="text-[10px] text-muted-foreground ml-auto">last 6 months</span>
        </div>
        <div className="flex items-end gap-3 h-28">
          {monthlyData.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground">{count > 0 ? count : ''}</span>
              <div className="w-full flex items-end" style={{ height: '72px' }}>
                <div
                  className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: count > 0 ? `${Math.max(Math.round((count / maxMonthly) * 72), 4)}px` : '2px', opacity: count > 0 ? 1 : 0.2 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── GA4 Setup Card (shown if not configured) ────────────────────── */}
      {!ga4Ready && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <Settings className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-300">Connect GA4 for Traffic Analytics</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To see pageviews, sessions, and traffic sources you need to connect the GA4 Data API.
                Add these 3 environment variables in Vercel:
              </p>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex gap-2">
                  <span className="text-amber-400 shrink-0">GA4_PROPERTY_ID</span>
                  <span className="text-muted-foreground">— your numeric property ID (e.g. 123456789)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-amber-400 shrink-0">GA4_SERVICE_ACCOUNT_EMAIL</span>
                  <span className="text-muted-foreground">— service account email from Google Cloud</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-amber-400 shrink-0">GA4_PRIVATE_KEY</span>
                  <span className="text-muted-foreground">— the private_key field from your service account JSON</span>
                </div>
              </div>
              <a
                href="https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
              >
                GA4 Data API setup guide <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

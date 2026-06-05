import Link from 'next/link'
import Image from 'next/image'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/service'
import { format } from 'date-fns'
import { ImageIcon, Users, FileText, CheckCircle, Clock } from 'lucide-react'
import {
  CONTENT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  ROLE_LABELS,
  type ContributorSubmission,
  type SubmissionStatus,
  type ContributorProfile,
  type ContributorRole,
} from '@/types/contributor'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all',                label: 'All' },
  { value: 'submitted',          label: 'Submitted' },
  { value: 'under_review',       label: 'Under Review' },
  { value: 'revision_requested', label: 'Revision Requested' },
  { value: 'approved',           label: 'Approved' },
  { value: 'rejected',           label: 'Rejected' },
  { value: 'published',          label: 'Published' },
]

// ── Contributors tab ──────────────────────────────────────────────────────────

interface ContributorRow {
  id: string
  display_name: string
  full_name: string | null
  role: string | null
  organization: string | null
  region: string | null
  photo_url: string | null
  created_at: string
  email: string | null
  total: number
  published: number
  under_review: number
}

async function ContributorsTab() {
  const supabase = createServiceClient()

  const { data: profiles } = await supabase
    .from('contributor_profiles')
    .select('id, display_name, full_name, role, organization, region, photo_url, created_at')
    .order('created_at', { ascending: false })

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">No contributors yet</p>
        <p className="text-xs text-muted-foreground mt-1">Registered contributors will appear here</p>
      </div>
    )
  }

  const { data: submissions } = await supabase
    .from('contributor_submissions')
    .select('contributor_id, status')

  const countMap: Record<string, { total: number; published: number; under_review: number }> = {}
  for (const s of submissions ?? []) {
    if (!countMap[s.contributor_id]) countMap[s.contributor_id] = { total: 0, published: 0, under_review: 0 }
    countMap[s.contributor_id].total++
    if (s.status === 'published')                                         countMap[s.contributor_id].published++
    if (s.status === 'submitted' || s.status === 'under_review')         countMap[s.contributor_id].under_review++
  }

  // Fetch emails from auth.users
  const emailMap: Record<string, string> = {}
  await Promise.all(
    profiles.map(async (p) => {
      const { data } = await supabase.auth.admin.getUserById(p.id)
      if (data?.user?.email) emailMap[p.id] = data.user.email
    })
  )

  const rows: ContributorRow[] = profiles.map((p) => ({
    ...p,
    email: emailMap[p.id] ?? null,
    total:        countMap[p.id]?.total        ?? 0,
    published:    countMap[p.id]?.published    ?? 0,
    under_review: countMap[p.id]?.under_review ?? 0,
  }))

  const totalPublished = rows.reduce((a, r) => a + r.published, 0)
  const activeReview   = rows.reduce((a, r) => a + r.under_review, 0)

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Total Contributors</span>
          </div>
          <p className="text-2xl font-black">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground font-medium">Published Articles</span>
          </div>
          <p className="text-2xl font-black">{totalPublished}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground font-medium">In Review</span>
          </div>
          <p className="text-2xl font-black">{activeReview}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contributor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organization</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submissions</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Published</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.photo_url} alt={row.display_name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 text-white text-xs font-black">
                        {row.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground leading-none">{row.display_name}</p>
                      {row.full_name && row.full_name !== row.display_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">{row.full_name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.email ?? <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {row.role ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                      {ROLE_LABELS[row.role as ContributorRole] ?? row.role}
                    </span>
                  ) : <span className="text-xs text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                  {row.organization ?? <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                    <FileText className="h-3 w-3 text-muted-foreground" />{row.total}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.published > 0
                    ? <span className="text-xs font-bold text-emerald-600">{row.published}</span>
                    : <span className="text-xs text-zinc-300">0</span>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(row.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/contributions?status=all&contributor=${row.id}`}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                    View submissions →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function AdminContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tab?: string }>
}) {
  const { status: filterStatus, tab: rawTab } = await searchParams
  const activeTab    = rawTab === 'contributors' ? 'contributors' : 'submissions'
  const activeFilter = filterStatus ?? 'all'

  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase   = createAdminClient(url, serviceKey, { auth: { persistSession: false } })

  // Count unreviewed for the "Submissions" tab badge
  const { count: unreviewed } = await supabase
    .from('contributor_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Contributions</h1>
            {!!unreviewed && unreviewed > 0 && activeTab === 'submissions' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold">
                {unreviewed} new
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top-level tab switcher */}
      <div className="flex gap-1 mb-6 border-b border-border/40">
        <Link
          href="/admin/contributions"
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === 'submissions'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Submissions
          {!!unreviewed && unreviewed > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold">
              {unreviewed}
            </span>
          )}
        </Link>
        <Link
          href="/admin/contributions?tab=contributors"
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === 'contributors'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Contributors
        </Link>
      </div>

      {/* ── Submissions tab ── */}
      {activeTab === 'submissions' && (
        <SubmissionsTab filterStatus={filterStatus} supabase={supabase} />
      )}

      {/* ── Contributors tab ── */}
      {activeTab === 'contributors' && <ContributorsTab />}
    </div>
  )
}

// ── Submissions tab component ─────────────────────────────────────────────────

async function SubmissionsTab({
  filterStatus,
  supabase,
}: {
  filterStatus: string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
}) {
  const activeFilter = filterStatus ?? 'all'

  let query = supabase
    .from('contributor_submissions')
    .select(`
      *,
      contributor_profiles (
        display_name, full_name, role, organization, region
      )
    `)
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data: submissions } = await query

  type SubmissionWithProfile = ContributorSubmission & { contributor_profiles: ContributorProfile }
  const items = (submissions ?? []) as SubmissionWithProfile[]

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">{items.length} submission{items.length !== 1 ? 's' : ''} shown</p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/contributions' : `/admin/contributions?status=${f.value}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === f.value
                ? 'bg-black text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contributor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Headline</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((sub) => {
                const status = sub.status as SubmissionStatus
                return (
                  <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(sub.created_at), 'MMM d')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm line-clamp-1">
                        {sub.contributor_profiles?.display_name ?? '—'}
                      </p>
                      {sub.contributor_profiles?.organization && (
                        <p className="text-[10px] text-muted-foreground">{sub.contributor_profiles.organization}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {CONTENT_TYPE_LABELS[sub.content_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-12 h-8 rounded overflow-hidden shrink-0 bg-muted">
                          {sub.cover_image_url ? (
                            <Image src={sub.cover_image_url} alt="" fill className="object-cover" sizes="48px" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-3 w-3 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <p className="font-medium line-clamp-1 text-sm">{sub.headline}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/contributions/${sub.id}`}
                        className="text-xs font-semibold text-primary hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No submissions {activeFilter !== 'all' ? `with status "${activeFilter}"` : 'yet'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

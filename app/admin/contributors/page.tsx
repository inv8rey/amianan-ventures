import { createServiceClient } from '@/lib/supabase/service'
import { format } from 'date-fns'
import { Users, FileText, CheckCircle, Clock } from 'lucide-react'
import { ROLE_LABELS, type ContributorRole } from '@/types/contributor'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

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

export default async function AdminContributorsPage() {
  const supabase = createServiceClient()

  // Fetch all contributor profiles
  const { data: profiles } = await supabase
    .from('contributor_profiles')
    .select('id, display_name, full_name, role, organization, region, photo_url, created_at')
    .order('created_at', { ascending: false })

  if (!profiles || profiles.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Contributors</h1>
          <p className="text-sm text-muted-foreground mt-1">All registered contributor accounts</p>
        </div>
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No contributors yet</p>
          <p className="text-xs text-muted-foreground mt-1">Registered contributors will appear here</p>
        </div>
      </div>
    )
  }

  // Fetch submissions counts per contributor
  const { data: submissions } = await supabase
    .from('contributor_submissions')
    .select('contributor_id, status')

  const countMap: Record<string, { total: number; published: number; under_review: number }> = {}
  for (const s of submissions ?? []) {
    if (!countMap[s.contributor_id]) countMap[s.contributor_id] = { total: 0, published: 0, under_review: 0 }
    countMap[s.contributor_id].total++
    if (s.status === 'published') countMap[s.contributor_id].published++
    if (s.status === 'submitted' || s.status === 'under_review') countMap[s.contributor_id].under_review++
  }

  // Fetch emails from auth.users via admin API
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
    total: countMap[p.id]?.total ?? 0,
    published: countMap[p.id]?.published ?? 0,
    under_review: countMap[p.id]?.under_review ?? 0,
  }))

  const totalContributors = rows.length
  const totalPublished = rows.reduce((a, r) => a + r.published, 0)
  const activeReview = rows.reduce((a, r) => a + r.under_review, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contributors</h1>
        <p className="text-sm text-muted-foreground mt-1">All registered contributor accounts</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Total Contributors</span>
          </div>
          <p className="text-2xl font-black">{totalContributors}</p>
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

      {/* Table */}
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
                {/* Avatar + name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.photo_url}
                        alt={row.display_name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                      />
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

                {/* Email */}
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.email ?? <span className="text-zinc-300">—</span>}
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  {row.role ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                      {ROLE_LABELS[row.role as ContributorRole] ?? row.role}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-300">—</span>
                  )}
                </td>

                {/* Organization */}
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                  {row.organization ?? <span className="text-zinc-300">—</span>}
                </td>

                {/* Submissions count */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    {row.total}
                  </span>
                </td>

                {/* Published count */}
                <td className="px-4 py-3 text-center">
                  {row.published > 0 ? (
                    <span className="text-xs font-bold text-emerald-600">{row.published}</span>
                  ) : (
                    <span className="text-xs text-zinc-300">0</span>
                  )}
                </td>

                {/* Joined */}
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(row.created_at), 'MMM d, yyyy')}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/contributions?contributor=${row.id}`}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
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

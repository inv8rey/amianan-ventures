import Link from 'next/link'
import Image from 'next/image'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { ImageIcon } from 'lucide-react'
import {
  CONTENT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type ContributorSubmission,
  type SubmissionStatus,
  type ContributorProfile,
} from '@/types/contributor'

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'revision_requested', label: 'Revision Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'published', label: 'Published' },
]

export default async function AdminContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const activeFilter = filterStatus ?? 'all'

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createAdminClient(url, serviceKey, { auth: { persistSession: false } })

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

  // Count unreviewed (submitted) for badge
  const { count: unreviewed } = await supabase
    .from('contributor_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')

  type SubmissionWithProfile = ContributorSubmission & { contributor_profiles: ContributorProfile }
  const items = (submissions ?? []) as SubmissionWithProfile[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Contributions</h1>
            {!!unreviewed && unreviewed > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold">
                {unreviewed} new
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{items.length} submission{items.length !== 1 ? 's' : ''} shown</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map((f) => (
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
                  <tr
                    key={sub.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
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
                        {/* Cover thumbnail */}
                        <div className="relative w-12 h-8 rounded overflow-hidden shrink-0 bg-muted">
                          {sub.cover_image_url ? (
                            <Image
                              src={sub.cover_image_url}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
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
                      <Link
                        href={`/admin/contributions/${sub.id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
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

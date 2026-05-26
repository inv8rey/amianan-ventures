import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { ArrowLeft, ExternalLink } from 'lucide-react'
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
import { EditorActions } from '@/components/contributor/EditorActions'

export default async function EditorReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createAdminClient(url, serviceKey, { auth: { persistSession: false } })

  const { data: sub } = await supabase
    .from('contributor_submissions')
    .select(`
      *,
      contributor_profiles (*)
    `)
    .eq('id', id)
    .single()

  if (!sub) notFound()

  type SubWithProfile = ContributorSubmission & { contributor_profiles: ContributorProfile }
  const submission = sub as SubWithProfile
  const status = submission.status as SubmissionStatus

  // Auto-advance to under_review when editor opens it
  if (status === 'submitted') {
    await supabase
      .from('contributor_submissions')
      .update({ status: 'under_review', reviewed_at: new Date().toISOString() })
      .eq('id', id)

    // Fire email in background (don't await to not block render)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/contributor/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'under_review', submissionId: id }),
    }).catch(() => {})

    // Use updated status for display
    submission.status = 'under_review'
  }

  const profile = submission.contributor_profiles
  const currentStatus = submission.status as SubmissionStatus

  return (
    <div>
      {/* Back */}
      <Link
        href="/admin/contributions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Contributions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Submission header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {CONTENT_TYPE_LABELS[submission.content_type]}
                </span>
                <h1 className="text-xl font-bold mt-1 leading-snug">{submission.headline}</h1>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_COLORS[currentStatus]}`}>
                {STATUS_LABELS[currentStatus]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Submitted {format(new Date(submission.submitted_at), 'MMMM d, yyyy')}
              {submission.reviewed_at && ` · Reviewed ${format(new Date(submission.reviewed_at), 'MMM d')}`}
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border/40 bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary / Pitch</p>
            <p className="text-sm leading-relaxed">{submission.summary}</p>
            {(submission.region || submission.sector) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {submission.region && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {submission.region.replace('-', ' ')}
                  </span>
                )}
                {submission.sector && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {submission.sector}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Draft content */}
          <div className="rounded-lg border border-border/40 bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Draft Content</p>
            {submission.draft_type === 'gdocs' && submission.gdocs_url ? (
              <a
                href={submission.gdocs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Google Doc
              </a>
            ) : submission.draft_content ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: submission.draft_content }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No draft content</p>
            )}
          </div>

          {/* Published link (if live) */}
          {currentStatus === 'published' && submission.published_url && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold text-emerald-400 mb-1.5">Published Article</p>
              <a
                href={submission.published_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {submission.published_url}
              </a>
            </div>
          )}

          {/* Existing revision notes */}
          {submission.revision_notes && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
              <p className="text-xs font-semibold text-orange-400 mb-1.5">Previous Revision Notes</p>
              <p className="text-sm text-orange-300 leading-relaxed whitespace-pre-wrap">{submission.revision_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar — right 1/3 */}
        <div className="space-y-4">
          {/* Contributor card */}
          <div className="rounded-lg border border-border/40 bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contributor</p>
            <p className="font-semibold text-sm">{profile?.display_name ?? '—'}</p>
            {profile?.full_name && (
              <p className="text-xs text-muted-foreground">{profile.full_name}</p>
            )}
            {profile?.role && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {ROLE_LABELS[profile.role as ContributorRole]}
              </p>
            )}
            {profile?.organization && (
              <p className="text-xs text-muted-foreground">{profile.organization}</p>
            )}
            {profile?.region && (
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                {profile.region.replace('-', ' ')}
              </p>
            )}
            {profile?.bio && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t border-border/40 pt-2">
                {profile.bio}
              </p>
            )}
            {(profile?.linkedin_url || profile?.website_url) && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-border/40">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">LinkedIn</a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">Website</a>
                )}
              </div>
            )}
          </div>

          {/* Editor actions */}
          <EditorActions submission={submission} />
        </div>
      </div>
    </div>
  )
}

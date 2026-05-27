import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle2, Clock, Eye, Pencil, XCircle } from 'lucide-react'
import {
  CONTENT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type ContributorSubmission,
  type SubmissionStatus,
} from '@/types/contributor'

const STATUS_ICON: Record<SubmissionStatus, React.ElementType> = {
  draft: Pencil,
  submitted: Clock,
  under_review: Eye,
  revision_requested: AlertTriangle,
  approved: CheckCircle2,
  rejected: XCircle,
  published: CheckCircle2,
}

const STATUS_ORDER: SubmissionStatus[] = [
  'submitted', 'under_review', 'approved', 'published',
]

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  const { data: sub } = await supabase
    .from('contributor_submissions')
    .select('*')
    .eq('id', id)
    .eq('contributor_id', user.id)
    .single()

  if (!sub) notFound()

  const submission = sub as ContributorSubmission
  const status = submission.status as SubmissionStatus
  const StatusIcon = STATUS_ICON[status]
  const isRejected = status === 'rejected'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>

      {/* Status header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
            {CONTENT_TYPE_LABELS[submission.content_type]}
          </span>
          <h1 className="text-xl font-black text-zinc-900 leading-snug">{submission.headline}</h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            Submitted {format(new Date(submission.submitted_at), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${STATUS_COLORS[status]}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {STATUS_LABELS[status]}
        </div>
      </div>

      {/* Revision notes callout */}
      {status === 'revision_requested' && submission.revision_notes && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <p className="text-sm font-bold text-orange-800">Editor&apos;s Feedback</p>
          </div>
          <p className="text-sm text-orange-700 leading-relaxed whitespace-pre-wrap">
            {submission.revision_notes}
          </p>
          <div className="mt-4">
            <Link
              href={`/submit?edit=${submission.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit and Resubmit
            </Link>
          </div>
        </div>
      )}

      {/* Published link */}
      {status === 'published' && submission.published_url && (
        <div className="bg-[#00a855]/5 border border-[#00a855]/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-[#00a855]" />
            <p className="text-sm font-bold text-[#00a855]">Your article is live!</p>
          </div>
          <a
            href={submission.published_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00a855] hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Read your article on amiananventures.org
          </a>
        </div>
      )}

      {/* Rejected notice */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm font-bold text-red-700">Not accepted at this time</p>
          </div>
          <p className="text-sm text-red-600">
            This submission was not accepted. You&apos;re welcome to submit a new piece anytime.
          </p>
          <Link
            href="/submit"
            className="inline-block mt-3 text-xs font-bold text-red-700 hover:underline"
          >
            Submit another piece →
          </Link>
        </div>
      )}

      {/* Status timeline */}
      {!isRejected && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Status Timeline</p>
          <div className="flex items-center gap-0">
            {STATUS_ORDER.map((s, i) => {
              const currentIdx = STATUS_ORDER.indexOf(status === 'revision_requested' ? 'under_review' : status)
              const done = i < currentIdx
              const active = i === currentIdx
              const upcoming = i > currentIdx
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      done ? 'bg-[#00a855] text-white' :
                      active ? 'bg-black text-white' :
                      'bg-zinc-200 text-zinc-400'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[9px] font-semibold mt-1 text-center ${
                      active ? 'text-zinc-900' : upcoming ? 'text-zinc-400' : 'text-[#00a855]'
                    }`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`flex-1 h-px mb-5 ${done ? 'bg-[#00a855]' : 'bg-zinc-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Submission details */}
      <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
        <div className="px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Summary / Pitch</p>
          <p className="text-sm text-zinc-700 leading-relaxed">{submission.summary}</p>
        </div>
        {(submission.region || submission.sector) && (
          <div className="px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {submission.region && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 capitalize">
                  {submission.region.replace('-', ' ')}
                </span>
              )}
              {submission.sector && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                  {submission.sector}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Draft</p>
          {submission.draft_type === 'gdocs' && submission.gdocs_url ? (
            <a
              href={submission.gdocs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#00a855] hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Google Doc
            </a>
          ) : submission.draft_content ? (
            <div
              className="prose prose-sm max-w-none text-zinc-700"
              dangerouslySetInnerHTML={{ __html: submission.draft_content }}
            />
          ) : (
            <p className="text-sm text-zinc-400">No draft content</p>
          )}
        </div>
      </div>
    </div>
  )
}

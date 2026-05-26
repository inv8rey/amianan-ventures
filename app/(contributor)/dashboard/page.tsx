import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import {
  CONTENT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type ContributorSubmission,
  type SubmissionStatus,
} from '@/types/contributor'

function profileIncomplete(profile: { display_name: string; bio: string | null; role: string | null }) {
  return !profile.bio || !profile.role || !profile.display_name
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  const [profileResult, submissionsResult] = await Promise.all([
    supabase
      .from('contributor_profiles')
      .select('display_name, bio, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('contributor_submissions')
      .select('*')
      .eq('contributor_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileResult.data
  const submissions = (submissionsResult.data ?? []) as ContributorSubmission[]

  if (!profile) redirect('/contribute/login')

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">
            Welcome back, {profile.display_name || 'Contributor'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Submission
        </Link>
      </div>

      {/* Profile completion banner */}
      {profileIncomplete(profile) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Add your bio, role, and photo so readers know who you are when your article is published.
            </p>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-amber-700 hover:underline shrink-0"
          >
            Update →
          </Link>
        </div>
      )}

      {/* Submissions list */}
      {submissions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-sm font-bold text-zinc-600">No submissions yet</p>
          <p className="text-xs text-zinc-400 mt-1 mb-5">Share your story with the ecosystem</p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
          >
            Submit your first article
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubmissionCard({ submission: sub }: { submission: ContributorSubmission }) {
  const status = sub.status as SubmissionStatus
  const isRevision = status === 'revision_requested'
  const isPublished = status === 'published'

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border bg-white transition-colors ${
      isRevision ? 'border-orange-200 bg-orange-50/30' : 'border-zinc-200'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {CONTENT_TYPE_LABELS[sub.content_type]}
          </span>
          <span className="text-zinc-200">·</span>
          <span className="text-[10px] text-zinc-400">
            {format(new Date(sub.created_at), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="text-sm font-bold text-zinc-900 line-clamp-1">{sub.headline}</p>
      </div>

      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>

      {isPublished && sub.published_url ? (
        <a
          href={sub.published_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#00a855] hover:underline shrink-0"
        >
          Read Live →
        </a>
      ) : (
        <Link
          href={`/submissions/${sub.id}`}
          className={`text-xs font-bold shrink-0 ${
            isRevision ? 'text-orange-600 hover:underline' : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          {isRevision ? 'View Feedback →' : 'View →'}
        </Link>
      )}
    </div>
  )
}

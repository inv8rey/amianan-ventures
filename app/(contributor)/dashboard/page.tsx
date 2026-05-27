import type React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, AlertCircle, FileText, CheckCircle, Clock, RotateCcw, PenLine } from 'lucide-react'
import { SubmissionCard } from '@/components/contributor/SubmissionCard'
import type { ContributorSubmission } from '@/types/contributor'

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

  // Compute analytics (exclude drafts from "total" since they're not submitted)
  const draftCount = submissions.filter((s) => s.status === 'draft').length
  const submittedSubmissions = submissions.filter((s) => s.status !== 'draft')
  const totalCount = submittedSubmissions.length
  const publishedCount = submissions.filter((s) => s.status === 'published').length
  const inReviewCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length
  const revisionCount = submissions.filter((s) => s.status === 'revision_requested').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">
            Welcome back, {profile.display_name || 'Contributor'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Your contributor dashboard</p>
        </div>
        <Link
          href="/submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Submission
        </Link>
      </div>

      {/* Analytics stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Total" value={totalCount} color="zinc" />
        <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Published" value={publishedCount} color="green" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="In Review" value={inReviewCount} color="amber" />
        <StatCard icon={<RotateCcw className="h-4 w-4" />} label="Needs Revision" value={revisionCount} color="orange" />
      </div>

      {/* Drafts banner */}
      {draftCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-4">
          <PenLine className="h-4 w-4 text-zinc-400 shrink-0" />
          <p className="text-sm text-zinc-600 flex-1">
            You have <span className="font-bold text-zinc-900">{draftCount} draft{draftCount !== 1 ? 's' : ''}</span> — finish writing and submit for review.
          </p>
          <Link href="#drafts" className="text-xs font-bold text-zinc-700 hover:underline shrink-0">
            View Drafts →
          </Link>
        </div>
      )}

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
        <div id="drafts" className="space-y-3">
          {submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  )
}

type StatColor = 'zinc' | 'green' | 'amber' | 'orange'
const statColorMap: Record<StatColor, { bg: string; icon: string; value: string }> = {
  zinc:   { bg: 'bg-zinc-50',   icon: 'text-zinc-400',   value: 'text-zinc-900' },
  green:  { bg: 'bg-[#00a855]/8', icon: 'text-[#00a855]', value: 'text-zinc-900' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  value: 'text-zinc-900' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', value: 'text-zinc-900' },
}

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: StatColor
}) {
  const c = statColorMap[color]
  return (
    <div className={`rounded-xl border border-zinc-200 p-4 ${c.bg} flex flex-col gap-2`}>
      <div className={`${c.icon}`}>{icon}</div>
      <div>
        <p className={`text-2xl font-black ${c.value}`}>{value}</p>
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

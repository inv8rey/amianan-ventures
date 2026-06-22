import type React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Plus, AlertCircle, FileText, CheckCircle, Clock, RotateCcw, PenLine, Star, ArrowRight,
  Headset, Mail, MessageCircle, ImageIcon, User, Sparkles, Megaphone,
} from 'lucide-react'
import { SubmissionCard } from '@/components/contributor/SubmissionCard'
import { NewContributorDashboard, type CommunityStoryPreview } from '@/components/contributor/NewContributorDashboard'
import {
  CONTENT_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS,
  type ContributorSubmission, type SubmissionStatus,
} from '@/types/contributor'
import type { SpotlightApplication } from '@/types/spotlight'
import { STATUS_LABELS as SPOTLIGHT_STATUS_LABELS } from '@/types/spotlight'

async function getRecentCommunityStories(): Promise<CommunityStoryPreview[]> {
  const { createServiceClient } = await import('@/lib/supabase/service')
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('contributor_submissions')
    .select('id, headline, summary, content_type, cover_image_url')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)
  return (data ?? []) as CommunityStoryPreview[]
}

export const dynamic = 'force-dynamic'

function profileIncomplete(profile: { display_name: string; bio: string | null; role: string | null }) {
  return !profile.bio || !profile.role || !profile.display_name
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  const [profileResult, submissionsResult, spotlightResult] = await Promise.all([
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
    supabase
      .from('spotlight_applications')
      .select('*')
      .eq('contributor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const profile = profileResult.data
  const submissions = (submissionsResult.data ?? []) as ContributorSubmission[]
  const spotlight = spotlightResult.data as SpotlightApplication | null
  // /spotlight auto-creates an empty draft row the moment a contributor visits
  // it, so a draft alone doesn't mean they've actually applied — only show
  // the status card once they've submitted for real.
  const hasSubmittedSpotlight = !!spotlight && spotlight.status !== 'draft'

  if (!profile) redirect('/contribute/login')

  const firstName = (profile.display_name || 'Contributor').split(' ')[0]

  // Genuinely brand new — no feature application and no story submissions
  // at all (not even a draft) — gets the dedicated welcome/onboarding view.
  if (!spotlight && submissions.length === 0) {
    const recentStories = await getRecentCommunityStories()
    return (
      <NewContributorDashboard
        firstName={firstName}
        email={user.email ?? ''}
        profileComplete={!profileIncomplete(profile)}
        recentStories={recentStories}
      />
    )
  }

  // Compute analytics (exclude drafts from "total" since they're not submitted)
  const draftCount = submissions.filter((s) => s.status === 'draft').length
  const submittedSubmissions = submissions.filter((s) => s.status !== 'draft')
  const totalCount = submittedSubmissions.length
  const publishedCount = submissions.filter((s) => s.status === 'published').length
  const inReviewCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length
  const revisionCount = submissions.filter((s) => s.status === 'revision_requested').length

  const recentStories = submissions.slice(0, 4)

  return (
    <div>
      {/* Greeting */}
      <h1 className="text-2xl font-black text-zinc-900">
        {getGreeting()}, {firstName}! 👋
      </h1>
      <p className="text-sm text-zinc-500 mt-1 mb-6">
        Welcome to your Amianan Ventures dashboard. Manage your stories and feature applications.
      </p>

      {/* Drafts banner */}
      {draftCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-4">
          <PenLine className="h-4 w-4 text-zinc-400 shrink-0" />
          <p className="text-sm text-zinc-600 flex-1">
            You have <span className="font-bold text-zinc-900">{draftCount} draft{draftCount !== 1 ? 's' : ''}</span> — finish writing and submit for review.
          </p>
          <Link href="#stories" className="text-xs font-bold text-zinc-700 hover:underline shrink-0">
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

      {/* Hero promo — no application yet: let them choose a path; otherwise route back into it */}
      {!spotlight ? (
        <div className="relative rounded-2xl overflow-hidden bg-[#042212] mb-6">
          <div className="absolute inset-0">
            <Image
              src="/get-featured-hero.png"
              alt="Founders and agripreneurs building across Northern Luzon"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#042212] via-[#042212]/85 to-[#042212]/10" />
          </div>
          <div className="relative z-10 p-8 sm:p-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-3">Get Featured</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-5">
              What would you like to do?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <Link
                href="/spotlight?package=founding-rate"
                className="flex items-center gap-3 bg-white/95 hover:bg-white text-[#042212] px-5 py-4 rounded-xl font-bold text-sm transition-colors"
              >
                <Star className="h-4 w-4 shrink-0" />
                Share Your Story
                <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
              </Link>
              <Link
                href="/spotlight?package=ecosystem-visibility"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-4 rounded-xl font-bold text-sm transition-colors"
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                Promote Your Organization
                <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      ) : !hasSubmittedSpotlight && (
        <div className="relative rounded-2xl overflow-hidden bg-[#042212] mb-6">
          <div className="absolute inset-0">
            <Image
              src="/get-featured-hero.png"
              alt="Founders and agripreneurs building across Northern Luzon"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#042212] via-[#042212]/85 to-[#042212]/10" />
          </div>
          <div className="relative z-10 p-8 sm:p-10 max-w-lg">
            <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-3">Continue Your Application</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              You started a feature.<br />Let&apos;s finish it.
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6 max-w-sm">
              Pick up where you left off and submit your application for review.
            </p>
            <Link
              href="/spotlight"
              className="inline-flex items-center gap-2 bg-white text-[#042212] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-100 transition-colors"
            >
              Continue Application <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Feature Application + Recent Stories */}
      <div className={`grid grid-cols-1 ${hasSubmittedSpotlight ? 'lg:grid-cols-[1fr_1.6fr]' : ''} gap-5 mb-6`}>
        {/* Feature Application status — only once a real application exists (not just an empty auto-created draft) */}
        {hasSubmittedSpotlight && spotlight && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
                <Star className="h-4 w-4 text-[#00a855]" />
              </div>
              <span className="text-sm font-bold text-zinc-900">Feature Application</span>
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xl font-black text-zinc-900">
                  {SPOTLIGHT_STATUS_LABELS[spotlight.status]}
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-[10rem]">
                  {spotlight.business_name}
                </p>
              </div>
              <FeatureIllustration />
            </div>

            <Link
              href="/spotlight"
              className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#042212] text-white text-sm font-semibold hover:bg-[#06331c] transition-colors"
            >
              View Application
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Recent Stories */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-900">Recent Stories</span>
            </div>
            <Link href="#stories" className="text-xs font-bold text-[#00a855] hover:underline flex items-center gap-1">
              View all stories <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentStories.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-zinc-600">No stories yet</p>
              <p className="text-xs text-zinc-400 mt-1 mb-4">Share your story with the ecosystem</p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Submit your first article
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentStories.map((sub) => (
                <RecentStoryRow key={sub.id} submission={sub} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Need help */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
            <Headset className="h-4 w-4 text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Need help?</p>
            <p className="text-xs text-zinc-500 mt-0.5">We&apos;re here to assist you with your submissions.</p>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <a
            href="https://www.facebook.com/amiananventures"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm font-semibold text-zinc-700 hover:text-[#00a855] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 flex items-center justify-center shrink-0">
              <MessageCircle className="h-4 w-4 text-[#1877F2]" />
            </div>
            <div>
              <p>Message us on Facebook</p>
              <p className="text-xs text-zinc-400 font-normal">facebook.com/amiananventures</p>
            </div>
          </a>
          <a
            href="mailto:amiananventures@gmail.com"
            className="flex items-center gap-2.5 text-sm font-semibold text-zinc-700 hover:text-[#00a855] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-zinc-500" />
            </div>
            <div>
              <p>Email us</p>
              <p className="text-xs text-zinc-400 font-normal">amiananventures@gmail.com</p>
            </div>
          </a>
        </div>
      </div>

      {/* All My Stories */}
      <div id="stories">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-zinc-900">All My Stories</h2>
          <Link
            href="/submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Submission
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<FileText className="h-4 w-4" />} label="Total" value={totalCount} color="zinc" />
          <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Published" value={publishedCount} color="green" />
          <StatCard icon={<Clock className="h-4 w-4" />} label="In Review" value={inReviewCount} color="amber" />
          <StatCard icon={<RotateCcw className="h-4 w-4" />} label="Needs Revision" value={revisionCount} color="orange" />
        </div>

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
    </div>
  )
}

// ─── Decorative illustration for the Feature Application card ─────
function FeatureIllustration() {
  return (
    <div className="relative w-16 h-20 shrink-0">
      <Sparkles className="absolute -top-1 -left-1 h-3 w-3 text-[#00cc6a]" />
      <Sparkles className="absolute top-2 -right-1 h-2.5 w-2.5 text-[#00cc6a]/60" />
      <div className="w-16 h-20 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-2 p-2">
        <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <div className="w-9 h-1 rounded-full bg-zinc-200" />
        <div className="w-7 h-1 rounded-full bg-zinc-200" />
      </div>
      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#00a855] flex items-center justify-center border-2 border-white">
        <Star className="h-3 w-3 text-white fill-white" />
      </div>
    </div>
  )
}

// ─── Compact row for the Recent Stories preview ────────────────────
function RecentStoryRow({ submission: sub }: { submission: ContributorSubmission }) {
  const status = sub.status as SubmissionStatus
  const isDraft = status === 'draft'
  const isRevision = status === 'revision_requested'

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 bg-zinc-100">
        {sub.cover_image_url ? (
          <Image src={sub.cover_image_url} alt="" fill className="object-cover" sizes="48px" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-zinc-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {CONTENT_TYPE_LABELS[sub.content_type]}
          </span>
          <span className="text-zinc-200">·</span>
          <span className="text-[10px] text-zinc-400">{format(new Date(sub.created_at), 'MMM d, yyyy')}</span>
        </div>
        <p className={`text-sm font-bold line-clamp-1 ${isDraft ? 'text-zinc-500' : 'text-zinc-900'}`}>{sub.headline}</p>
      </div>
      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
      {status === 'published' && sub.published_url ? (
        <a href={sub.published_url} rel="noopener noreferrer" className="text-xs font-bold text-[#00a855] hover:underline shrink-0">
          Read Live →
        </a>
      ) : isDraft ? (
        <Link href={`/submit?edit=${sub.id}`} className="text-xs font-bold text-zinc-700 hover:text-black shrink-0">
          Continue →
        </Link>
      ) : (
        <Link
          href={`/submissions/${sub.id}`}
          className={`text-xs font-bold shrink-0 ${isRevision ? 'text-orange-600 hover:underline' : 'text-zinc-500 hover:text-zinc-900'}`}
        >
          {isRevision ? 'View Feedback →' : 'View →'}
        </Link>
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

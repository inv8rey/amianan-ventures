'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import {
  ArrowRight, Star, Megaphone, CalendarDays, ClipboardCheck, FileText,
  Compass, Info, Users, BookOpen, HelpCircle, Mail, CheckCircle2, Loader2,
  PenLine, AlertCircle, Plus, CheckCircle, Clock, RotateCcw, ImageIcon,
  Headset, MessageCircle, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SubmissionCard } from '@/components/contributor/SubmissionCard'
import {
  CONTENT_TYPE_LABELS, STATUS_LABELS,
  type ContentType, type ContributorSubmission, type SubmissionStatus,
} from '@/types/contributor'
import { STATUS_LABELS as SPOTLIGHT_STATUS_LABELS, type SpotlightApplication } from '@/types/spotlight'

export interface CommunityStoryPreview {
  id: string
  headline: string
  summary: string | null
  content_type: ContentType
  cover_image_url: string | null
}

export interface DashboardStats {
  total: number
  published: number
  inReview: number
  revision: number
}

const CONTENT_TYPE_BADGE_BG: Record<ContentType, string> = {
  founder_story: 'bg-[#00a855]',
  opinion_essay: 'bg-blue-500',
  ecosystem_spotlight: 'bg-purple-500',
  program_recap: 'bg-amber-500',
  field_notes: 'bg-zinc-500',
}

const STATUS_BADGE_BG: Record<SubmissionStatus, string> = {
  draft: 'bg-zinc-500',
  submitted: 'bg-blue-500',
  under_review: 'bg-amber-500',
  revision_requested: 'bg-orange-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  published: 'bg-[#00a855]',
}

interface ContributorDashboardProps {
  firstName: string
  email: string
  profileComplete: boolean
  draftCount: number
  spotlight: SpotlightApplication | null
  hasSubmittedSpotlight: boolean
  submissions: ContributorSubmission[]
  stats: DashboardStats
  communityStories: CommunityStoryPreview[]
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function ContributorDashboard({
  firstName, email, profileComplete, draftCount,
  spotlight, hasSubmittedSpotlight, submissions, stats, communityStories,
}: ContributorDashboardProps) {
  const hasOwnStories = submissions.length > 0
  const isNewUser = !spotlight && !hasOwnStories
  const recentOwnStories = submissions.slice(0, 3)

  return (
    <div>
      {isNewUser ? (
        <>
          <h1 className="text-2xl font-black text-zinc-900">Welcome to Amianan Ventures, {firstName}! 👋</h1>
          <p className="text-sm text-zinc-500 mt-1 mb-6">We&apos;re excited to have you join the Northern Luzon innovation community.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-black text-zinc-900">{getGreeting()}, {firstName}! 👋</h1>
          <p className="text-sm text-zinc-500 mt-1 mb-6">Welcome back to your Amianan Ventures dashboard.</p>
        </>
      )}

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

      {!profileComplete && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Add your bio, role, and photo so readers know who you are when your article is published.
            </p>
          </div>
          <Link href="/profile" className="text-xs font-bold text-amber-700 hover:underline shrink-0">
            Update →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          <HeroCard spotlight={spotlight} hasSubmittedSpotlight={hasSubmittedSpotlight} />

          <WaysToGetInvolvedCard spotlight={spotlight} />

          <StoriesPreviewCard hasOwnStories={hasOwnStories} ownStories={recentOwnStories} communityStories={communityStories} />

          {hasOwnStories && <NeedHelpCard />}

          {hasOwnStories && (
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
                <StatCard icon={<FileText className="h-4 w-4" />} label="Total" value={stats.total} color="zinc" />
                <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Published" value={stats.published} color="green" />
                <StatCard icon={<Clock className="h-4 w-4" />} label="In Review" value={stats.inReview} color="amber" />
                <StatCard icon={<RotateCcw className="h-4 w-4" />} label="Needs Revision" value={stats.revision} color="orange" />
              </div>

              <div className="space-y-3">
                {submissions.map((sub) => (
                  <SubmissionCard key={sub.id} submission={sub} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <GettingStartedCard profileComplete={profileComplete} hasSubmission={hasOwnStories} hasFeatureApp={!!spotlight} />

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-black text-zinc-900 mb-4">{isNewUser ? 'New to Amianan Ventures?' : 'Resources & Help'}</p>
            <div className="space-y-3.5">
              <HelpLink icon={<Info className="h-3.5 w-3.5 text-zinc-400" />} title="What we do" desc="Learn about our mission and community" href="/about" />
              <HelpLink icon={<Users className="h-3.5 w-3.5 text-zinc-400" />} title="How features work" desc="Understand our packages and process" href="/get-featured" />
              <HelpLink icon={<BookOpen className="h-3.5 w-3.5 text-zinc-400" />} title="Content guidelines" desc="Tips for creating great stories" href="/share-your-story" />
              <HelpLink icon={<HelpCircle className="h-3.5 w-3.5 text-zinc-400" />} title="Help & support" desc="We're here to help you" href="/contact" />
            </div>
            <Link href="/contact" className="inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:underline mt-4">
              Visit Help Center <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <NewsletterCard email={email} />
        </div>
      </div>
    </div>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────
function HeroCard({ spotlight, hasSubmittedSpotlight }: { spotlight: SpotlightApplication | null; hasSubmittedSpotlight: boolean }) {
  if (spotlight && spotlight.status === 'published') {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-[#042212]">
        <div className="relative z-10 p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-3">You&apos;re Featured!</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">Your story is live.</h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-sm">
              {spotlight.business_name} is now featured on Amianan Ventures. Thanks for sharing your story with the ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {spotlight.published_url && (
              <a
                href={spotlight.published_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#042212] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-100 transition-colors"
              >
                View Your Feature <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (spotlight) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-[#042212]">
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
        <div className="relative z-10 p-7 sm:p-9 max-w-lg">
          <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-3">
            {hasSubmittedSpotlight ? SPOTLIGHT_STATUS_LABELS[spotlight.status] : 'Continue Your Application'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
            You started a feature.<br />Let&apos;s finish it.
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed mb-6 max-w-sm">
            Pick up where you left off and {hasSubmittedSpotlight ? 'track your status below.' : 'submit your application for review.'}
          </p>
          <Link
            href="/spotlight"
            className="inline-flex items-center gap-2 bg-white text-[#042212] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-100 transition-colors"
          >
            Continue Application <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#eef8f1] to-white border border-zinc-200">
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-6 p-7 sm:p-9">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-3">Let&apos;s get you started</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight mb-3">
            Share your story.<br />Inspire the ecosystem.
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6 max-w-md">
            Tell us about your business, your journey, or your organization. Get featured and connect with founders, customers, investors, and ecosystem builders.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/get-featured"
              className="inline-flex items-center gap-2 bg-[#042212] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#06331c] transition-colors"
            >
              Apply for a Feature <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ecosystem"
              className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-700 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-50 transition-colors"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
        <WelcomeIllustration />
      </div>
    </div>
  )
}

// ─── Ways to Get Involved ──────────────────────────────────────────
function WaysToGetInvolvedCard({ spotlight }: { spotlight: SpotlightApplication | null }) {
  const hasFoundingRate = spotlight?.package === 'founding-rate'
  const hasEcosystem = spotlight?.package === 'ecosystem-visibility'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="text-sm font-black text-zinc-900">Ways to Get Involved</p>
      <p className="text-xs text-zinc-400 mt-0.5 mb-5">Choose what best fits you and start your journey with us.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InvolvementCard
          icon={<Star className="h-4 w-4 text-[#00a855]" />}
          iconBg="bg-[#00a855]/10"
          title="Share Your Story"
          desc="Apply for the Startup Spotlight Package and get featured."
          cta={hasFoundingRate ? 'View application' : 'Apply now'}
          href={hasFoundingRate ? '/spotlight' : '/spotlight?package=founding-rate'}
        />
        <InvolvementCard
          icon={<Megaphone className="h-4 w-4 text-blue-500" />}
          iconBg="bg-blue-500/10"
          title="Promote Your Organization"
          desc="Showcase your organization, programs, or initiatives."
          cta={hasEcosystem ? 'View application' : 'Become a partner'}
          href={hasEcosystem ? '/spotlight' : '/spotlight?package=ecosystem-visibility'}
        />
        <InvolvementCard
          icon={<CalendarDays className="h-4 w-4 text-orange-500" />}
          iconBg="bg-orange-500/10"
          title="Feature an Event"
          desc="Promote your event to the innovation community."
          cta="Submit your event"
          href="/partner"
        />
      </div>
    </div>
  )
}

function InvolvementCard({
  icon, iconBg, title, desc, cta, href,
}: { icon: React.ReactNode; iconBg: string; title: string; desc: string; cta: string; href: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-sm font-bold text-zinc-900 mb-1">{title}</p>
      <p className="text-xs text-zinc-500 leading-relaxed mb-3">{desc}</p>
      <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:underline">
        {cta} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ─── Stories preview: own stories if any, else community inspiration ─
function StoriesPreviewCard({
  hasOwnStories, ownStories, communityStories,
}: { hasOwnStories: boolean; ownStories: ContributorSubmission[]; communityStories: CommunityStoryPreview[] }) {
  if (hasOwnStories) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-black text-zinc-900">My Stories</p>
            <p className="text-xs text-zinc-400 mt-0.5">Your latest articles and their status.</p>
          </div>
          <Link href="#stories" className="text-xs font-bold text-[#00a855] hover:underline flex items-center gap-1 shrink-0">
            View all stories <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ownStories.map((sub) => {
            const isDraft = sub.status === 'draft'
            const href = sub.status === 'published' && sub.published_url
              ? sub.published_url
              : isDraft ? `/submit?edit=${sub.id}` : `/submissions/${sub.id}`
            const isExternal = sub.status === 'published' && !!sub.published_url
            return (
              <Link
                key={sub.id}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 mb-3">
                  {sub.cover_image_url ? (
                    <Image src={sub.cover_image_url} alt="" fill className="object-cover group-hover:scale-[1.02] transition-transform" sizes="240px" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-zinc-300" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest text-white px-2 py-1 rounded ${STATUS_BADGE_BG[sub.status]}`}>
                    {STATUS_LABELS[sub.status]}
                  </span>
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">{format(new Date(sub.created_at), 'MMM d, yyyy')}</p>
                <p className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#00a855] transition-colors">{sub.headline}</p>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  if (communityStories.length === 0) return null

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-black text-zinc-900">Recent Stories from the Community</p>
          <p className="text-xs text-zinc-400 mt-0.5">Get inspired by stories from founders and organizations across Northern Luzon.</p>
        </div>
        <Link href="/founder-stories" className="text-xs font-bold text-[#00a855] hover:underline flex items-center gap-1 shrink-0">
          View all stories <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {communityStories.map((story) => (
          <Link key={story.id} href={`/contributions/${story.id}`} className="group">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 mb-3">
              {story.cover_image_url ? (
                <Image src={story.cover_image_url} alt="" fill className="object-cover group-hover:scale-[1.02] transition-transform" sizes="240px" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-zinc-300" />
                </div>
              )}
              <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest text-white px-2 py-1 rounded ${CONTENT_TYPE_BADGE_BG[story.content_type]}`}>
                {CONTENT_TYPE_LABELS[story.content_type]}
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">{CONTENT_TYPE_LABELS[story.content_type]}</p>
            <p className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#00a855] transition-colors">{story.headline}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Need help ───────────────────────────────────────────────────────
function NeedHelpCard() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
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
  )
}

// ─── Sidebar widgets ──────────────────────────────────────────────────
function HelpLink({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="flex items-start gap-2.5 group">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-bold text-zinc-800 group-hover:text-[#00a855] transition-colors">{title}</p>
        <p className="text-xs text-zinc-400">{desc}</p>
      </div>
    </Link>
  )
}

function GettingStartedCard({
  profileComplete, hasSubmission, hasFeatureApp,
}: { profileComplete: boolean; hasSubmission: boolean; hasFeatureApp: boolean }) {
  // "Explore the ecosystem" has no tracking mechanism, so it's shown as a
  // resource link but isn't counted toward the percentage.
  const steps = [
    { icon: ClipboardCheck, title: 'Complete your profile', desc: 'Tell us about yourself or your organization', href: '/profile', done: profileComplete },
    { icon: FileText, title: 'Submit your first story', desc: 'Share your knowledge or insights', href: '/submit', done: hasSubmission },
    { icon: Star, title: 'Apply for a feature', desc: 'Get featured on Amianan Ventures', href: '/get-featured', done: hasFeatureApp },
    { icon: Compass, title: 'Explore the ecosystem', desc: 'Discover opportunities and resources', href: '/ecosystem', done: false },
  ]
  const trackable = steps.slice(0, 3)
  const doneCount = trackable.filter((s) => s.done).length
  const pct = Math.round((doneCount / trackable.length) * 100)
  const message = pct === 100 ? "You've completed every step!" : pct === 0 ? "You're just getting started." : 'Keep up the momentum!'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-black text-zinc-900 mb-4">Getting Started</p>
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="#e4e4e7" strokeWidth="6" />
            <circle
              cx="28" cy="28" r="24" fill="none" stroke="#00a855" strokeWidth="6"
              strokeDasharray={`${(pct / 100) * 150.8} 150.8`} strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-zinc-900">{pct}%</span>
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{message}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Complete the steps below to make the most of your Amianan Ventures profile.</p>
        </div>
      </div>
      <div className="space-y-3.5">
        {steps.map((s) => (
          <Link key={s.title} href={s.href} className="flex items-start gap-2.5 group">
            <div className={`mt-0.5 shrink-0 ${s.done ? 'text-[#00a855]' : 'text-zinc-400'}`}>
              {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-800 group-hover:text-[#00a855] transition-colors">{s.title}</p>
              <p className="text-xs text-zinc-400">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <Link href="/profile" className="inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:underline mt-4">
        View all steps <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function NewsletterCard({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubscribe() {
    setState('loading')
    const supabase = createClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase(), source: 'dashboard' })
    if (error && error.code !== '23505') {
      setState('error')
      return
    }
    setState('success')
  }

  return (
    <div className="rounded-2xl border border-[#00a855]/20 bg-[#00a855]/5 p-5">
      <div className="w-9 h-9 rounded-lg bg-[#00a855]/15 flex items-center justify-center mb-4">
        <Mail className="h-4 w-4 text-[#00a855]" />
      </div>
      <p className="text-sm font-black text-zinc-900 mb-1">Stay in the loop</p>
      <p className="text-xs text-zinc-500 leading-relaxed mb-4">
        Get the latest stories, opportunities, and ecosystem updates straight to your inbox.
      </p>
      {state === 'success' ? (
        <p className="flex items-center gap-1.5 text-xs font-bold text-[#00a855]">
          <CheckCircle2 className="h-3.5 w-3.5" /> You&apos;re subscribed!
        </p>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={state === 'loading'}
          className="inline-flex items-center justify-center gap-2 bg-[#0a3a22] text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#042212] disabled:opacity-60 transition-colors w-full"
        >
          {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe Now'}
        </button>
      )}
      {state === 'error' && <p className="text-xs text-red-500 mt-2">Something went wrong. Please try again.</p>}
    </div>
  )
}

function WelcomeIllustration() {
  return (
    <div className="relative hidden sm:block rounded-xl overflow-hidden bg-gradient-to-b from-[#dcf0e3] to-[#cbe9d6] min-h-[180px]">
      <svg viewBox="0 0 220 180" className="absolute inset-0 w-full h-full">
        <path d="M0 140 L30 90 L55 115 L85 65 L115 110 L145 80 L175 120 L220 140 L220 180 L0 180 Z" fill="#aedcbd" />
        <rect x="20" y="100" width="10" height="40" fill="#9ccfae" />
        <rect x="170" y="95" width="12" height="45" fill="#9ccfae" />
        <rect x="190" y="110" width="9" height="30" fill="#9ccfae" />
        {/* people */}
        <g>
          <circle cx="80" cy="120" r="11" fill="#3d2b1f" />
          <rect x="69" y="131" width="22" height="38" rx="8" fill="#0a3a22" />
        </g>
        <g>
          <circle cx="110" cy="115" r="11" fill="#4a2f1d" />
          <rect x="99" y="126" width="22" height="43" rx="8" fill="#c9a876" />
        </g>
        <g>
          <circle cx="140" cy="122" r="11" fill="#2b1a10" />
          <rect x="129" y="133" width="22" height="36" rx="8" fill="#0a3a22" />
        </g>
      </svg>
    </div>
  )
}

// ─── Stat card (All My Stories) ───────────────────────────────────────
type StatColor = 'zinc' | 'green' | 'amber' | 'orange'
const statColorMap: Record<StatColor, { bg: string; icon: string; value: string }> = {
  zinc:   { bg: 'bg-zinc-50',   icon: 'text-zinc-400',   value: 'text-zinc-900' },
  green:  { bg: 'bg-[#00a855]/8', icon: 'text-[#00a855]', value: 'text-zinc-900' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  value: 'text-zinc-900' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', value: 'text-zinc-900' },
}

function StatCard({
  icon, label, value, color,
}: { icon: React.ReactNode; label: string; value: number; color: StatColor }) {
  const c = statColorMap[color]
  return (
    <div className={`rounded-xl border border-zinc-200 p-4 ${c.bg} flex flex-col gap-2`}>
      <div className={c.icon}>{icon}</div>
      <div>
        <p className={`text-2xl font-black ${c.value}`}>{value}</p>
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

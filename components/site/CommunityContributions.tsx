'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ChevronLeft, ChevronRight, Pencil, User,
  MessageCircle, CalendarCheck, Lightbulb, BookOpen, ArrowRight,
} from 'lucide-react'
import { ROLE_LABELS } from '@/types/contributor'
import type { ContentType, ContributorRole } from '@/types/contributor'

export interface CommunityContribution {
  id: string
  headline: string
  summary: string
  content_type: ContentType
  cover_image_url: string | null
  published_at: string | null
  contributor: {
    display_name: string
    role: string | null
    organization: string | null
    photo_url: string | null
  } | null
}

type Filter = 'all' | ContentType

const TABS: { key: Filter; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all',               label: 'All Contributions',    Icon: Pencil },
  { key: 'founder_story',     label: 'Founder Insights',     Icon: User },
  { key: 'opinion_essay',     label: 'Perspectives',         Icon: MessageCircle },
  { key: 'program_recap',     label: 'Program Recaps',       Icon: CalendarCheck },
  { key: 'ecosystem_spotlight', label: 'Ecosystem Spotlight', Icon: Lightbulb },
  { key: 'field_notes',       label: 'Field Notes',          Icon: BookOpen },
]

const BADGE_LABEL: Record<ContentType, string> = {
  founder_story:       'Founder Insights',
  opinion_essay:       'Perspectives',
  program_recap:       'Program Recap',
  ecosystem_spotlight: 'Ecosystem Spotlight',
  field_notes:         'Field Notes',
}

const PER_PAGE = 4

export function CommunityContributions({ contributions }: { contributions: CommunityContribution[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage]     = useState(0)

  const filtered = useMemo(() => {
    return filter === 'all'
      ? contributions
      : contributions.filter(c => c.content_type === filter)
  }, [contributions, filter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pageItems  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  function handleFilter(f: Filter) { setFilter(f); setPage(0) }

  // Only show tabs for types that actually have content
  const visibleTabs = TABS.filter(
    t => t.key === 'all' || contributions.some(c => c.content_type === t.key)
  )

  if (contributions.length === 0) return null

  return (
    <section className="py-14 border-t border-zinc-100">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-2.5">
            From the Ecosystem
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight tracking-tight mb-2">
            Community Contributions
          </h2>
          <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
            Perspectives, lessons, and field insights from founders, students, researchers,
            and builders shaping innovation across Northern Luzon.
          </p>
        </div>
        <Link
          href="/contribute/signup"
          className="hidden sm:inline-flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#00a855] text-[#00a855] text-sm font-bold hover:bg-[#00a855] hover:text-white transition-colors whitespace-nowrap mt-1"
        >
          <Pencil className="h-3.5 w-3.5" />
          Share Your Perspective
        </Link>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-end justify-between border-b border-zinc-200 mb-8 gap-4">
        <div className="flex items-end overflow-x-auto scrollbar-none gap-0 -mb-px">
          {visibleTabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                filter === key
                  ? 'border-[#00a855] text-[#00a855]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
        <Link
          href="/contribute"
          className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#00a855] hover:underline uppercase tracking-wider shrink-0 pb-3"
        >
          View all contributions <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* ── Cards grid ── */}
      {pageItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pageItems.map(c => <ContributionCard key={c.id} contribution={c} />)}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-400">No contributions in this category yet.</p>
        </div>
      )}

      {/* ── Pagination dots + arrows ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`rounded-full transition-all ${
                i === page
                  ? 'w-3 h-3 bg-zinc-900'
                  : 'w-2.5 h-2.5 bg-zinc-300 hover:bg-zinc-500'
              }`}
            />
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  )
}

// ── Card ─────────────────────────────────────────────────────────
function ContributionCard({ contribution: c }: { contribution: CommunityContribution }) {
  return (
    <Link
      href={`/contributions/${c.id}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-lg hover:shadow-zinc-100 hover:border-zinc-300 transition-all"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] bg-zinc-100 shrink-0 overflow-hidden">
        {c.cover_image_url ? (
          <Image
            src={c.cover_image_url}
            alt={c.headline}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
        )}
        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#00a855] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
            {BADGE_LABEL[c.content_type]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {c.published_at && (
          <p className="text-[11px] text-zinc-400">
            {format(new Date(c.published_at), 'MMMM d, yyyy')}
          </p>
        )}
        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#00a855] transition-colors leading-snug line-clamp-3">
          {c.headline}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 flex-1">
          {c.summary}
        </p>

        {/* Author byline */}
        {c.contributor && (
          <div className="flex items-center gap-2.5 mt-2 pt-3 border-t border-zinc-100">
            {c.contributor.photo_url ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                <Image
                  src={c.contributor.photo_url}
                  alt={c.contributor.display_name}
                  fill
                  className="object-cover"
                  sizes="32px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-black text-white">
                  {c.contributor.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">
                {c.contributor.display_name}
              </p>
              {(c.contributor.role || c.contributor.organization) && (
                <p className="text-[10px] text-zinc-400 truncate leading-none mt-0.5">
                  {[
                    c.contributor.role
                      ? (ROLE_LABELS[c.contributor.role as ContributorRole] ?? c.contributor.role)
                      : null,
                    c.contributor.organization,
                  ].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

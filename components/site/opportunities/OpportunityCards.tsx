import Image from 'next/image'
import { ArrowUpRight, Briefcase, Building2, CalendarDays, Coins, Handshake, MapPin, Sprout, Trophy, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDeadlineDate, formatDeadlineFull } from '@/lib/countdown'
import { OPPORTUNITY_CATEGORY_LABELS } from '@/types/opportunities'
import type { Opportunity, OpportunityCategory } from '@/types/opportunities'
import { CountdownBadge, CountdownTiles } from './Countdown'

export const CATEGORY_ICON: Record<OpportunityCategory, LucideIcon> = {
  'funding-grants': Coins,
  competition: Trophy,
  'program-incubation': Sprout,
  events: Ticket,
  partnerships: Handshake,
  'jobs-fellowships': Briefcase,
}

const CATEGORY_PILL: Record<OpportunityCategory, string> = {
  'funding-grants': 'bg-[#befc65] text-[#131314]',
  competition: 'bg-violet-200 text-violet-950',
  'program-incubation': 'bg-[#befc65] text-[#131314]',
  events: 'bg-amber-200 text-amber-950',
  partnerships: 'bg-zinc-200 text-zinc-900',
  'jobs-fellowships': 'bg-sky-200 text-sky-950',
}

export function CategoryPill({ category }: { category: OpportunityCategory }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
        CATEGORY_PILL[category]
      )}
    >
      {OPPORTUNITY_CATEGORY_LABELS[category]}
    </span>
  )
}

/** External application link when there is one, otherwise the opportunity's place in the directory. */
function linkProps(o: Opportunity) {
  return o.apply_url
    ? { href: o.apply_url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: `/opportunities#${o.slug}` }
}

export function FeaturedOpportunityCard({ opportunity: o, now }: { opportunity: Opportunity; now: number }) {
  const Icon = CATEGORY_ICON[o.category]
  return (
    <article className="group relative rounded-2xl border border-[#d9ef9f] bg-[#fbfdf4] p-3.5">
      <div className="grid grid-cols-[38%_1fr] gap-3.5 md:grid-cols-[11rem_1fr] lg:grid-cols-[38%_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#131314]">
          {o.cover_image ? (
            <Image
              src={o.cover_image}
              alt=""
              fill
              sizes="(max-width: 1024px) 40vw, 160px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-10 w-10 text-[#befc65]" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 py-0.5">
          <CategoryPill category={o.category} />
          <h3 className="mt-2 font-editorial font-bold text-[1.35rem] leading-[1.12] text-[#131314]">
            <a {...linkProps(o)} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
              {o.title}
            </a>
          </h3>
          <p className="mt-1.5 text-[13px] text-zinc-600">{o.organization}</p>
          {o.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden /> {o.location}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3.5">
        <CountdownTiles deadline={o.deadline} initialNow={now} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-600">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Deadline: <time dateTime={o.deadline}>{formatDeadlineFull(o.deadline)}</time></span>
        </span>
        {o.apply_url && (
          <span className="flex shrink-0 items-center gap-0.5 font-semibold text-[#131314]">
            Apply <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>
    </article>
  )
}

export function OpportunityCard({ opportunity: o, now }: { opportunity: Opportunity; now: number }) {
  const Icon = CATEGORY_ICON[o.category]
  return (
    <article
      id={o.slug}
      className="group relative flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 transition-colors hover:border-zinc-300"
    >
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#6b8f1f]" strokeWidth={1.6} aria-hidden />
      <div className="min-w-0 flex-1">
        <CategoryPill category={o.category} />
        <h3 className="mt-1.5 font-editorial font-bold text-[1.08rem] leading-snug text-[#131314]">
          <a {...linkProps(o)} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none group-hover:underline decoration-[#befc65] decoration-2 underline-offset-4">
            {o.title}
          </a>
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {o.organization}
          {o.location && <> · {o.location}</>}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-700">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Deadline: <time dateTime={o.deadline}>{formatDeadlineDate(o.deadline)}</time></span>
        </p>
      </div>
      <CountdownBadge deadline={o.deadline} initialNow={now} />
    </article>
  )
}

/** Text-led card for the Opportunities directory: details, deadline and a live countdown. */
export function OpportunityListCard({ opportunity: o, now }: { opportunity: Opportunity; now: number }) {
  return (
    <article
      id={o.slug}
      className="group relative flex scroll-mt-32 flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400"
    >
      <div className="flex items-start justify-between gap-3">
        <CategoryPill category={o.category} />
        <CountdownBadge deadline={o.deadline} initialNow={now} />
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.01em] text-[#131314]">
        <a {...linkProps(o)} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {o.title}
        </a>
      </h3>
      {o.summary && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-zinc-600">{o.summary}</p>}
      <div className="mt-auto pt-4">
        <div className="space-y-1.5 border-t border-zinc-200 pt-3 text-[13px] text-zinc-700">
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden /> {o.organization}
          </p>
          {o.location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden /> {o.location}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              <span>Deadline: <time dateTime={o.deadline}>{formatDeadlineFull(o.deadline)}</time></span>
            </p>
          </div>
        </div>
        {o.apply_url && (
          <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#3f6212] group-hover:text-[#131314]">
            View details <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </article>
  )
}

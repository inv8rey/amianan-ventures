import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BarChart3, CalendarDays, Coins, Handshake, Rocket, Search, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { requestTime } from '@/lib/countdown'
import { getPublishedArticles } from '@/lib/queries'
import { getRecentlyClosedOpportunities, getUpcomingOpportunities } from '@/lib/opportunities'
import { getPublishedReports } from '@/lib/reports'
import { OpportunityListCard } from '@/components/site/opportunities/OpportunityCards'
import { OPPORTUNITY_CATEGORY_LABELS, OPPORTUNITY_CATEGORY_SHORT } from '@/types/opportunities'
import type { Opportunity, OpportunityCategory } from '@/types/opportunities'
import type { Article } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Opportunities',
  description:
    'Funding, programs, events and partnerships for founders and innovators, sorted by deadline.',
}

const CATEGORIES = Object.keys(OPPORTUNITY_CATEGORY_LABELS) as OpportunityCategory[]

const PATHWAYS: { category: OpportunityCategory; title: string; sub: string; Icon: LucideIcon }[] = [
  { category: 'funding-grants', title: 'Grants & Funding', sub: 'Funding calls, grants and investment opportunities.', Icon: Coins },
  { category: 'program-incubation', title: 'Programs', sub: 'Incubation, acceleration, mentorship and startup support.', Icon: Rocket },
  { category: 'events', title: 'Events', sub: 'Conferences, competitions, workshops and networking.', Icon: CalendarDays },
  { category: 'partnerships', title: 'Partnerships', sub: 'Calls for collaboration, pilot projects and industry links.', Icon: Handshake },
]

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q: rawQ } = await searchParams
  const q = (rawQ ?? '').trim().slice(0, 80)
  const needle = q.toLowerCase()
  const active = CATEGORIES.includes(category as OpportunityCategory) ? (category as OpportunityCategory) : undefined

  const matchesQuery = (o: Opportunity) =>
    !needle ||
    [o.title, o.organization, o.summary, o.location, OPPORTUNITY_CATEGORY_LABELS[o.category]].some((v) =>
      v?.toLowerCase().includes(needle)
    )

  const [{ items: upcoming, isSample }, closed, stories, reports] = await Promise.all([
    getUpcomingOpportunities(undefined, active),
    getRecentlyClosedOpportunities(6),
    getPublishedArticles(3, 'founder-stories').catch(() => [] as Article[]),
    getPublishedReports(3),
  ])
  const items = upcoming.filter(matchesQuery)
  const closedShown = closed.filter((o) => (!active || o.category === active) && matchesQuery(o))
  const now = requestTime()

  const withQuery = (c?: OpportunityCategory) => {
    const params = new URLSearchParams()
    if (c) params.set('category', c)
    if (q) params.set('q', q)
    const str = params.toString()
    return `/opportunities${str ? `?${str}` : ''}`
  }

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="bg-[#131314] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#befc65]">Opportunities</p>
          <h1 className="mt-3 max-w-3xl text-[2.25rem] font-semibold leading-[1.06] tracking-[-0.03em] text-white sm:text-[3rem]">
            Find your next opportunity.
            <br />
            Build <span className="text-[#befc65]">what&rsquo;s next.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-300 sm:text-lg">
            Discover funding, accelerator programs, startup support, events, and partnerships, rooted in Northern Luzon and open to builders everywhere.
          </p>
          <form action="/opportunities#open" method="get" role="search" className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
            {active && <input type="hidden" name="category" value={active} />}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={q}
                aria-label="Search opportunities"
                placeholder="Search grants, programs, events, opportunities…"
                className="h-12 w-full rounded-lg border-0 bg-white pl-12 pr-4 text-[15px] text-zinc-900 outline-none ring-2 ring-transparent placeholder:text-zinc-500 focus:ring-[#befc65]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#befc65] px-5 text-[15px] font-semibold text-[#131314] hover:bg-[#d0ff8a]"
            >
              Explore <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>
          <p className="mt-3 text-xs text-zinc-400">All deadlines are in Philippine Standard Time.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {/* ── Pathways ── */}
        <nav aria-label="Browse by type" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PATHWAYS.map(({ category: c, title, sub, Icon }) => (
            <Link
              key={c}
              href={`${withQuery(c)}#open`}
              scroll={false}
              aria-current={active === c ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-4 rounded-xl border bg-white p-4 transition-colors',
                active === c ? 'border-[#131314]' : 'border-zinc-200 hover:border-zinc-400'
              )}
            >
              <Icon className="h-8 w-8 shrink-0 text-[#131314]" strokeWidth={1.4} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold tracking-[-0.01em] text-[#131314]">{title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-zinc-600">{sub}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-[#65a30d] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ))}
        </nav>

        {/* ── Open opportunities ── */}
        <section id="open" aria-labelledby="open-heading" className="mt-10 scroll-mt-32">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="open-heading" className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-[#131314]">
                {active ? OPPORTUNITY_CATEGORY_LABELS[active] : 'Open opportunities'}
              </h2>
              <p className="mt-1 text-[15px] text-zinc-600">Open calls, nearest deadline first.</p>
            </div>
            <nav aria-label="Filter by category" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {[undefined, ...CATEGORIES].map((c) => {
                const on = active === c
                return (
                  <Link
                    key={c ?? 'all'}
                    href={`${withQuery(c)}#open`}
                    scroll={false}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      'whitespace-nowrap rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors',
                      on ? 'border-[#befc65] bg-[#befc65] text-[#131314]' : 'border-zinc-300 bg-white text-zinc-700 hover:border-[#131314]'
                    )}
                  >
                    {c ? OPPORTUNITY_CATEGORY_SHORT[c] : 'All'}
                  </Link>
                )
              })}
            </nav>
          </div>

          {q && (
            <p className="mt-4 text-sm text-zinc-600">
              {items.length} open {items.length === 1 ? 'opportunity' : 'opportunities'} for{' '}
              <span className="font-semibold text-[#131314]">&ldquo;{q}&rdquo;</span>
              <Link
                href={`${active ? `/opportunities?category=${active}` : '/opportunities'}#open`}
                className="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-zinc-500 hover:text-[#131314]"
              >
                <X className="h-3 w-3" aria-hidden /> Clear
              </Link>
            </p>
          )}

          {isSample && (
            <p className="mt-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Development sample data. Add real opportunities in the admin; samples never show in production.
            </p>
          )}

          {items.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((o) => (
                <OpportunityListCard key={o.id} opportunity={o} now={now} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-zinc-200 bg-[#f7f7f1] p-8 text-center text-sm text-zinc-600">
              {q
                ? 'No open opportunities match that search.'
                : active
                  ? `No open ${OPPORTUNITY_CATEGORY_LABELS[active].toLowerCase()} opportunities right now.`
                  : 'No open calls right now. New opportunities are added as they are announced.'}
            </div>
          )}

          {closedShown.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#131314]">Recently closed</h3>
              <div className="mt-4 grid gap-4 opacity-75 md:grid-cols-2 lg:grid-cols-3">
                {closedShown.map((o) => (
                  <OpportunityListCard key={o.id} opportunity={o} now={now} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Ecosystem insights ── */}
        <section className="mt-12 grid gap-6 rounded-2xl bg-[#f3f3f4] p-6 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-8">
          <h2 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-[#131314] lg:max-w-[14rem] lg:border-r lg:border-zinc-300 lg:pr-8">
            Ecosystem insights
          </h2>
          {reports.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
              {reports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/ecosystem-pulse/${r.slug}`}
                    className="flex h-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 text-sm font-medium leading-snug text-[#131314] hover:border-zinc-400"
                  >
                    <BarChart3 className="h-6 w-6 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
                    <span className="line-clamp-2">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-3 text-sm text-zinc-600">
              <BarChart3 className="h-6 w-6 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
              Our first research reports on the region&rsquo;s startup ecosystem are on the way.
            </p>
          )}
          <div className="lg:border-l lg:border-zinc-300 lg:pl-8">
            <p className="text-[15px] font-semibold leading-snug text-[#131314]">
              Research, trends and stories on how ventures grow, starting from the North.
            </p>
            <Link href="/ecosystem-pulse" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#3f6212] hover:text-[#131314]">
              Explore insights <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* ── Founder stories ── */}
        {stories.length > 0 && (
          <section aria-labelledby="people-heading" className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 id="people-heading" className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-[#131314]">
                People and organizations moving innovation forward
              </h2>
              <Link href="/founder-stories" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#3f6212] hover:text-[#131314] sm:inline-flex">
                View more stories <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {stories.map((a) => (
                <Link
                  key={a.id}
                  href={`/founder-stories/${a.slug}`}
                  className="group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-400"
                >
                  <span className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                    {a.cover_image && (
                      <Image
                        src={a.cover_image}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover"
                        style={{ objectPosition: a.cover_position ?? '50% 50%' }}
                      />
                    )}
                  </span>
                  <span className="min-w-0 py-0.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Founder story</span>
                    <span className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-[#131314] group-hover:underline decoration-[#befc65] decoration-2 underline-offset-4">
                      {a.title}
                    </span>
                    {a.excerpt && <span className="mt-1 line-clamp-2 text-xs leading-snug text-zinc-600">{a.excerpt}</span>}
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/founder-stories" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#3f6212] sm:hidden">
              View more stories <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        )}

        {/* ── Share an opportunity ── */}
        <section className="mt-12 flex flex-col gap-4 rounded-2xl bg-[#befc65] p-6 sm:p-7 lg:flex-row lg:items-center lg:gap-8">
          <h2 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-[#131314] lg:border-r lg:border-[#131314]/25 lg:pr-8">
            Have an opportunity to share?
          </h2>
          <p className="flex-1 text-[15px] text-[#131314]/80">
            Help founders discover programs, funding and partnerships.
          </p>
          <Link
            href="/contact?topic=opportunity#message"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-[#131314] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#2a2a2c]"
          >
            Submit an opportunity <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  )
}

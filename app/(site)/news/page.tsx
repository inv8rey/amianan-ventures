import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Mail, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublishedArticles } from '@/lib/queries'
import type { Article } from '@/types'
import {
  LeadStory, Mountains, PageIntro, Pagination, SideStory, StoryCard, paginate, type StoryLabel,
} from '@/components/site/editorial/StoryParts'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'News & Updates',
  description: 'Innovation, enterprise, and community stories, rooted in Northern Luzon and reaching beyond it.',
}

const PER_PAGE = 12
const MAX_TOPICS = 6

const SORTS = {
  latest: 'Latest',
  popular: 'Most read',
  oldest: 'Oldest',
} as const
type SortKey = keyof typeof SORTS

const norm = (t: string) => t.trim().toLowerCase()
const firstTag = (a: Article) => (a.tags ?? []).map((t) => t.trim()).find(Boolean)

// Topic = the article's first tag (set in the admin); untagged stories are just "News".
const LABEL: StoryLabel = {
  text: (a) => firstTag(a) ?? 'News',
  pill: 'bg-[#befc65] text-[#131314]',
  divider: 'bg-zinc-300',
  onSmall: 'text',
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string; sort?: string; page?: string }>
}) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim().slice(0, 80)
  const sort: SortKey = sp.sort && sp.sort in SORTS ? (sp.sort as SortKey) : 'latest'
  const all = await getPublishedArticles(undefined, 'news').catch(() => [] as Article[])

  // Topic chips come from the tags editors actually use, most common first.
  const tagCounts = new Map<string, { label: string; count: number }>()
  for (const a of all) {
    for (const t of new Set((a.tags ?? []).map((x) => x.trim()).filter(Boolean))) {
      const k = norm(t)
      const cur = tagCounts.get(k)
      tagCounts.set(k, { label: cur?.label ?? t, count: (cur?.count ?? 0) + 1 })
    }
  }
  const topics = [...tagCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, MAX_TOPICS)
    .map(([key, v]) => ({ key, label: v.label }))
  const topic = sp.topic && tagCounts.has(norm(sp.topic)) ? norm(sp.topic) : undefined

  const needle = q.toLowerCase()
  let matches = all.filter(
    (a) =>
      (!topic || (a.tags ?? []).some((t) => norm(t) === topic)) &&
      (!needle || [a.title, a.excerpt, a.author, ...(a.tags ?? [])].some((v) => v?.toLowerCase().includes(needle)))
  )
  if (sort === 'popular') matches = [...matches].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
  if (sort === 'oldest') matches = [...matches].reverse()

  const filtered = !!needle || !!topic || sort !== 'latest'
  const lead = filtered ? [] : matches.slice(0, 2)
  const rest = filtered ? matches : matches.slice(2)
  const { page, pages, shown } = paginate(rest, sp.page, PER_PAGE)
  const showLead = lead.length > 0 && page === 1

  const build = (over: { q?: string; topic?: string | null; sort?: SortKey; page?: number }) => {
    const params = new URLSearchParams()
    const nq = over.q ?? q
    const nt = over.topic === null ? undefined : (over.topic ?? topic)
    const ns = over.sort ?? sort
    if (nq) params.set('q', nq)
    if (nt) params.set('topic', nt)
    if (ns !== 'latest') params.set('sort', ns)
    if (over.page && over.page > 1) params.set('page', String(over.page))
    const s = params.toString()
    return `/news${s ? `?${s}` : ''}`
  }

  const chip = (href: string, label: string, on: boolean) => (
    <Link
      key={label}
      href={href}
      scroll={false}
      aria-current={on ? 'page' : undefined}
      className={cn(
        'whitespace-nowrap rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors',
        on ? 'border-[#131314] bg-[#131314] text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:border-[#131314]'
      )}
    >
      {label}
    </Link>
  )

  return (
    <div className="relative overflow-hidden bg-[#f7f7f1]">
      <Mountains />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <PageIntro eyebrow="News & Updates" accent={{ bar: 'bg-[#befc65]', text: 'text-[#131314]' }} title="Stories shaping what gets built.">
          Innovation, enterprise, and community stories, rooted in Northern Luzon and reaching beyond it.
        </PageIntro>

        {/* Search · topics · sort */}
        <div id="search" className="mt-7 flex scroll-mt-32 flex-col gap-3 lg:flex-row lg:items-center">
          <form action="/news" method="get" role="search" className="relative w-full lg:max-w-sm">
            {topic && <input type="hidden" name="topic" value={topic} />}
            {sort !== 'latest' && <input type="hidden" name="sort" value={sort} />}
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              aria-label="Search news"
              placeholder="Search articles, topics, or people…"
              className="w-full rounded-full border border-zinc-300 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#131314]"
            />
          </form>

          {topics.length > 0 && (
            <>
              <span className="hidden h-7 w-px bg-zinc-300 lg:block" aria-hidden />
              <nav aria-label="Filter by topic" className="flex min-w-0 gap-2 overflow-x-auto pb-1 lg:pb-0 [scrollbar-width:none]">
                {chip(build({ topic: null, page: 1 }), 'All', !topic)}
                {topics.map((t) => chip(build({ topic: t.key, page: 1 }), t.label, topic === t.key))}
              </nav>
            </>
          )}

          <details className="group relative lg:ml-auto">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-[13px] text-zinc-600 [&::-webkit-details-marker]:hidden">
              Sort by: <span className="font-semibold text-[#131314]">{SORTS[sort]}</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg lg:left-auto lg:right-0">
              {(Object.keys(SORTS) as SortKey[]).map((k) => (
                <Link
                  key={k}
                  href={build({ sort: k, page: 1 })}
                  scroll={false}
                  aria-current={k === sort ? 'true' : undefined}
                  className={cn('block rounded-lg px-3 py-2 text-sm hover:bg-[#f3f3f4]', k === sort && 'font-semibold')}
                >
                  {SORTS[k]}
                </Link>
              ))}
            </div>
          </details>
        </div>

        {(needle || topic) && (
          <p className="mt-4 text-sm text-zinc-600">
            {matches.length} {matches.length === 1 ? 'story' : 'stories'}
            {topic && <> in <span className="font-semibold text-[#131314]">{tagCounts.get(topic)?.label}</span></>}
            {needle && <> for <span className="font-semibold text-[#131314]">&ldquo;{q}&rdquo;</span></>}
            <Link href={build({ q: '', topic: null, page: 1 }).replace(/\?$/, '')} className="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-zinc-500 hover:text-[#131314]">
              <X className="h-3 w-3" aria-hidden /> Clear
            </Link>
          </p>
        )}

        {showLead && (
          <div className={cn('mt-7 grid gap-5', lead.length > 1 && 'lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]')}>
            <LeadStory article={lead[0]} label={LABEL} />
            {lead[1] && <SideStory article={lead[1]} label={LABEL} />}
          </div>
        )}

        <div id="stories" className="scroll-mt-32">
          {shown.length > 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((a) => (
                <StoryCard key={a.id} article={a} label={LABEL} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-600">
              {filtered ? 'No stories match that search.' : 'No news published yet. Check back soon.'}
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination page={page} pages={pages} hrefFor={(p) => `${build({ page: p })}#stories`} />
          </div>
        )}

        {/* Newsletter */}
        <section className="mt-12 flex flex-col gap-5 rounded-2xl border border-[#d9ef9f] bg-[#eef6dc] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4 sm:items-center">
            <Mail className="h-9 w-9 shrink-0 text-[#131314]" strokeWidth={1.5} aria-hidden />
            <span className="hidden h-10 w-px bg-[#131314]/20 sm:block" aria-hidden />
            <div>
              <h2 className="font-editorial text-[1.4rem] font-bold leading-tight text-[#131314] sm:text-[1.6rem]">
                Stay in the loop with the stories and opportunities that matter.
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Get the latest news, founder stories, opportunities, and events in your inbox.
              </p>
            </div>
          </div>
          <a
            href="#newsletter"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#131314] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2c]"
          >
            Subscribe to our newsletter <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </section>
      </div>
    </div>
  )
}

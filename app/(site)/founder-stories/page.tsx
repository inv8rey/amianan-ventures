import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPublishedArticles } from '@/lib/queries'
import type { Article } from '@/types'
import {
  LeadStory, Mountains, PageIntro, Pagination, SideStory, StoryCard, paginate, type StoryLabel,
} from '@/components/site/editorial/StoryParts'

export const metadata: Metadata = {
  title: 'Founder Stories',
  description: 'Real journeys of entrepreneurs and business builders, rooted in Northern Luzon and reaching beyond it.',
}

export const revalidate = 60

const PER_PAGE = 8

// The page itself says Founder Stories, so small cards skip the label and keep tags + date on one line.
const LABEL: StoryLabel = {
  text: () => 'Founder Stories',
  pill: 'bg-[#c2410c] text-white',
  divider: 'bg-[#c2410c]/60',
  onSmall: 'none',
}

export default async function FounderStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q: rawQ, page: rawPage } = await searchParams
  const q = (rawQ ?? '').trim().slice(0, 80)
  const all = await getPublishedArticles(undefined, 'founder-stories').catch(() => [] as Article[])

  const needle = q.toLowerCase()
  const matches = needle
    ? all.filter((a) => [a.title, a.excerpt, a.author, ...(a.tags ?? [])].some((v) => v?.toLowerCase().includes(needle)))
    : all

  // The two newest stories lead the page; the rest are paginated below.
  const lead = needle ? [] : matches.slice(0, 2)
  const rest = needle ? matches : matches.slice(2)
  const { page, pages, shown } = paginate(rest, rawPage, PER_PAGE)
  const showLead = lead.length > 0 && page === 1

  const hrefFor = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return `/founder-stories${s ? `?${s}` : ''}#stories`
  }

  return (
    <div className="relative overflow-hidden bg-[#f7f7f1]">
      <Mountains />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <PageIntro eyebrow="The Amianan Ventures Series" accent={{ bar: 'bg-[#c2410c]', text: 'text-[#c2410c]' }} title="Founder Stories">
          Real journeys of entrepreneurs and business builders, from the Cordillera highlands to wherever their
          ventures take them.
        </PageIntro>

        {showLead && (
          <div className={cn('mt-7 grid gap-5', lead.length > 1 && 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]')}>
            <LeadStory article={lead[0]} label={LABEL} />
            {lead[1] && <SideStory article={lead[1]} label={LABEL} />}
          </div>
        )}

        <div id="stories" className="mt-9 flex scroll-mt-32 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {needle ? (
            <p className="text-sm text-zinc-600">
              {matches.length} {matches.length === 1 ? 'story' : 'stories'} for{' '}
              <span className="font-semibold text-[#131314]">&ldquo;{q}&rdquo;</span>
              <Link href="/founder-stories" className="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-zinc-500 hover:text-[#131314]">
                <X className="h-3 w-3" aria-hidden /> Clear
              </Link>
            </p>
          ) : (
            <h2 className="font-editorial text-[1.6rem] font-bold leading-none text-[#131314]">More stories</h2>
          )}
          <form action="/founder-stories" method="get" role="search" className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              aria-label="Search founder stories"
              placeholder="Search founder stories, people, or topics…"
              className="w-full rounded-full border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#131314]"
            />
          </form>
        </div>

        {shown.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((a) => (
              <StoryCard key={a.id} article={a} label={LABEL} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-600">
            {needle
              ? 'No stories match that search.'
              : all.length === 0
                ? 'No founder stories published yet. Check back soon.'
                : 'More stories are on the way.'}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-6 border-t border-zinc-300/70 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 48 28" className="h-7 w-12 shrink-0 text-[#c2410c]" aria-hidden>
              <path d="M2 26 L14 8 L22 18 L30 4 L46 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span className="h-9 w-px bg-zinc-300" aria-hidden />
            <p className="max-w-md font-editorial text-[15px] font-normal italic leading-snug text-zinc-700">
              Documenting the people, ideas, and businesses shaping opportunity and inclusive growth, rooted in
              Northern Luzon and reaching beyond it.
            </p>
          </div>
          <Pagination page={page} pages={pages} hrefFor={hrefFor} />
        </div>
      </div>
    </div>
  )
}

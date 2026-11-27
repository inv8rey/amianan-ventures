import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { getFeaturedArticles, getPublishedArticles } from '@/lib/queries'
import { getUpcomingOpportunities } from '@/lib/opportunities'
import { requestTime } from '@/lib/countdown'
import { CommunityContributions } from '@/components/site/CommunityContributions'
import { OpportunitiesSidebar } from '@/components/site/opportunities/OpportunitiesSidebar'
import type { CommunityContribution } from '@/components/site/CommunityContributions'
import type { Article, Location } from '@/types'
import { ROLE_LABELS, type ContributorRole, type ContentType } from '@/types/contributor'

async function getEcosystemContributions(): Promise<CommunityContribution[]> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('contributor_submissions')
      .select('id, headline, summary, content_type, cover_image_url, published_at, contributor_profiles(display_name, role, organization, photo_url)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)
    if (!data) return []
    return data.map((s) => {
      const profile = Array.isArray(s.contributor_profiles)
        ? (s.contributor_profiles[0] ?? null)
        : (s.contributor_profiles as { display_name: string; role: string | null; organization: string | null; photo_url: string | null } | null)
      return {
        id: s.id,
        headline: s.headline,
        summary: s.summary,
        content_type: s.content_type as ContentType,
        cover_image_url: s.cover_image_url,
        published_at: s.published_at,
        contributor: profile,
      }
    })
  } catch {
    return []
  }
}

export const revalidate = 60

const locationLabel: Record<Location, string> = {
  cordillera: 'Cordillera',
  'cagayan-valley': 'Cagayan Valley',
  'ilocos-region': 'Ilocos Region',
  pangasinan: 'Pangasinan',
  national: 'National',
}

function formatDate(date: string | null) {
  if (!date) return ''
  return format(new Date(date), 'MMM d, yyyy')
}

function readTime(article: Article) {
  const words = (article.content ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

const articleHref = (a: Article) => `/${a.category}/${a.slug}`

// ─── Small pieces ──────────────────────────────────────────────
function ArticleTag({ article, featured = false }: { article: Article; featured?: boolean }) {
  const isStory = article.category === 'founder-stories'
  const label = featured ? 'Featured' : isStory ? 'Founder Story' : 'News'
  return (
    <span
      className={
        'inline-flex w-fit self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#131314] ' +
        (isStory && !featured ? 'bg-amber-300' : 'bg-[#befc65]')
      }
    >
      {label}
      {featured && article.location && <> · {locationLabel[article.location]}</>}
    </span>
  )
}

function Byline({ article }: { article: Article }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#131314] text-xs font-semibold text-[#befc65]" aria-hidden>
        {article.author.charAt(0).toUpperCase()}
      </span>
      <div className="text-[11px] leading-tight text-zinc-500">
        <p className="font-semibold text-zinc-800">By {article.author}</p>
        <p className="mt-0.5">
          {formatDate(article.published_at)} · {readTime(article)} min read
        </p>
      </div>
    </div>
  )
}

function UnderlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 border-b-2 border-[#befc65] pb-0.5 text-xs font-semibold text-[#131314] transition-colors hover:border-[#131314]"
    >
      {children} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  )
}

// ─── Editorial column ──────────────────────────────────────────
function JournalIntro() {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">The Innovation Journal</p>
      <h1 className="mt-3 font-editorial font-bold text-[2.4rem] leading-[1.05] text-[#131314] sm:text-[3rem] xl:text-[3.15rem]">
        What&rsquo;s being built in the{' '}
        <span className="relative inline-block">
          North?
          <svg
            className="absolute -bottom-1.5 left-0 w-[88%]"
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M2 8 C 50 2, 120 2, 198 6" fill="none" stroke="#befc65" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 sm:text-lg">
        The people, ideas, and developments shaping our innovation ecosystem.
      </p>
    </header>
  )
}

function FeaturedStory({ article }: { article: Article }) {
  return (
    <article className="group grid gap-5 md:grid-cols-[1.15fr_1fr] md:gap-7">
      <Link href={articleHref(article)} className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-zinc-200" tabIndex={-1} aria-hidden>
        {article.cover_image && (
          <Image
            src={article.cover_image}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 55vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ objectPosition: article.cover_position ?? '50% 50%' }}
          />
        )}
      </Link>
      <div className="flex flex-col">
        <ArticleTag article={article} featured />
        <h2 className="mt-3 font-editorial font-bold text-[1.85rem] leading-[1.08] text-[#131314] lg:text-[2.1rem]">
          <Link href={articleHref(article)} className="decoration-[#befc65] decoration-[3px] underline-offset-4 hover:underline">
            {article.title}
          </Link>
        </h2>
        {article.excerpt && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-zinc-600">{article.excerpt}</p>}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <Byline article={article} />
          <UnderlineLink href={articleHref(article)}>Read the story</UnderlineLink>
        </div>
      </div>
    </article>
  )
}

function StoryCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col">
      <Link href={articleHref(article)} className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-zinc-200" tabIndex={-1} aria-hidden>
        {article.cover_image && (
          <Image
            src={article.cover_image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 22vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ objectPosition: article.cover_position ?? '50% 50%' }}
          />
        )}
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <ArticleTag article={article} />
        {article.location && <span className="text-xs text-zinc-500">· {locationLabel[article.location]}</span>}
      </div>
      <h3 className="mt-2 font-editorial font-bold text-[1.2rem] leading-snug text-[#131314]">
        <Link href={articleHref(article)} className="decoration-[#befc65] decoration-2 underline-offset-4 hover:underline">
          {article.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-xs text-zinc-500">
        {formatDate(article.published_at)} · {readTime(article)} min read
      </p>
    </article>
  )
}

function LatestStories({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section aria-labelledby="latest-heading" className="border-t border-zinc-300/70 pt-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 id="latest-heading" className="font-editorial font-bold text-[1.9rem] leading-none text-[#131314]">
          Latest Stories
        </h2>
        <UnderlineLink href="/news">View all news</UnderlineLink>
      </div>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
        {articles.map((a) => (
          <StoryCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  )
}

function FounderStoriesFeature({ story }: { story: Article | null }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-[#131314] text-white sm:grid sm:grid-cols-[0.9fr_1.1fr]">
      <div className="relative aspect-[16/9] bg-zinc-800 sm:aspect-auto sm:min-h-[11rem]">
        {story?.cover_image && (
          <Image
            src={story.cover_image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 30vw"
            className="object-cover"
            style={{ objectPosition: story.cover_position ?? '50% 50%' }}
          />
        )}
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#befc65]">People who build</p>
        <h2 className="mt-2 font-editorial font-bold text-[2rem] leading-[1.05] text-white sm:text-[2.35rem]">Every venture has a story.</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-300">
          Meet the founders, innovators, and problem-solvers building impactful ventures, from Northern Luzon and beyond.
        </p>
        <Link
          href="/founder-stories"
          className="mt-5 inline-flex w-fit items-center gap-1.5 border-b-2 border-[#befc65] pb-0.5 text-sm font-semibold text-white hover:text-[#befc65]"
        >
          Explore Founder Stories <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

// ─── Contributors strip ────────────────────────────────────────
interface PublicContributor {
  id: string
  display_name: string
  role: string | null
  organization: string | null
  photo_url: string | null
  published_count: number
}

function ContributorsStrip({ contributors }: { contributors: PublicContributor[] }) {
  if (contributors.length === 0) return null
  return (
    <section className="py-8 border-t border-zinc-200">
      <div className="flex items-center justify-between mb-5">
        <div className="section-label mb-0">Community Contributors</div>
        <Link href="/contact?topic=story#message" className="text-[10px] font-bold text-[#131314] hover:underline uppercase tracking-wider flex items-center gap-0.5">
          Share a story <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {contributors.map((c) => (
          <Link
            key={c.id}
            href={`/contributors/${c.id}`}
            className="group flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#131314]/40 hover:shadow-sm transition-all"
          >
            {c.photo_url ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-200 group-hover:border-[#131314]/40 transition-colors">
                <Image src={c.photo_url} alt={c.display_name} fill className="object-cover" sizes="56px" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-zinc-200 group-hover:border-[#131314]/40 transition-colors">
                <span className="text-xl font-semibold text-white">
                  {c.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 w-full">
              <p className="text-xs font-bold text-zinc-900 group-hover:text-[#131314] transition-colors truncate">{c.display_name}</p>
              {c.role && (
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {ROLE_LABELS[c.role as ContributorRole] ?? c.role}
                </p>
              )}
              <p className="text-[10px] font-semibold text-[#131314] mt-1">
                {c.published_count} article{c.published_count !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

async function getPublishedContributors(): Promise<PublicContributor[]> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()

    // Get contributors who have at least one published submission
    const { data: subs } = await supabase
      .from('contributor_submissions')
      .select('contributor_id')
      .eq('status', 'published')

    if (!subs || subs.length === 0) return []

    // Count published per contributor
    const countMap: Record<string, number> = {}
    for (const s of subs) {
      countMap[s.contributor_id] = (countMap[s.contributor_id] ?? 0) + 1
    }

    const contributorIds = Object.keys(countMap)

    const { data: profiles } = await supabase
      .from('contributor_profiles')
      .select('id, display_name, role, organization, photo_url')
      .in('id', contributorIds)

    if (!profiles) return []

    return profiles.map((p) => ({
      id: p.id,
      display_name: p.display_name,
      role: p.role,
      organization: p.organization,
      photo_url: p.photo_url,
      published_count: countMap[p.id] ?? 0,
    })).sort((a, b) => b.published_count - a.published_count)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, news, founderStories, opportunities, contributors, ecosystemContributions] = await Promise.all([
    getFeaturedArticles(1).catch(() => [] as Article[]),
    getPublishedArticles(12, 'news').catch(() => [] as Article[]),
    getPublishedArticles(6, 'founder-stories').catch(() => [] as Article[]),
    getUpcomingOpportunities(4),
    getPublishedContributors(),
    getEcosystemContributions(),
  ])

  // Countdowns render from the same timestamp on server and client, then tick live.
  const now = requestTime()

  const byDate = (a: Article, b: Article) => Date.parse(b.published_at ?? '') - Date.parse(a.published_at ?? '')
  const all = [...news, ...founderStories].sort(byDate)
  const featuredArticle = featured[0] ?? news[0] ?? all[0] ?? null
  const latest = all.filter((a) => a.id !== featuredArticle?.id).slice(0, 3)
  const founderFeature = founderStories.find((a) => a.cover_image) ?? null

  return (
    <div className="bg-[#f7f7f1]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,68fr)_minmax(0,32fr)] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-x-0 lg:gap-y-9">
          <div className="lg:col-start-1 lg:row-start-1 lg:pr-10 xl:pr-12">
            <JournalIntro />
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:pr-10 xl:pr-12">
            {featuredArticle ? (
              <FeaturedStory article={featuredArticle} />
            ) : (
              <p className="py-16 text-center text-sm text-zinc-500">No stories published yet.</p>
            )}
          </div>

          {/* On phones and tablets this sits right after the featured story. */}
          <aside className="lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:border-l lg:border-zinc-300/70 lg:pl-8 xl:pl-10">
            <OpportunitiesSidebar items={opportunities.items} isSample={opportunities.isSample} now={now} />
          </aside>

          <div className="lg:col-start-1 lg:row-start-3 lg:pr-10 xl:pr-12">
            <LatestStories articles={latest} />
          </div>

          <div className="self-start lg:col-start-1 lg:row-start-4 lg:pr-10 xl:pr-12">
            <FounderStoriesFeature story={founderFeature} />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-300/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CommunityContributions contributions={ecosystemContributions} />
          <ContributorsStrip contributors={contributors} />
        </div>
      </div>
    </div>
  )
}

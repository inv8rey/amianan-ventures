import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowRight, ChevronRight, Calendar, MapPin } from 'lucide-react'
import {
  getFeaturedArticles,
  getPublishedArticles,
  getPublishedEvents,
  getAllDirectoryEntries,
  getFeaturedListings,
} from '@/lib/queries'
import { EcosystemSection } from '@/components/site/EcosystemSection'
import { FeaturedListings } from '@/components/site/FeaturedListings'
import { NewsletterSignup } from '@/components/site/NewsletterSignup'
import type { Article, DirectoryEntry, DirectoryType, Event, Location } from '@/types'

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

// ─── Category / type label ─────────────────────────────────────
// Green for News/Featured, warm amber for Founder Stories
function ArticleTag({ article }: { article: Article }) {
  if (article.category === 'founder-stories') {
    return (
      <span className="text-[10px] font-black text-[#d97706] uppercase tracking-wider">
        Founder Story
      </span>
    )
  }
  return (
    <span className="text-[10px] font-black text-[#00cc6a] uppercase tracking-wider">
      {article.featured ? 'Featured' : 'News'}
    </span>
  )
}

// ─── Left: Featured hero + 2 below ────────────────────────────
function HeroColumn({ featured, below }: { featured: Article; below: Article[] }) {
  const href = `/${featured.category}/${featured.slug}`
  return (
    <div>
      <Link href={href} className="group block mb-6">
        {featured.cover_image && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-zinc-100 mb-4">
            <Image
              src={featured.cover_image}
              alt={featured.title}
              fill
              priority
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 65vw"
            />
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black text-[#00cc6a] uppercase tracking-wider">Featured</span>
          {featured.location && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                {locationLabel[featured.location]}
              </span>
            </>
          )}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-900 leading-tight mb-2 group-hover:text-[#00a855] transition-colors">
          {featured.title}
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-3">{featured.excerpt}</p>
        <div className="text-xs text-zinc-400">
          By <span className="font-semibold text-zinc-600">{featured.author}</span>
          {featured.published_at && <span className="ml-2">{formatDate(featured.published_at)}</span>}
        </div>
      </Link>

      {below.length > 0 && (
        <div className="grid grid-cols-2 gap-4 pt-5 border-t border-zinc-200">
          {below.slice(0, 2).map((article) => (
            <Link key={article.id} href={`/${article.category}/${article.slug}`} className="group">
              {article.cover_image && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 mb-2">
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="25vw"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <ArticleTag article={article} />
                {article.location && (
                  <>
                    <span className="text-zinc-300">·</span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {locationLabel[article.location]}
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-sm font-bold text-zinc-800 group-hover:text-[#00a855] transition-colors leading-snug line-clamp-2">
                {article.title}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">{formatDate(article.published_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Right: Latest + Events stacked ───────────────────────────
function RightColumn({ latest, events }: { latest: Article[]; events: Event[] }) {
  return (
    <div className="space-y-7 divide-y divide-zinc-200">
      {/* Latest */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black">
          <span className="w-1 h-4 bg-[#00cc6a] rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-black">Latest</span>
        </div>
        <div className="divide-y divide-zinc-100">
          {latest.slice(0, 7).map((article) => (
            <Link
              key={article.id}
              href={`/${article.category}/${article.slug}`}
              className="group flex flex-col gap-0.5 py-3 hover:bg-zinc-50 px-1 -mx-1 rounded transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <ArticleTag article={article} />
                {article.location && (
                  <span className="text-[10px] text-zinc-400 font-medium">
                    · {locationLabel[article.location]}
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 font-medium ml-auto">
                  {formatDate(article.published_at)}
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-800 group-hover:text-[#00a855] transition-colors leading-snug line-clamp-2">
                {article.title}
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/news"
          className="mt-3 flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider transition-colors"
        >
          All news <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Events */}
      <div className="pt-7">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black">
          <span className="w-1 h-4 bg-[#00cc6a] rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-black">Upcoming Events</span>
        </div>
        <div className="space-y-4">
          {events.slice(0, 4).map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="group flex gap-3">
              <div className="shrink-0 text-center w-10">
                <div className="text-[10px] font-bold text-[#00a855] uppercase leading-none">
                  {new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', month: 'short' }).format(new Date(event.date))}
                </div>
                <div className="text-lg font-black text-zinc-900 leading-tight">
                  {new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', day: 'numeric' }).format(new Date(event.date))}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-800 group-hover:text-[#00a855] transition-colors line-clamp-2 leading-snug">
                  {event.title}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1 truncate">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />{event.location}
                </p>
              </div>
            </Link>
          ))}
          {events.length === 0 && (
            <p className="text-xs text-zinc-400">No upcoming events</p>
          )}
        </div>
        <Link href="/events" className="mt-3 flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider transition-colors">
          View all events <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

// ─── Recent articles grid (below hero) ────────────────────────
function RecentArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="section-label mb-0">Recent News</div>
        <Link href="/news" className="text-[10px] font-bold text-[#00a855] hover:underline uppercase tracking-wider flex items-center gap-0.5">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <Link key={article.id} href={`/${article.category}/${article.slug}`} className="group flex flex-col gap-2">
            {article.cover_image && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100">
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="33vw"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <ArticleTag article={article} />
              {article.location && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {locationLabel[article.location]}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#00a855] transition-colors leading-snug line-clamp-2">
              {article.title}
            </h3>
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">{article.excerpt}</p>
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{article.author}</span>
              <span>{formatDate(article.published_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Founder Stories strip ─────────────────────────────────────
function FounderStoriesStrip({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section className="py-8 border-t border-zinc-200">
      <div className="flex items-center justify-between mb-5">
        <div className="section-label mb-0">Founder Stories</div>
        <Link href="/founder-stories" className="text-[10px] font-bold text-[#00a855] hover:underline uppercase tracking-wider flex items-center gap-0.5">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {articles.map((article) => (
          <Link key={article.id} href={`/founder-stories/${article.slug}`} className="group flex flex-col gap-2">
            {article.cover_image && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100">
                <Image src={article.cover_image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
              </div>
            )}
            <ArticleTag article={article} />
            <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#00a855] transition-colors leading-snug line-clamp-2">{article.title}</h3>
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">{article.excerpt}</p>
            <p className="text-[10px] text-zinc-400">{formatDate(article.published_at)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────
export default async function HomePage() {
  const [
    featured,
    latestAll,
    founderStories,
    upcomingEvents,
    featuredListings,
  ] = await Promise.all([
    getFeaturedArticles(1),
    getPublishedArticles(18, 'news'),
    getPublishedArticles(4, 'founder-stories'),
    getPublishedEvents(true),
    getFeaturedListings().catch(() => []),
  ])

  // Directory might not exist yet — fail gracefully
  const directoryAll = await getAllDirectoryEntries(300).catch(() => [] as DirectoryEntry[])

  const featuredArticle = featured[0] ?? latestAll[0]
  const heroBelow = latestAll.filter((a) => a.id !== featuredArticle?.id).slice(0, 2)
  const recentArticles = latestAll.filter((a) => a.id !== featuredArticle?.id).slice(2, 8)

  // Fisher-Yates shuffle (server-side, so it re-randomizes on each ISR revalidation)
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // Group directory entries by type — randomized, max 12 per category
  const types: DirectoryType[] = ['startup', 'incubator', 'government', 'university', 'community']
  const entriesByType = types.reduce((acc, type) => {
    acc[type] = shuffle(directoryAll.filter((e: DirectoryEntry) => e.type === type)).slice(0, 12)
    return acc
  }, {} as Record<DirectoryType, DirectoryEntry[]>)
  const counts = types.reduce((acc, type) => {
    acc[type] = directoryAll.filter((e: DirectoryEntry) => e.type === type).length
    return acc
  }, {} as Record<DirectoryType, number>)

  return (
    <div className="bg-white">

      {/* ── 2-column hero ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 xl:gap-12">

          {/* LEFT: Featured hero */}
          <div className="border-r-0 lg:border-r border-zinc-200 lg:pr-10">
            {featuredArticle ? (
              <HeroColumn featured={featuredArticle} below={heroBelow} />
            ) : (
              <div className="py-20 text-center text-zinc-400 text-sm">No articles published yet.</div>
            )}
          </div>

          {/* RIGHT: Latest + Events */}
          <div className="hidden lg:block">
            <RightColumn latest={latestAll} events={upcomingEvents} />
          </div>

          {/* Mobile: compact latest */}
          <div className="lg:hidden border-t border-zinc-200 pt-6">
            <div className="section-label mb-4">Latest News</div>
            <div className="divide-y divide-zinc-100">
              {latestAll.slice(0, 5).map((article) => (
                <Link key={article.id} href={`/${article.category}/${article.slug}`} className="group flex gap-3 py-3">
                  {article.cover_image && (
                    <div className="relative shrink-0 w-16 h-11 rounded overflow-hidden bg-zinc-100">
                      <Image src={article.cover_image} alt={article.title} fill className="object-cover" sizes="64px" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-[#00a855] transition-colors line-clamp-2 leading-snug">{article.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1">{formatDate(article.published_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Featured Partners — sponsored/partner photo cards */}
        <FeaturedListings listings={featuredListings} />

        {/* Ecosystem Directory — shown before news */}
        <EcosystemSection entriesByType={entriesByType} counts={counts} showViewAll />

        {/* Recent articles */}
        <RecentArticles articles={recentArticles} />

        {/* Founder Stories */}
        <FounderStoriesStrip articles={founderStories} />
      </div>

      {/* ── Pre-footer CTA ─── */}
      <div className="mt-16 bg-[#042212] relative overflow-hidden">
        {/* Decorative ring */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: headline + CTAs */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              Building something<br />
              in the <span className="text-[#00cc6a] italic">north?</span>
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white/70 leading-tight mb-7">
              We want to hear from you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/submit-startup"
                className="inline-flex items-center gap-2 bg-[#00cc6a] text-black px-6 py-3 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors uppercase tracking-wide"
              >
                Submit a startup <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/partner"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded font-bold text-sm hover:border-white hover:bg-white/5 transition-colors uppercase tracking-wide"
              >
                Partner with us
              </Link>
              <Link
                href="/founder-story"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded font-bold text-sm hover:border-white hover:bg-white/5 transition-colors uppercase tracking-wide"
              >
                Share your story
              </Link>
            </div>
          </div>

          {/* Right: newsletter */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Stay in the loop</p>
            <p className="text-lg font-black text-white mb-2">Get the latest from Northern Luzon&apos;s innovation scene.</p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5 max-w-sm">
              Founder stories, ecosystem news, and upcoming events — delivered straight to your inbox.
            </p>
            <NewsletterSignup source="homepage-cta" />
          </div>
        </div>
      </div>
    </div>
  )
}

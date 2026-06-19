import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowRight, ChevronRight, MapPin, Briefcase } from 'lucide-react'
import {
  getFeaturedArticles,
  getPublishedArticles,
  getAllDirectoryEntries,
  getFeaturedListings,
} from '@/lib/queries'
import { EcosystemSection } from '@/components/site/EcosystemSection'
import { FeaturedListings } from '@/components/site/FeaturedListings'
import { NewsletterSignup } from '@/components/site/NewsletterSignup'
import { EcosystemPulseWidget } from '@/components/site/EcosystemPulseWidget'
import type { Article, DirectoryEntry, DirectoryType, Location } from '@/types'
import { ROLE_LABELS, type ContributorRole, type ContentType } from '@/types/contributor'

// ─── Ecosystem contributions types ────────────────────────────
interface EcosystemContribution {
  id: string
  headline: string
  summary: string
  content_type: ContentType
  published_url: string | null
  published_at: string | null
  contributor: {
    display_name: string
    role: string | null
    photo_url: string | null
  } | null
}

const CONTRIBUTION_TYPE_STYLE: Record<ContentType, { label: string; color: string; dot: string }> = {
  founder_story:       { label: 'Founder Story',       color: 'text-amber-700 bg-amber-50 border-amber-100',     dot: 'bg-amber-400' },
  opinion_essay:       { label: 'Perspective',          color: 'text-violet-700 bg-violet-50 border-violet-100',  dot: 'bg-violet-400' },
  program_recap:       { label: 'Program Recap',        color: 'text-blue-700 bg-blue-50 border-blue-100',        dot: 'bg-blue-400' },
  ecosystem_spotlight: { label: 'Ecosystem Spotlight',  color: 'text-[#00a855] bg-[#00a855]/8 border-[#00a855]/20', dot: 'bg-[#00a855]' },
  field_notes:         { label: 'Field Notes',          color: 'text-teal-700 bg-teal-50 border-teal-100',        dot: 'bg-teal-400' },
}

async function getEcosystemContributions(): Promise<EcosystemContribution[]> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('contributor_submissions')
      .select('id, headline, summary, content_type, published_url, published_at, contributor_profiles(display_name, role, photo_url)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5)
    if (!data) return []
    return data.map((s) => ({
      id: s.id,
      headline: s.headline,
      summary: s.summary,
      content_type: s.content_type as ContentType,
      published_url: s.published_url,
      published_at: s.published_at,
      contributor: Array.isArray(s.contributor_profiles)
        ? (s.contributor_profiles[0] ?? null)
        : (s.contributor_profiles as EcosystemContribution['contributor'] | null),
    }))
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

// ─── Right: Latest + Featured Startups + Top Contributors stacked ────────
function RightColumn({ latest, featuredStartups, topContributors, ecosystemReports }: { latest: Article[]; featuredStartups: DirectoryEntry[]; topContributors: PublicContributor[]; ecosystemReports: EcosystemReport[] }) {
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

      {/* Featured Startups */}
      {featuredStartups.length > 0 && (
        <div className="pt-7">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black">
            <span className="w-1 h-4 bg-[#00cc6a] rounded-full" />
            <span className="text-xs font-black uppercase tracking-widest text-black">Featured Startups</span>
          </div>
          <div className="space-y-3">
            {featuredStartups.map((startup) => (
              <div key={startup.id} className="flex items-center gap-3">
                {/* Logo */}
                <div className="shrink-0 w-9 h-9 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center">
                  {startup.logo_url ? (
                    <Image
                      src={startup.logo_url}
                      alt={startup.name}
                      width={36}
                      height={36}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <Briefcase className="h-4 w-4 text-zinc-300" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  {startup.website ? (
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-zinc-800 hover:text-[#00a855] transition-colors truncate block leading-snug"
                    >
                      {startup.name}
                    </a>
                  ) : (
                    <p className="text-xs font-bold text-zinc-800 truncate leading-snug">{startup.name}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {startup.sector && (
                      <span className="text-[10px] text-zinc-400 truncate">{startup.sector}</span>
                    )}
                    {startup.city && (
                      <>
                        {startup.sector && <span className="text-zinc-200">·</span>}
                        <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 truncate">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />{startup.city}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/ecosystem"
            className="mt-4 flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider transition-colors"
          >
            Explore ecosystem <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div className="pt-7">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black">
            <span className="w-1 h-4 bg-[#00cc6a] rounded-full" />
            <span className="text-xs font-black uppercase tracking-widest text-black">Top Contributors</span>
          </div>
          <div className="space-y-3">
            {topContributors.slice(0, 5).map((c, i) => (
              <Link
                key={c.id}
                href={`/contributors/${c.id}`}
                className="group flex items-center gap-2.5 hover:bg-zinc-50 px-1 -mx-1 py-1 rounded transition-colors"
              >
                {/* Rank */}
                <span className="text-[10px] font-black text-zinc-300 w-4 shrink-0 text-center">{i + 1}</span>
                {/* Avatar */}
                {c.photo_url ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                    <Image src={c.photo_url} alt={c.display_name} fill className="object-cover" sizes="28px" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200">
                    <span className="text-[9px] font-black text-white">{c.display_name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-800 group-hover:text-[#00a855] transition-colors truncate leading-none">
                    {c.display_name}
                  </p>
                  {c.role && (
                    <p className="text-[10px] text-zinc-400 truncate leading-none mt-0.5">
                      {ROLE_LABELS[c.role as ContributorRole] ?? c.role}
                    </p>
                  )}
                </div>
                {/* Article count */}
                <span className="text-[10px] font-bold text-[#00a855] shrink-0">
                  {c.published_count} {c.published_count !== 1 ? 'articles' : 'article'}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/ecosystem#contributors"
            className="mt-3 flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider transition-colors"
          >
            View all contributors <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Ecosystem Pulse */}
      <EcosystemPulseWidget reports={ecosystemReports} />
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

// ─── From the Ecosystem ───────────────────────────────────────
function ContributionTypeBadge({ type }: { type: ContentType }) {
  const s = CONTRIBUTION_TYPE_STYLE[type]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  )
}

function ContributorByline({ contributor, date }: { contributor: EcosystemContribution['contributor']; date: string | null }) {
  if (!contributor) return null
  return (
    <div className="flex items-center gap-2.5 mt-auto pt-4">
      {contributor.photo_url ? (
        <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-zinc-200">
          <Image src={contributor.photo_url} alt={contributor.display_name} fill className="object-cover" sizes="28px" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-white">{contributor.display_name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-zinc-800 truncate">{contributor.display_name}</p>
        {contributor.role && (
          <p className="text-[10px] text-zinc-400 truncate leading-none mt-0.5">
            {ROLE_LABELS[contributor.role as ContributorRole] ?? contributor.role}
          </p>
        )}
      </div>
      {date && (
        <span className="text-[10px] text-zinc-300 ml-auto shrink-0">
          {format(new Date(date), 'MMM d, yyyy')}
        </span>
      )}
    </div>
  )
}

function FromTheEcosystem({ contributions }: { contributions: EcosystemContribution[] }) {
  if (contributions.length === 0) return null
  const [featured, ...secondary] = contributions

  return (
    <section className="py-12 border-t border-zinc-100">

      {/* ── Section header ── */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#00a855] mb-2.5">
            Community Contributions
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight tracking-tight">
            From the Ecosystem
          </h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-xl leading-relaxed">
            Perspectives, lessons, and field insights from founders, students, researchers,
            and builders shaping innovation across Northern Luzon.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
          <Link
            href="/contribute/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-black transition-colors whitespace-nowrap"
          >
            Submit a Contribution <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/contribute"
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            View All Contributions →
          </Link>
        </div>
      </div>

      {/* ── Editorial grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* Featured card */}
        {featured.published_url ? (
          <a href={featured.published_url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-4 p-6 sm:p-8 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100 transition-all">
            <FeaturedInner contribution={featured} />
          </a>
        ) : (
          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl border border-zinc-200 bg-white">
            <FeaturedInner contribution={featured} />
          </div>
        )}

        {/* Secondary cards */}
        {secondary.length > 0 && (
          <div className="flex flex-col gap-3">
            {secondary.slice(0, 4).map((c) => {
              const inner = (
                <SecondaryInner contribution={c} />
              )
              return c.published_url ? (
                <a
                  key={c.id}
                  href={c.published_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 p-4 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm transition-all"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.id} className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-100 bg-white">
                  {inner}
                </div>
              )
            })}

            {/* Mobile CTAs */}
            <div className="flex sm:hidden items-center gap-4 mt-1 pt-3 border-t border-zinc-100">
              <Link href="/contribute/signup" className="text-xs font-bold text-zinc-900 hover:underline">
                Submit a Contribution →
              </Link>
              <Link href="/contribute" className="text-xs text-zinc-400 hover:text-zinc-600">
                View all
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturedInner({ contribution: c }: { contribution: EcosystemContribution }) {
  return (
    <>
      <ContributionTypeBadge type={c.content_type} />
      <div className="flex-1">
        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 leading-snug group-hover:text-[#00a855] transition-colors mb-3 tracking-tight">
          {c.headline}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">
          {c.summary}
        </p>
      </div>
      <ContributorByline contributor={c.contributor} date={c.published_at} />
    </>
  )
}

function SecondaryInner({ contribution: c }: { contribution: EcosystemContribution }) {
  return (
    <>
      <ContributionTypeBadge type={c.content_type} />
      <h3 className="text-sm font-bold text-zinc-900 leading-snug group-hover:text-[#00a855] transition-colors line-clamp-2">
        {c.headline}
      </h3>
      <div className="flex items-center gap-2 mt-auto">
        {c.contributor && (
          <>
            {c.contributor.photo_url ? (
              <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                <Image src={c.contributor.photo_url} alt={c.contributor.display_name} fill className="object-cover" sizes="20px" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <span className="text-[8px] font-black text-white">{c.contributor.display_name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span className="text-[10px] font-semibold text-zinc-500 truncate">{c.contributor.display_name}</span>
          </>
        )}
        {c.published_at && (
          <span className="text-[10px] text-zinc-300 ml-auto shrink-0">{format(new Date(c.published_at), 'MMM d')}</span>
        )}
      </div>
    </>
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
        <Link href="/contribute" className="text-[10px] font-bold text-[#00a855] hover:underline uppercase tracking-wider flex items-center gap-0.5">
          Become a contributor <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {contributors.map((c) => (
          <Link
            key={c.id}
            href={`/contributors/${c.id}`}
            className="group flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#00a855]/40 hover:shadow-sm transition-all"
          >
            {c.photo_url ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-200 group-hover:border-[#00a855]/40 transition-colors">
                <Image src={c.photo_url} alt={c.display_name} fill className="object-cover" sizes="56px" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-zinc-200 group-hover:border-[#00a855]/40 transition-colors">
                <span className="text-xl font-black text-white">
                  {c.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 w-full">
              <p className="text-xs font-bold text-zinc-900 group-hover:text-[#00a855] transition-colors truncate">{c.display_name}</p>
              {c.role && (
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {ROLE_LABELS[c.role as ContributorRole] ?? c.role}
                </p>
              )}
              <p className="text-[10px] font-semibold text-[#00a855] mt-1">
                {c.published_count} article{c.published_count !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────
// ─── Ecosystem reports ────────────────────────────────────────
interface EcosystemReport {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  published_at: string | null
}

async function getEcosystemReports(): Promise<EcosystemReport[]> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('ecosystem_reports')
      .select('id, title, slug, description, cover_image_url, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3)
    return data ?? []
  } catch {
    return []
  }
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
  const [
    featured,
    latestAll,
    founderStories,
    featuredListings,
    contributors,
    ecosystemContributions,
    ecosystemReports,
  ] = await Promise.all([
    getFeaturedArticles(1),
    getPublishedArticles(18, 'news'),
    getPublishedArticles(4, 'founder-stories'),
    getFeaturedListings().catch(() => []),
    getPublishedContributors(),
    getEcosystemContributions(),
    getEcosystemReports(),
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

          {/* RIGHT: Latest + Featured Startups + Top Contributors */}
          <div className="hidden lg:block">
            <RightColumn latest={latestAll} featuredStartups={entriesByType.startup.slice(0, 4)} topContributors={contributors} ecosystemReports={ecosystemReports} />
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

        {/* From the Ecosystem — community contributions */}
        <FromTheEcosystem contributions={ecosystemContributions} />

        {/* Contributors */}
        <ContributorsStrip contributors={contributors} />
      </div>

      {/* ── Pre-footer CTA ─── */}
      <div id="newsletter" className="mt-16 bg-[#042212] relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Subscribe */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-4">Free newsletter</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              Northern Luzon&apos;s<br />
              innovation scene —<br />
              <span className="text-[#00cc6a] italic">in your inbox.</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-7 max-w-sm">
              Founder stories, ecosystem news, and upcoming events. Join the community staying informed about what&apos;s being built in the north.
            </p>
            <NewsletterSignup source="homepage-cta" />
          </div>

          {/* Right: Become a Contributor */}
          <div className="lg:border-l lg:border-white/10 lg:pl-12">
            <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-4">Contributor portal</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              Your story belongs<br />
              <span className="text-white/60">in the ecosystem.</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-7 max-w-sm">
              Founders, researchers, and ecosystem builders — share your perspective with the community. Submit an article, opinion piece, or field notes.
            </p>
            <Link
              href="/contribute"
              className="inline-flex items-center gap-2 bg-[#00cc6a] text-black px-7 py-3.5 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors uppercase tracking-wide"
            >
              Become a contributor <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-zinc-600">
              Already a contributor?{' '}
              <Link href="/contribute/login" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

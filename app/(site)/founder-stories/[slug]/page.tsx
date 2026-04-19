import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Clock, User, MapPin } from 'lucide-react'
import { SubmitStoryBanner } from '@/components/site/SubmitStoryBanner'
import { getArticleBySlug, getPublishedArticles } from '@/lib/queries'
import { createBuildClient } from '@/lib/supabase/build'
import type { Location } from '@/types'

export const revalidate = 60

const locationLabel: Record<Location, string> = {
  cordillera: 'Cordillera',
  'cagayan-valley': 'Cagayan Valley',
  'ilocos-region': 'Ilocos Region',
  pangasinan: 'Pangasinan',
  national: 'National',
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http')) return []
  const supabase = createBuildClient()
  const { data } = await supabase.from('articles').select('slug').eq('status', 'published').eq('category', 'founder-stories')
  return (data ?? []).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      authors: [article.author],
      images: article.cover_image ? [{ url: article.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.cover_image ? [article.cover_image] : [],
    },
  }
}

export default async function FounderStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article || article.category !== 'founder-stories') notFound()

  const [sameCat, sameLocation] = await Promise.all([
    getPublishedArticles(8, 'founder-stories'),
    article.location ? getPublishedArticles(4, undefined, article.location) : Promise.resolve([]),
  ])

  const seen = new Set([article.slug])
  const related = [
    ...sameLocation.filter((a) => !seen.has(a.slug) && seen.add(a.slug)),
    ...sameCat.filter((a) => !seen.has(a.slug) && seen.add(a.slug)),
  ].slice(0, 6)

  const date = article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image ?? undefined,
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: 'Amianan Ventures', url: 'https://amiananventures.org' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 xl:gap-14">

          {/* ── Article ── */}
          <article>
            <Link href="/founder-stories" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors mb-6 uppercase tracking-wider">
              <ArrowLeft className="h-3.5 w-3.5" /> Founder Stories
            </Link>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-[#d97706] uppercase tracking-wider">Founder Story</span>
              {article.location && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />{locationLabel[article.location]}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight mb-4 text-zinc-900">
              {article.title}
            </h1>

            <p className="text-base text-zinc-500 leading-relaxed mb-5 font-medium">{article.excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pb-5 mb-6 border-b border-zinc-200">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-600">
                <User className="h-3.5 w-3.5" /> {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {date}
              </span>
              {article.tags?.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {article.cover_image && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-zinc-100">
                <Image src={article.cover_image} alt={article.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
              </div>
            )}

            <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.content }} />

            <SubmitStoryBanner />
          </article>

          {/* ── Sidebar: 6 similar stories ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div>
                <div className="section-label mb-4">More Stories</div>
                {related.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {related.map((a) => (
                      <Link key={a.id} href={`/founder-stories/${a.slug}`} className="group flex gap-3 py-3 first:pt-0">
                        {a.cover_image && (
                          <div className="relative shrink-0 w-16 h-11 rounded overflow-hidden bg-zinc-100">
                            <Image src={a.cover_image} alt={a.title} fill className="object-cover" sizes="64px" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {a.location && (
                            <span className="text-[9px] font-bold text-[#00cc6a] uppercase tracking-wider block mb-0.5">
                              {locationLabel[a.location]}
                            </span>
                          )}
                          <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-[#00a855] transition-colors line-clamp-2 leading-snug">
                            {a.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {a.published_at ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true }) : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">No related stories yet.</p>
                )}
              </div>

              <div className="rounded border-2 border-[#042212] overflow-hidden">
                <div className="bg-[#d97706] px-3 py-2">
                  <p className="text-[10px] font-black text-black uppercase tracking-wider">Share Your Journey</p>
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs text-zinc-500 mb-3 leading-relaxed">Are you a founder in Northern Luzon? We'd love to tell your story.</p>
                  <Link href="/contact" className="flex items-center justify-center gap-1 w-full py-1.5 bg-black text-white text-[10px] font-bold rounded hover:bg-zinc-800 transition-colors uppercase tracking-wide">
                    Get featured →
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

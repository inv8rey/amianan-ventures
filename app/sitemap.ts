import type { MetadataRoute } from 'next'
import { getAllArticleSlugs, getAllEventSlugs } from '@/lib/queries'
import { SITE_URL } from '@/lib/site'

const BASE = SITE_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articleSlugs, eventSlugs] = await Promise.all([
    getAllArticleSlugs(),
    getAllEventSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/founder-stories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/opportunities`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/ecosystem-pulse`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ]

  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((a) => ({
    // Founder stories live under /founder-stories, news under /news
    url: `${BASE}/${(a as { category?: string }).category === 'founder-stories' ? 'founder-stories' : 'news'}/${(a as { slug: string }).slug}`,
    lastModified: new Date((a as { updated_at: string }).updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const eventPages: MetadataRoute.Sitemap = eventSlugs.map((e) => ({
    url: `${BASE}/events/${(e as { slug: string }).slug}`,
    lastModified: new Date((e as { updated_at: string }).updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...articlePages, ...eventPages]
}

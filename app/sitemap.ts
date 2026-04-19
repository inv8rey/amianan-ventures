import type { MetadataRoute } from 'next'
import { getAllArticleSlugs, getAllEventSlugs } from '@/lib/queries'

const BASE = 'https://amiananventures.org'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articleSlugs, eventSlugs] = await Promise.all([
    getAllArticleSlugs(),
    getAllEventSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/founder-stories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((a) => ({
    url: `${BASE}/news/${(a as { slug: string }).slug}`,
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

import { createClient } from '@/lib/supabase/server'
import type { Article, DirectoryEntry, Event, FeaturedListing, Location } from '@/types'

export async function getPublishedArticles(limit?: number, category?: string, location?: Location) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  let query = supabase
    .from('articles')
    .select('*')
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${now})`)
    .order('published_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (location) query = query.eq('location', location)
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data as Article[]
}

export async function getArticlesByLocation(location: Location, limit = 4) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${now})`)
    .eq('location', location)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data as Article[]
}

export async function getFeaturedArticles(limit = 1) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${now})`)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Article[]
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${now})`)
    .single()

  if (error) return null
  return data as Article
}

export async function getPublishedEvents(upcoming = true) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  let query = supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: true })

  if (upcoming) query = query.gte('date', now)

  const { data, error } = await query
  if (error) throw error
  return data as Event[]
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) return null
  return data as Event
}

export async function getAllArticleSlugs() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${now})`)
  return data ?? []
}

export async function getAllEventSlugs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('slug, updated_at')
    .eq('status', 'published')
  return data ?? []
}

export async function getDirectoryEntries(type?: string, limit = 6) {
  const supabase = await createClient()
  let query = supabase
    .from('directory')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true })

  if (type) query = query.eq('type', type)
  query = query.limit(limit)

  const { data } = await query
  return (data ?? []) as DirectoryEntry[]
}

export async function getAllDirectoryEntries(limit = 60) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('directory')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true })
    .limit(limit)
  return (data ?? []) as DirectoryEntry[]
}

export async function getFeaturedListings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('featured_listings')
    .select('*')
    .eq('status', 'published')
    .order('display_order', { ascending: true })
  return (data ?? []) as FeaturedListing[]
}

export async function getFeaturedDirectoryEntries() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('directory')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('name', { ascending: true })
  return (data ?? []) as DirectoryEntry[]
}

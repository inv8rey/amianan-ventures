'use server'

import { createClient } from '@/lib/supabase/server'
import type { DirectoryType } from '@/types'

// ─── Article import ────────────────────────────────────────────

export interface ImportRow {
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  category: 'news' | 'founder-stories'
  published_at: string | null
  featured: boolean
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
  skippedSlugs: string[]
}

export async function importArticles(rows: ImportRow[]): Promise<ImportResult> {
  const supabase = await createClient()

  const { data: existing } = await supabase.from('articles').select('slug')
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug))

  const toInsert: ImportRow[] = []
  const skippedSlugs: string[] = []

  for (const row of rows) {
    if (!row.slug || !row.title) continue
    if (existingSlugs.has(row.slug)) {
      skippedSlugs.push(row.slug)
    } else {
      toInsert.push(row)
    }
  }

  if (toInsert.length === 0) {
    return { imported: 0, skipped: skippedSlugs.length, errors: [], skippedSlugs }
  }

  const payload = toInsert.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    cover_image: row.cover_image || null,
    category: row.category,
    published_at: row.published_at,
    featured: row.featured,
    status: 'published' as const,
    author: 'Amianan Ventures',
    location: null,
    tags: [] as string[],
  }))

  const errors: string[] = []
  let imported = 0
  const batchSize = 50

  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize)
    const { error } = await supabase.from('articles').insert(batch)
    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
    } else {
      imported += batch.length
    }
  }

  return { imported, skipped: skippedSlugs.length, errors, skippedSlugs }
}

// ─── Directory import ──────────────────────────────────────────

export interface DirectoryImportRow {
  name: string
  type: DirectoryType
  sector: string | null
  city: string | null
  logo_url: string | null
  website: string | null
}

export interface DirectoryImportResult {
  imported: number
  skipped: number
  errors: string[]
  skippedNames: string[]
}

export async function importDirectory(rows: DirectoryImportRow[]): Promise<DirectoryImportResult> {
  const supabase = await createClient()

  // Skip entries that already exist by name (case-insensitive)
  const { data: existing } = await supabase.from('directory').select('name')
  const existingNames = new Set(
    (existing ?? []).map((r: { name: string }) => r.name.toLowerCase().trim())
  )

  const toInsert: DirectoryImportRow[] = []
  const skippedNames: string[] = []

  for (const row of rows) {
    if (!row.name) continue
    if (existingNames.has(row.name.toLowerCase().trim())) {
      skippedNames.push(row.name)
    } else {
      toInsert.push(row)
    }
  }

  if (toInsert.length === 0) {
    return { imported: 0, skipped: skippedNames.length, errors: [], skippedNames }
  }

  const payload = toInsert.map((row) => ({
    name: row.name.trim(),
    type: row.type,
    sector: row.sector || null,
    city: row.city || null,
    logo_url: row.logo_url || null,
    website: row.website || null,
    status: 'published' as const,
  }))

  const errors: string[] = []
  let imported = 0
  const batchSize = 50

  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize)
    const { error } = await supabase.from('directory').insert(batch)
    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
    } else {
      imported += batch.length
    }
  }

  return { imported, skipped: skippedNames.length, errors, skippedNames }
}

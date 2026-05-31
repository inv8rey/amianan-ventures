'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export type ReportInput = {
  id?: string
  title: string
  slug: string
  author: string
  description: string
  cover_image_url: string
  file_url: string
  is_published: boolean
  published_at: string | null
}

export async function saveReport(input: ReportInput) {
  try {
    const supabase = createServiceClient()

    const payload = {
      title: input.title.trim(),
      slug: input.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      author: input.author.trim() || null,
      description: input.description.trim() || null,
      cover_image_url: input.cover_image_url.trim() || null,
      file_url: input.file_url.trim(),
      is_published: input.is_published,
      published_at: input.is_published ? (input.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    }

    if (input.id) {
      const { error } = await supabase.from('ecosystem_reports').update(payload).eq('id', input.id)
      if (error) return { ok: false as const, error: error.message }
    } else {
      const { error } = await supabase.from('ecosystem_reports').insert(payload)
      if (error) return { ok: false as const, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/ecosystem-pulse', 'layout')
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: String(e) }
  }
}

export async function deleteReport(id: string) {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('ecosystem_reports').delete().eq('id', id)
    if (error) return { ok: false as const, error: error.message }
    revalidatePath('/')
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: String(e) }
  }
}

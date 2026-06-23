import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPublishedArticles } from '@/lib/queries'
import { ResourceHub } from '@/components/site/ResourceHub'
import type { FounderResource } from '@/types/resources'
import type { Article } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Founder Resource Hub',
  description: 'Practical templates and tools used by founders, innovators, and entrepreneurs across Northern Luzon.',
}

export default async function ResourcesPage() {
  const supabase = await createClient()

  const [{ data: resources }, articles] = await Promise.all([
    supabase
      .from('founder_resources')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    getPublishedArticles(3).catch(() => [] as Article[]),
  ])

  return (
    <ResourceHub
      resources={(resources ?? []) as FounderResource[]}
      articles={articles}
    />
  )
}

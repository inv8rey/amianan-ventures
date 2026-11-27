// Published Ecosystem Pulse research reports ("Ecosystem Insights").
// Read with the service client, as the report pages do: the table has no public read policy.
export interface EcosystemReport {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  published_at: string | null
}

export async function getPublishedReports(limit?: number): Promise<EcosystemReport[]> {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    let query = createServiceClient()
      .from('ecosystem_reports')
      .select('id, title, slug, description, cover_image_url, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data } = await query
    return (data ?? []) as EcosystemReport[]
  } catch {
    return []
  }
}

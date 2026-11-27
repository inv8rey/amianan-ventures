import { createClient } from '@/lib/supabase/server'
import type { Opportunity, OpportunityCategory } from '@/types/opportunities'

export interface OpportunityList {
  items: Opportunity[]
  /** True only in local development when the table is empty or missing. Never in production. */
  isSample: boolean
}

/**
 * Published opportunities whose deadline has not passed, nearest deadline first.
 */
export async function getUpcomingOpportunities(
  limit?: number,
  category?: OpportunityCategory,
): Promise<OpportunityList> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'published')
      .gt('deadline', new Date().toISOString())
      .order('deadline', { ascending: true })
    if (category) query = query.eq('category', category)
    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error) throw error
    if (data && data.length > 0) return { items: data as Opportunity[], isSample: false }
  } catch (e) {
    if (process.env.NODE_ENV !== 'development') {
      console.error('[opportunities] query failed:', e instanceof Error ? e.message : e)
    }
  }
  return devFallback(limit, category)
}

/** Published opportunities that closed recently, most recent first. */
export async function getRecentlyClosedOpportunities(limit = 6): Promise<Opportunity[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'published')
      .lte('deadline', new Date().toISOString())
      .order('deadline', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as Opportunity[]
  } catch {
    return []
  }
}

/** Featured pick: the nearest featured opportunity, otherwise the nearest one overall. */
export function splitFeatured(items: Opportunity[]) {
  const featured = items.find((o) => o.featured) ?? items[0] ?? null
  const rest = featured ? items.filter((o) => o.id !== featured.id) : []
  return { featured, rest }
}

// ─── Development fixtures ──────────────────────────────────────────────
// Clearly labelled sample records so the layout and countdowns can be checked
// locally before real opportunities exist. Deadlines are relative to "now" so
// every urgency state shows up. They are never returned in production builds.
function devFallback(limit?: number, category?: OpportunityCategory): OpportunityList {
  if (process.env.NODE_ENV !== 'development') return { items: [], isSample: false }
  const now = Date.now()
  const h = 60 * 60 * 1000
  const base = {
    summary: 'Sample record for local development only.',
    cover_image: null,
    status: 'published' as const,
    created_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString(),
  }
  const samples: Opportunity[] = [
    { ...base, id: 'sample-1', slug: 'sample-1', title: 'Sample: Startup Grant Program', category: 'funding-grants', organization: 'Sample Organizer', location: 'Northern Luzon', deadline: new Date(now + 3 * 24 * h + 5 * h).toISOString(), apply_url: null, featured: true },
    { ...base, id: 'sample-2', slug: 'sample-2', title: 'Sample: Regional Innovation Challenge', category: 'competition', organization: 'Sample Network', location: 'Cordillera', deadline: new Date(now + 9 * h).toISOString(), apply_url: null, featured: false },
    { ...base, id: 'sample-3', slug: 'sample-3', title: 'Sample: Startup Accelerator Cohort', category: 'program-incubation', organization: 'Sample Hub', location: 'Baguio City', deadline: new Date(now + 12 * 24 * h).toISOString(), apply_url: null, featured: false },
    { ...base, id: 'sample-4', slug: 'sample-4', title: 'Sample: Research and Development Grant', category: 'funding-grants', organization: 'Sample Council', location: 'Nationwide', deadline: new Date(now + 27 * 24 * h).toISOString(), apply_url: null, featured: false },
  ]
  let items = samples.sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
  if (category) items = items.filter((o) => o.category === category)
  if (limit) items = items.slice(0, limit)
  return { items, isSample: true }
}

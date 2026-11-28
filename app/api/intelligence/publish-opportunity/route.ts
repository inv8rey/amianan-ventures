import { NextResponse } from 'next/server'
import { getSessionRole } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/service'
import type { OpportunityCategory } from '@/types/opportunities'

const categories = new Set<OpportunityCategory>(['funding-grants','competition','program-incubation','events','partnerships','jobs-fellowships'])
const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-').slice(0, 68)

export async function POST(request: Request) {
  const { user, isAdmin } = await getSessionRole()
  if (!user || !isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  let body: { itemId?: unknown }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (typeof body.itemId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.itemId)) return NextResponse.json({ error: 'Invalid finding' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: item, error: readError } = await supabase.from('intelligence_items').select('*').eq('id', body.itemId).single()
  if (readError || !item) return NextResponse.json({ error: 'Finding not found' }, { status: 404 })
  const tags: string[] = Array.isArray(item.tags) ? item.tags : []
  const categoryTag = tags.find((tag) => tag.startsWith('opportunity-category:'))?.slice('opportunity-category:'.length)
  const category = categoryTag as OpportunityCategory
  const deadline = typeof item.deadline_at === 'string' ? new Date(item.deadline_at) : null
  let source: URL
  try { source = new URL(item.source_url) } catch { return NextResponse.json({ error: 'A valid official source link is required.' }, { status: 422 }) }
  if (!tags.includes('opportunity-candidate') || !categories.has(category)) return NextResponse.json({ error: 'This finding is not classified as a publishable opportunity. Verify it as an open call first.' }, { status: 422 })
  if (!deadline || Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) return NextResponse.json({ error: 'A verified future deadline is required. This finding cannot be published as open.' }, { status: 422 })
  if (!item.title?.trim() || !item.organization?.trim()) return NextResponse.json({ error: 'A title and organizing institution are required.' }, { status: 422 })
  if (!['https:'].includes(source.protocol)) return NextResponse.json({ error: 'The source link must use HTTPS.' }, { status: 422 })
  const summary = String(item.summary || item.source_excerpt || '').trim().slice(0, 1600)
  if (!summary) return NextResponse.json({ error: 'A source-backed summary is required.' }, { status: 422 })

  // Make repeated clicks idempotent for the same official application URL.
  const { data: existing } = await supabase.from('opportunities').select('id,slug').eq('apply_url', source.toString()).limit(1).maybeSingle()
  if (existing) {
    const note = `Already live in /opportunities: ${existing.slug}`
    await Promise.all([
      supabase.from('intelligence_items').update({ review_status: 'actioned', updated_at: new Date().toISOString() }).eq('id', item.id),
      supabase.from('intelligence_review_activity').insert({ item_id: item.id, user_id: user.id, status: 'actioned', note }),
    ])
    return NextResponse.json({ success: true, alreadyPublished: true, publicPath: '/opportunities#open', opportunityId: existing.id, slug: existing.slug })
  }

  const slug = `${slugify(item.title) || 'opportunity'}-${String(item.id).slice(0, 8)}`
  const { data: published, error: insertError } = await supabase.from('opportunities').insert({
    title: item.title.trim().slice(0, 180), slug, category, organization: item.organization.trim().slice(0, 180),
    summary, location: typeof item.location === 'string' ? item.location.trim().slice(0, 180) || null : null,
    deadline: deadline.toISOString(), apply_url: source.toString(), cover_image: null, featured: false, status: 'published',
  }).select('id,slug').single()
  if (insertError || !published) return NextResponse.json({ error: 'Could not publish this opportunity. Check whether it already exists.' }, { status: 500 })

  const note = `Published live to /opportunities: ${published.slug}`
  const [{ error: itemError }, { error: activityError }] = await Promise.all([
    supabase.from('intelligence_items').update({ review_status: 'actioned', updated_at: new Date().toISOString() }).eq('id', item.id),
    supabase.from('intelligence_review_activity').insert({ item_id: item.id, user_id: user.id, status: 'actioned', note }),
  ])
  if (itemError || activityError) console.error('[intelligence publish] Opportunity is live; review audit update failed:', itemError?.message ?? activityError?.message)
  return NextResponse.json({ success: true, alreadyPublished: false, publicPath: '/opportunities#open', opportunityId: published.id, slug: published.slug })
}

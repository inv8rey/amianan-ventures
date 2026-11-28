import { NextResponse } from 'next/server'
import { getSessionRole } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/service'

const allowedStatuses = new Set(['new','saved','in_progress','actioned','dismissed'])

export async function POST(request: Request) {
  const { user, isAdmin } = await getSessionRole()
  if (!user || !isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  let body: { itemId?: unknown; status?: unknown; note?: unknown }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (typeof body.itemId !== 'string' || typeof body.status !== 'string' || !allowedStatuses.has(body.status)) return NextResponse.json({ error: 'Invalid review update' }, { status: 400 })
  const supabase = createServiceClient()
  const { error } = await supabase.from('intelligence_items').update({ review_status: body.status, updated_at: new Date().toISOString() }).eq('id', body.itemId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const note = typeof body.note === 'string' ? body.note.slice(0, 2000) : null
  const { error: logError } = await supabase.from('intelligence_review_activity').insert({ item_id: body.itemId, user_id: user.id, status: body.status, note })
  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import {
  sendSpotlightApproved,
  sendSpotlightRejected,
  sendSpotlightPaymentConfirmed,
  sendSpotlightPublished,
} from '@/lib/email'
import type { SpotlightStatus } from '@/types/spotlight'

// Called from SpotlightEditorActions client component to update application
// status and trigger emails. Mirrors /api/contributor/editor-action.
export async function POST(request: Request) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const body = await request.json()
  const { applicationId, status, editorNotes, publishedUrl, silent } = body as {
    applicationId: string
    status: SpotlightStatus
    editorNotes?: string
    publishedUrl?: string
    silent?: boolean
  }

  if (!applicationId || !status) {
    return NextResponse.json({ error: 'applicationId and status required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const updatePayload: Record<string, unknown> = { status }
  if (editorNotes !== undefined) updatePayload.editor_notes = editorNotes || null

  switch (status) {
    case 'under_review':
      updatePayload.reviewed_at = now
      break
    case 'approved':
      updatePayload.reviewed_at = now
      updatePayload.status = 'awaiting_payment'
      break
    case 'rejected':
      updatePayload.reviewed_at = now
      break
    case 'awaiting_payment':
      // Used to send payment proof back for resubmission
      break
    case 'paid':
      updatePayload.paid_at = now
      break
    case 'in_production':
      break
    case 'published':
      updatePayload.published_at = now
      updatePayload.published_url = publishedUrl ?? null
      break
  }

  const { data: updated, error } = await supabase
    .from('spotlight_applications')
    .update(updatePayload)
    .eq('id', applicationId)
    .select('business_name, email')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const actualStatus = updatePayload.status as SpotlightStatus
  const email = updated.email as string
  const businessName = updated.business_name as string

  if (email && !silent) {
    try {
      switch (actualStatus) {
        case 'awaiting_payment':
          await sendSpotlightApproved(email, { businessName })
          break
        case 'rejected':
          await sendSpotlightRejected(email, { businessName, notes: editorNotes ?? '' })
          break
        case 'paid':
          await sendSpotlightPaymentConfirmed(email, { businessName })
          break
        case 'published':
          if (publishedUrl) {
            await sendSpotlightPublished(email, { businessName, url: publishedUrl })
          }
          break
      }
    } catch (e) {
      console.error('[spotlight editor-action] Email send failed:', e)
    }
  }

  return NextResponse.json({ ok: true, status: actualStatus })
}

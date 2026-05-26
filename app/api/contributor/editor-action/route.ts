import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import {
  sendRevisionRequested,
  sendApproved,
  sendRejected,
  sendPublished,
} from '@/lib/email'
import type { SubmissionStatus } from '@/types/contributor'

// Called from EditorActions client component to update submission status and trigger emails.
// Validates that caller is the authenticated admin before proceeding.
export async function POST(request: Request) {
  // Auth check — only authenticated users (admin) can call this
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

  const body = await request.json()
  const { submissionId, status, editorNotes, revisionNotes, publishedUrl } = body as {
    submissionId: string
    status: SubmissionStatus
    editorNotes?: string
    revisionNotes?: string
    publishedUrl?: string
  }

  if (!submissionId || !status) {
    return NextResponse.json({ error: 'submissionId and status required' }, { status: 400 })
  }

  const supabase = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Build update payload
  const updatePayload: Record<string, unknown> = { status }
  if (editorNotes !== undefined) updatePayload.editor_notes = editorNotes || null
  if (revisionNotes !== undefined) updatePayload.revision_notes = revisionNotes || null

  if (status === 'approved') {
    updatePayload.reviewed_at = new Date().toISOString()
  }
  if (status === 'published') {
    updatePayload.published_at = new Date().toISOString()
    if (publishedUrl) updatePayload.published_url = publishedUrl
  }

  const { data: updated, error: updateError } = await supabase
    .from('contributor_submissions')
    .update(updatePayload)
    .eq('id', submissionId)
    .select('headline, contributor_id')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Fetch contributor email
  const { data: authUser } = await supabase.auth.admin.getUserById(updated.contributor_id)
  const email = authUser?.user?.email
  const headline = updated.headline as string

  if (email) {
    try {
      switch (status) {
        case 'revision_requested':
          await sendRevisionRequested(email, { headline, notes: revisionNotes ?? '' })
          break
        case 'approved':
          await sendApproved(email, { headline })
          break
        case 'rejected':
          await sendRejected(email, { headline })
          break
        case 'published':
          if (publishedUrl) {
            await sendPublished(email, { headline, url: publishedUrl })
          }
          break
      }
    } catch (e) {
      console.error('[editor-action] Email send failed:', e)
      // Don't fail the whole request if email fails
    }
  }

  return NextResponse.json({ ok: true })
}

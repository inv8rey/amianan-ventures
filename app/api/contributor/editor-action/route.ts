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
// When approving:
//   - If no scheduled_for OR scheduled_for is in the past → auto-publish immediately
//   - If scheduled_for is in the future → stays 'approved', cron will publish at that time
export async function POST(request: Request) {
  // Auth check — only authenticated users (admin) can call this
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amiananventures.org'
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const body = await request.json()
  const { submissionId, status, editorNotes, revisionNotes } = body as {
    submissionId: string
    status: SubmissionStatus
    editorNotes?: string
    revisionNotes?: string
  }

  if (!submissionId || !status) {
    return NextResponse.json({ error: 'submissionId and status required' }, { status: 400 })
  }

  const supabase = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Build update payload
  const updatePayload: Record<string, unknown> = {}
  if (editorNotes !== undefined) updatePayload.editor_notes = editorNotes || null
  if (revisionNotes !== undefined) updatePayload.revision_notes = revisionNotes || null

  const now = new Date().toISOString()
  let actualStatus: SubmissionStatus = status
  let publishedUrl: string | null = null

  if (status === 'approved') {
    // Fetch current submission to check scheduled_for
    const { data: currentSub } = await supabase
      .from('contributor_submissions')
      .select('scheduled_for')
      .eq('id', submissionId)
      .single()

    const scheduledFor = currentSub?.scheduled_for
    const shouldPublishNow = !scheduledFor || new Date(scheduledFor) <= new Date()

    if (shouldPublishNow) {
      // Auto-publish immediately
      actualStatus = 'published'
      publishedUrl = `${siteUrl}/contributions/${submissionId}`
      updatePayload.status = 'published'
      updatePayload.reviewed_at = now
      updatePayload.published_at = now
      updatePayload.published_url = publishedUrl
    } else {
      // Future schedule — keep as approved
      actualStatus = 'approved'
      updatePayload.status = 'approved'
      updatePayload.reviewed_at = now
    }
  } else if (status === 'published') {
    // Direct "Publish Now" from approved+scheduled state
    actualStatus = 'published'
    publishedUrl = `${siteUrl}/contributions/${submissionId}`
    updatePayload.status = 'published'
    updatePayload.published_at = now
    updatePayload.published_url = publishedUrl
  } else {
    updatePayload.status = status
    if (status === 'revision_requested' || status === 'rejected') {
      updatePayload.reviewed_at = now
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('contributor_submissions')
    .update(updatePayload)
    .eq('id', submissionId)
    .select('headline, contributor_id, scheduled_for')
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
      switch (actualStatus) {
        case 'revision_requested':
          await sendRevisionRequested(email, { headline, notes: revisionNotes ?? '' })
          break
        case 'approved':
          // Only scheduled for future — send "approved, will publish on [date]" email
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
    }
  }

  return NextResponse.json({ ok: true, status: actualStatus })
}

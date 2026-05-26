import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  sendSubmissionReceived,
  sendUnderReview,
  sendRevisionRequested,
  sendApproved,
  sendRejected,
  sendPublished,
  sendEditorAlert,
} from '@/lib/email'

// Internal API — called from submission form and editor pages to trigger email notifications.
export async function POST(request: Request) {
  const body = await request.json()
  const { type, submissionId, headline: overrideHeadline, notes, url } = body

  if (!type || !submissionId) {
    return NextResponse.json({ error: 'type and submissionId required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Fetch submission + contributor profile
  const { data: sub } = await supabase
    .from('contributor_submissions')
    .select('headline, contributor_id, content_type')
    .eq('id', submissionId)
    .single()

  if (!sub) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from('contributor_profiles')
    .select('display_name')
    .eq('id', sub.contributor_id)
    .single()

  // Get contributor email via admin auth API
  const { data: authData } = await supabase.auth.admin.getUserById(sub.contributor_id)
  const email = authData?.user?.email
  const headline = overrideHeadline ?? (sub.headline as string)
  const displayName = (profile?.display_name as string | undefined) ?? 'Contributor'

  if (!email) {
    return NextResponse.json({ error: 'Contributor email not found' }, { status: 404 })
  }

  try {
    switch (type) {
      case 'submission_received':
        await sendSubmissionReceived(email, { headline, submissionId })
        await sendEditorAlert({
          contributor: displayName,
          headline,
          submissionId,
          contentType: sub.content_type as string,
        })
        break
      case 'under_review':
        await sendUnderReview(email, { headline })
        break
      case 'revision_requested':
        await sendRevisionRequested(email, { headline, notes: notes ?? '' })
        break
      case 'approved':
        await sendApproved(email, { headline })
        break
      case 'rejected':
        await sendRejected(email, { headline })
        break
      case 'published':
        await sendPublished(email, { headline, url: url ?? '' })
        break
      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[send-email] Error:', error)
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
  }
}

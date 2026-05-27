import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/contributor/delete-submission
 * Called by contributors to delete or withdraw their own submissions.
 *
 * Body:
 *   { submissionId: string, action: 'delete' | 'withdraw' }
 *
 * 'delete'   — permanently removes the row (allowed for: draft, submitted, under_review, revision_requested, rejected)
 * 'withdraw' — sets status back to 'draft' so contributor can edit and resubmit
 *              (allowed for: submitted, under_review)
 */
export async function POST(request: Request) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { submissionId, action = 'delete' } = await request.json() as {
    submissionId: string
    action?: 'delete' | 'withdraw'
  }
  if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 })

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Verify ownership
  const { data: sub } = await supabase
    .from('contributor_submissions')
    .select('contributor_id, status')
    .eq('id', submissionId)
    .single()

  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (sub.contributor_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status } = sub

  if (action === 'withdraw') {
    // Withdraw: move submitted/under_review back to draft
    if (status !== 'submitted' && status !== 'under_review') {
      return NextResponse.json(
        { error: 'Only submitted or under-review submissions can be withdrawn' },
        { status: 400 }
      )
    }
    const { error } = await supabase
      .from('contributor_submissions')
      .update({ status: 'draft' })
      .eq('id', submissionId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'withdrawn' })
  }

  // Delete
  const nonDeletable = ['published', 'approved']
  if (nonDeletable.includes(status)) {
    return NextResponse.json(
      { error: 'Cannot delete a published or approved submission. Contact an editor.' },
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from('contributor_submissions')
    .delete()
    .eq('id', submissionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, action: 'deleted' })
}

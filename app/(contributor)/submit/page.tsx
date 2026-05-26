import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SubmissionForm } from '@/components/contributor/SubmissionForm'
import type { ContributorSubmission } from '@/types/contributor'

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const { edit: editId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  // Fetch existing submission if editing a revision_requested piece
  let editSubmission: ContributorSubmission | undefined
  if (editId) {
    const { data } = await supabase
      .from('contributor_submissions')
      .select('*')
      .eq('id', editId)
      .eq('contributor_id', user.id)
      .eq('status', 'revision_requested')
      .single()
    if (data) editSubmission = data
  }

  const title = editSubmission ? 'Edit Your Submission' : 'New Submission'
  const subtitle = editSubmission
    ? 'Make your revisions and resubmit for editorial review'
    : 'Share your story with the Northern Luzon innovation ecosystem'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
      </div>
      <SubmissionForm contributorId={user.id} editSubmission={editSubmission} />
    </div>
  )
}

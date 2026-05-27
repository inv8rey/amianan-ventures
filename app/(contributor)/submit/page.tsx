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

  // Fetch existing submission for editing — any status the contributor owns
  let editSubmission: ContributorSubmission | undefined
  if (editId) {
    const { data } = await supabase
      .from('contributor_submissions')
      .select('*')
      .eq('id', editId)
      .eq('contributor_id', user.id)
      .single()
    if (data) editSubmission = data as ContributorSubmission
  }

  const status = editSubmission?.status
  const titleMap: Partial<Record<string, string>> = {
    draft:              'Continue Your Draft',
    published:          'Edit Published Article',
    approved:           'Edit Approved Article',
    revision_requested: 'Edit Your Submission',
  }
  const subtitleMap: Partial<Record<string, string>> = {
    draft:              'Finish your draft and submit for editorial review when ready',
    published:          'Changes will be resubmitted for editorial review before going live',
    approved:           'Changes will be resubmitted for editorial review',
    revision_requested: 'Make the requested changes and resubmit',
  }
  const title    = status ? (titleMap[status]    ?? 'Edit Your Submission') : 'New Submission'
  const subtitle = status ? (subtitleMap[status] ?? 'Make your changes and resubmit for editorial review') : 'Share your story with the Northern Luzon innovation ecosystem'

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

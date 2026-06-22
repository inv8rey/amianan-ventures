import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContributorDashboard, type CommunityStoryPreview } from '@/components/contributor/ContributorDashboard'
import type { ContributorSubmission } from '@/types/contributor'
import type { SpotlightApplication } from '@/types/spotlight'

export const dynamic = 'force-dynamic'

function profileIncomplete(profile: { display_name: string; bio: string | null; role: string | null }) {
  return !profile.bio || !profile.role || !profile.display_name
}

async function getRecentCommunityStories(): Promise<CommunityStoryPreview[]> {
  const { createServiceClient } = await import('@/lib/supabase/service')
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('contributor_submissions')
    .select('id, headline, summary, content_type, cover_image_url')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)
  return (data ?? []) as CommunityStoryPreview[]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  const [profileResult, submissionsResult, spotlightResult] = await Promise.all([
    supabase
      .from('contributor_profiles')
      .select('display_name, bio, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('contributor_submissions')
      .select('*')
      .eq('contributor_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('spotlight_applications')
      .select('*')
      .eq('contributor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const profile = profileResult.data
  const submissions = (submissionsResult.data ?? []) as ContributorSubmission[]
  const rawSpotlight = spotlightResult.data as SpotlightApplication | null
  // A cancelled application shouldn't block the dashboard from offering
  // "Apply for a Feature" again — treat it the same as having none.
  const spotlight = rawSpotlight?.status === 'cancelled' ? null : rawSpotlight
  // /spotlight auto-creates an empty draft row the moment a contributor visits
  // it, so a draft alone doesn't mean they've actually applied — only treat
  // it as a real application once they've submitted for real.
  const hasSubmittedSpotlight = !!spotlight && spotlight.status !== 'draft'

  if (!profile) redirect('/contribute/login')

  const firstName = (profile.display_name || 'Contributor').split(' ')[0]

  // Compute analytics (exclude drafts from "total" since they're not submitted)
  const draftCount = submissions.filter((s) => s.status === 'draft').length
  const submittedSubmissions = submissions.filter((s) => s.status !== 'draft')
  const totalCount = submittedSubmissions.length
  const publishedCount = submissions.filter((s) => s.status === 'published').length
  const inReviewCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length
  const revisionCount = submissions.filter((s) => s.status === 'revision_requested').length

  // Only needed for contributors with no stories of their own yet — gives
  // them something to look at instead of an empty "My Stories" section.
  const communityStories = submissions.length === 0 ? await getRecentCommunityStories() : []

  return (
    <ContributorDashboard
      firstName={firstName}
      email={user.email ?? ''}
      profileComplete={!profileIncomplete(profile)}
      draftCount={draftCount}
      spotlight={spotlight}
      hasSubmittedSpotlight={hasSubmittedSpotlight}
      submissions={submissions}
      stats={{ total: totalCount, published: publishedCount, inReview: inReviewCount, revision: revisionCount }}
      communityStories={communityStories}
    />
  )
}

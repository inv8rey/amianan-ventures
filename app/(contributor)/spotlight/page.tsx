import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SpotlightForm } from '@/components/contributor/SpotlightForm'
import { PACKAGES, isPackageId, type SpotlightApplication } from '@/types/spotlight'

export const dynamic = 'force-dynamic'

export default async function SpotlightPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>
}) {
  const { package: requestedPackage } = await searchParams
  const pkg = PACKAGES[isPackageId(requestedPackage) ? requestedPackage : 'founding-rate']

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  let { data: profile } = await supabase
    .from('contributor_profiles')
    .select('display_name, organization')
    .eq('id', user.id)
    .maybeSingle()

  // Profile row missing (e.g. the DB trigger that's supposed to create it
  // on signup never fired) — create it now from auth metadata instead of
  // bouncing the user back to login in a loop.
  if (!profile) {
    const meta = user.user_metadata as { display_name?: string; organization?: string }
    const { data: created } = await supabase
      .from('contributor_profiles')
      .insert({
        id: user.id,
        display_name: meta.display_name || '',
        organization: meta.organization || null,
      })
      .select('display_name, organization')
      .single()
    profile = created
  }

  if (!profile) redirect('/contribute/login')

  let { data: application } = await supabase
    .from('spotlight_applications')
    .select('*')
    .eq('contributor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // No application yet, or their last one was cancelled (e.g. existing
  // contributor visiting /spotlight directly) — start a fresh one.
  if (!application || application.status === 'cancelled') {
    const { data: created } = await supabase
      .from('spotlight_applications')
      .insert({
        contributor_id: user.id,
        business_name: profile.organization || '',
        contact_name: profile.display_name || '',
        email: user.email || '',
        status: 'draft',
        package: pkg.id,
        amount_php: pkg.amount_php,
      })
      .select('*')
      .single()
    application = created
  }

  return <SpotlightForm application={application as SpotlightApplication} />
}

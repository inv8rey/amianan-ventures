import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SpotlightForm } from '@/components/contributor/SpotlightForm'
import type { SpotlightApplication } from '@/types/spotlight'

export default async function SpotlightPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  const { data: profile } = await supabase
    .from('contributor_profiles')
    .select('display_name, organization')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/contribute/login')

  let { data: application } = await supabase
    .from('spotlight_applications')
    .select('*')
    .eq('contributor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // No application yet (e.g. existing contributor visiting /spotlight directly) — start one.
  if (!application) {
    const { data: created } = await supabase
      .from('spotlight_applications')
      .insert({
        contributor_id: user.id,
        business_name: profile.organization || '',
        contact_name: profile.display_name || '',
        email: user.email || '',
        status: 'draft',
      })
      .select('*')
      .single()
    application = created
  }

  return <SpotlightForm application={application as SpotlightApplication} />
}

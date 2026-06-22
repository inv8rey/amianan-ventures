import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeaturePackages } from '@/components/contributor/FeaturePackages'
import type { SpotlightApplication } from '@/types/spotlight'

export const dynamic = 'force-dynamic'

export default async function FeaturePackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  const { data: spotlight } = await supabase
    .from('spotlight_applications')
    .select('*')
    .eq('contributor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return <FeaturePackages spotlight={spotlight as SpotlightApplication | null} />
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApplyWizard } from '@/components/site/ApplyWizard'
import { isPackageId } from '@/types/spotlight'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Apply to Get Featured — Amianan Ventures',
  description: 'Tell us about your business and apply to be featured by Amianan Ventures.',
}

export default async function GetFeaturedApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Already signed in — no need to sign up again, the dashboard is the hub
  // for choosing what to do next.
  if (user) redirect('/dashboard')

  const { package: requestedPackage } = await searchParams
  const packageId = isPackageId(requestedPackage) ? requestedPackage : 'founding-rate'

  return <ApplyWizard packageId={packageId} />
}

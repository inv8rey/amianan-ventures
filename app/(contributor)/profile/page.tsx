import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/contributor/ProfileForm'
import type { ContributorProfile } from '@/types/contributor'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/contribute/login')

  const { data: profile } = await supabase
    .from('contributor_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/contribute/login')

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-zinc-900">Your Profile</h1>
        <p className="text-sm text-zinc-500 mt-1">
          This info will appear on your published articles and contributor page.
        </p>
      </div>
      <ProfileForm profile={profile as ContributorProfile} />
    </div>
  )
}

'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ContributorSignOutButton() {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/contribute/login')
  }

  return (
    <button
      onClick={signOut}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
      title="Sign out"
    >
      <LogOut className="h-3.5 w-3.5" />
    </button>
  )
}

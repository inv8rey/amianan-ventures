import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PenLine, LayoutDashboard, Plus, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ContributorSignOutButton } from '@/components/contributor/ContributorSignOutButton'

export default async function ContributorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/contribute/login')

  // Check for contributor profile — admin users won't have one
  const { data: profile } = await supabase
    .from('contributor_profiles')
    .select('id, display_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // This is likely an admin account — redirect them appropriately
    redirect('/contribute/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <PenLine className="h-3.5 w-3.5 text-[#00cc6a]" />
            </div>
            <span className="text-sm font-bold text-zinc-900 hidden sm:block">Contributor Portal</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:block">My Submissions</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Profile</span>
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:block">New Submission</span>
            </Link>
            <ContributorSignOutButton />
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

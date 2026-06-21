import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, FileText, User, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ContributorUserMenu } from '@/components/contributor/ContributorUserMenu'
import { ContributorNavLink } from '@/components/contributor/ContributorNavLink'

// Every page under this layout is per-user authenticated content — never
// let it be statically cached/served to the wrong visitor.
export const dynamic = 'force-dynamic'

export default async function ContributorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/contribute/login')

  // Check for contributor profile — admin users won't have one
  const { data: profile } = await supabase
    .from('contributor_profiles')
    .select('id, display_name, photo_url')
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/amianan.svg" alt="Amianan Ventures" width={32} height={32} className="object-contain" />
            <div className="leading-none">
              <div className="text-xs font-black tracking-tight text-zinc-900">AMIANAN</div>
              <div className="text-xs font-black tracking-tight text-zinc-900">VENTURES</div>
            </div>
            <div className="hidden sm:block h-7 w-px bg-zinc-200 mx-1" />
            <span className="hidden sm:block text-sm text-zinc-500">Contributor Portal</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <ContributorNavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            <ContributorNavLink href="/dashboard#stories" icon={<FileText className="h-4 w-4" />} label="My Stories" />
            <ContributorNavLink href="/profile" icon={<User className="h-4 w-4" />} label="Profile" />
          </nav>

          {/* New submission + user menu */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/submit"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> New Submission
            </Link>
            <ContributorUserMenu displayName={profile.display_name || 'Contributor'} photoUrl={profile.photo_url} />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ContributorUserMenu({
  displayName,
  photoUrl,
}: {
  displayName: string
  photoUrl: string | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const firstName = displayName.split(' ')[0]

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Hard navigation, not router.push — router.refresh() only clears the
    // client cache for the *current* route. Other already-visited routes
    // (e.g. /spotlight, /dashboard) would otherwise keep serving the
    // previous user's cached RSC payload to whoever signs in next in this
    // tab. A full page load wipes the entire client-side router cache.
    window.location.href = '/contribute/login'
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-zinc-100 transition-colors"
      >
        {photoUrl ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200">
            <Image src={photoUrl} alt={displayName} fill className="object-cover" sizes="32px" unoptimized />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-white">{firstName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <span className="text-sm font-bold text-zinc-900 hidden sm:block">{firstName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg py-1.5 z-50">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <User className="h-3.5 w-3.5 text-zinc-400" /> Profile
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 text-zinc-400" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Renders /public/amianan.svg; falls back to styled "AV" text if file not present
function LogoIcon() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#00cc6a]">
        <span className="text-black font-black text-xs leading-none">AV</span>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/amianan.svg"
      alt="Amianan Ventures"
      width={32}
      height={32}
      className="object-contain"
      onError={() => setErr(true)}
    />
  )
}

const navLinks = [
  { href: '/news', label: 'News' },
  { href: '/founder-stories', label: 'Founder Stories' },
  { href: '/ecosystem', label: 'Ecosystem' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Top bar ── */}
      <div className="bg-[#042212] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <LogoIcon />
              <span className="text-sm font-bold tracking-tight text-white">
                AMIANAN <span className="text-[#00cc6a]">VENTURES</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-xs font-semibold transition-colors rounded tracking-wide',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-[#00cc6a]'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTAs + mobile toggle */}
            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded text-xs font-bold bg-[#00cc6a] text-black hover:bg-[#00b85e] transition-colors uppercase tracking-wider whitespace-nowrap"
              >
                Submit Startup
              </Link>
              <Link
                href="/contact"
                className="hidden lg:inline-flex items-center px-3.5 py-1.5 rounded text-xs font-bold border border-white/30 text-white hover:bg-white/10 hover:border-white/60 transition-colors uppercase tracking-wider whitespace-nowrap"
              >
                Partner With Us
              </Link>
              <button
                className="md:hidden p-1.5 rounded text-white/70 hover:text-white"
                onClick={() => setOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Secondary nav: regions ── */}
      <div className="bg-[#00cc6a] hidden md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {[
              { href: '/news?location=cordillera', label: 'Cordillera' },
              { href: '/news?location=cagayan-valley', label: 'Cagayan Valley' },
              { href: '/news?location=ilocos-region', label: 'Ilocos Region' },
              { href: '/news?location=pangasinan', label: 'Pangasinan' },
            ].map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="px-3 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/10 transition-all whitespace-nowrap"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-[#042212] border-t border-white/10">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2.5 text-sm font-medium rounded transition-colors',
                  pathname === link.href
                    ? 'text-[#00cc6a]'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded text-xs font-bold bg-[#00cc6a] text-black hover:bg-[#00b85e] transition-colors uppercase tracking-wider text-center"
              >
                Submit Startup
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded text-xs font-bold border border-white/30 text-white hover:bg-white/10 transition-colors uppercase tracking-wider text-center"
              >
                Partner With Us
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

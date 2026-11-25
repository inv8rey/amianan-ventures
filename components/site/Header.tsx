'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAIN_SITE_URL } from '@/lib/site'

const navLinks = [
  { href: '/news', label: 'News' },
  { href: '/founder-stories', label: 'Founder Stories' },
  { href: '/ecosystem', label: 'Ecosystem' },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Top bar ── */}
      <div className="bg-[#131314] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <a href={MAIN_SITE_URL} aria-label="Amianan Ventures main site">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/amianan-logo-light.svg" alt="Amianan Ventures" width={97} height={36} className="h-9 w-auto" />
              </a>
              <Link
                href="/"
                aria-label="Amianan Ventures News home"
                className="rounded-full bg-[#befc65] px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#131314] hover:bg-[#d0ff8a] transition-colors"
              >
                News
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-xs font-semibold transition-colors rounded tracking-wide whitespace-nowrap',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-[#befc65]'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={MAIN_SITE_URL}
                className="px-3 py-2 text-xs font-semibold transition-colors rounded tracking-wide whitespace-nowrap text-white/70 hover:text-white"
              >
                Work With Us
              </a>
            </nav>

            {/* CTAs + mobile toggle */}
            <div className="flex items-center gap-2">
              <Link
                href="/contribute"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-[#befc65] text-black hover:bg-[#d0ff8a] transition-colors uppercase tracking-wider whitespace-nowrap"
              >
                Become a Contributor
              </Link>
              <Link
                href="#newsletter"
                className="hidden lg:inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border border-white/30 text-white hover:bg-white/10 hover:border-white/60 transition-colors uppercase tracking-wider whitespace-nowrap"
              >
                Subscribe
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
      <div className="bg-[#befc65] hidden md:block">
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
        <div className="md:hidden bg-[#131314] border-t border-white/10">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2.5 text-sm font-medium rounded transition-colors',
                  pathname === link.href
                    ? 'text-[#befc65]'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={MAIN_SITE_URL}
              className="px-3 py-2.5 text-sm font-medium rounded transition-colors text-white/70 hover:text-white"
            >
              Work With Us
            </a>
            <div className="mt-2 flex gap-2">
              <Link
                href="/contribute"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded text-xs font-bold bg-[#befc65] text-black hover:bg-[#d0ff8a] transition-colors uppercase tracking-wider text-center"
              >
                Become a Contributor
              </Link>
              <Link
                href="#newsletter"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded text-xs font-bold border border-white/30 text-white hover:bg-white/10 transition-colors uppercase tracking-wider text-center"
              >
                Subscribe
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, GraduationCap, Rocket, Search, Sprout, Store } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAIN_SITE_URL } from '@/lib/site'

// Same primary navigation as amiananventures.org. "Insights" is this site.
const MAIN = MAIN_SITE_URL
const SERVICES: { href: string; title: string; sub: string; Icon: LucideIcon }[] = [
  { href: `${MAIN}/#svc-startups`, title: 'For Startups', sub: 'Product strategy, design, and your first working version.', Icon: Rocket },
  { href: `${MAIN}/#svc-research`, title: 'For Students & Researchers', sub: 'Capstone, thesis, and research projects turned into real tools.', Icon: GraduationCap },
  { href: `${MAIN}/#svc-msme`, title: 'For MSMEs & Businesses', sub: 'Practical digital tools that improve how you operate.', Icon: Store },
  { href: `${MAIN}/#svc-tbi`, title: 'For Incubators (TBIs)', sub: 'Product development support for your incubatees.', Icon: Sprout },
]

// Sections of the news site, shown in a slim bar under the main header.
const SECTIONS = [
  { href: '/', label: 'Latest' },
  { href: '/news', label: 'News' },
  { href: '/founder-stories', label: 'Founder Stories' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/ecosystem-pulse', label: 'Ecosystem Insights' },
]

const navLink =
  "relative opacity-[.86] transition-opacity hover:opacity-100 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-400 hover:after:origin-left hover:after:scale-x-100"

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false) // opened by click / keyboard
  const [dropHover, setDropHover] = useState(false) // opened by mouse hover
  const servicesOpen = dropOpen || dropHover
  const [hidden, setHidden] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const lastY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const [menuTop, setMenuTop] = useState(104)

  const sectionActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'))

  // Slide the header away while scrolling down, bring it back on scroll up (as on the main site).
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > window.innerHeight * 0.9 && y > lastY.current)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the Services menu on outside click or Escape.
  useEffect(() => {
    if (!dropOpen) return
    const onDown = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setDropOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDropOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [dropOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full transition-transform duration-500 ease-out',
          hidden && !menuOpen && '-translate-y-full'
        )}
      >
        {/* ── Main bar: identical to amiananventures.org ── */}
        <div
          className={cn(
            'relative h-[72px] border-b transition-colors',
            menuOpen ? 'border-transparent bg-[#131314] text-white' : 'border-white/10 bg-[#131314] text-white'
          )}
        >
          <div className="mx-auto flex h-full max-w-[1360px] items-center justify-between gap-6 px-[clamp(16px,4vw,48px)]">
            <a href={`${MAIN}/`} className="inline-flex items-center" aria-label="Amianan Ventures home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/amianan-logo-light.svg"
                alt="Amianan Ventures"
                width={600}
                height={223}
                className="block h-[54px] w-auto"
              />
            </a>

            <nav aria-label="Primary" className="hidden items-center gap-8 text-[17px] font-normal min-[1081px]:flex">
              <a href={`${MAIN}/`} className={navLink}>Home</a>
              <a href={`${MAIN}/about/`} className={navLink}>About</a>

              <div
                ref={dropRef}
                className="group/drop relative flex items-center gap-0.5"
                onMouseEnter={() => window.matchMedia('(hover: hover) and (pointer: fine)').matches && setDropHover(true)}
                onMouseLeave={() => setDropHover(false)}
              >
                <a href={`${MAIN}/#services`} className={navLink}>Services</a>
                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  aria-controls="servicesMenu"
                  aria-label="Show services"
                  onClick={() => setDropOpen((v) => !v)}
                  className={cn('grid h-6 w-6 place-items-center rounded-full opacity-[.86] transition-transform duration-300 hover:opacity-100', servicesOpen && 'rotate-180 opacity-100')}
                >
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
                </button>
                <div
                  id="servicesMenu"
                  role="menu"
                  aria-label="Services"
                  className={cn(
                    'absolute left-1/2 top-[calc(100%+14px)] grid w-[400px] gap-0.5 rounded-2xl border border-[#e0dfdf] bg-white p-2 text-[#131314] shadow-[0_24px_48px_-16px_rgba(19,19,20,.28)] transition-all duration-300',
                    'before:absolute before:inset-x-0 before:-top-4 before:h-4 before:content-[""]',
                    servicesOpen ? 'visible -translate-x-1/2 translate-y-0 opacity-100' : 'invisible -translate-x-1/2 -translate-y-1.5 opacity-0'
                  )}
                >
                  {SERVICES.map(({ href, title, sub, Icon }) => (
                    <a
                      key={href}
                      href={href}
                      role="menuitem"
                      className="group/item grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[#f3f3f4] focus-visible:bg-[#f3f3f4]"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#f3f3f4] transition-colors group-hover/item:bg-[#befc65]">
                        <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                      </span>
                      <span className="grid gap-0.5">
                        <strong className="text-[15px] font-medium tracking-[-0.01em]">{title}</strong>
                        <small className="text-[13px] leading-[1.4] text-[#66646d]">{sub}</small>
                      </span>
                    </a>
                  ))}
                  <a
                    href={`${MAIN}/#work`}
                    role="menuitem"
                    className="mt-1 flex items-center justify-between rounded-b-xl border-t border-[#e0dfdf] p-3 text-sm font-medium hover:bg-[#f3f3f4]"
                  >
                    See selected work <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </div>

              <Link href="/" aria-current="page" className={cn(navLink, 'opacity-100')}>Insights</Link>
              <a href={`${MAIN}/resources/`} className={navLink}>Resources</a>
              <a href={`${MAIN}/contact/`} className={navLink}>Contact</a>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href={`${MAIN}/contact/`}
                className="hidden h-11 items-center justify-center whitespace-nowrap rounded-lg bg-[#befc65] px-4 text-base font-medium text-[#131314] transition-colors hover:bg-[#9fdc45] min-[1081px]:inline-flex"
              >
                Start Your Project
              </a>
              <button
                type="button"
                onClick={() => {
                  // Start the menu list below the header, wherever it sits (the promo bar can push it down).
                  setMenuTop(Math.round((headerRef.current?.getBoundingClientRect().top ?? 0) + 72 + 32))
                  setMenuOpen((v) => !v)
                }}
                aria-expanded={menuOpen}
                aria-controls="mobileMenu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="relative block h-11 w-11 rounded-lg min-[1081px]:hidden"
              >
                <span className={cn('absolute left-3 right-3 top-[18px] h-[1.5px] bg-current transition-transform duration-300', menuOpen && 'translate-y-[3.5px] rotate-45')} />
                <span className={cn('absolute left-3 right-3 top-[25px] h-[1.5px] bg-current transition-transform duration-300', menuOpen && '-translate-y-[3.5px] -rotate-45')} />
              </button>
            </div>
          </div>
        </div>

        {/* ── News sections ── */}
        {!menuOpen && (
          <div className="border-b border-white/10 bg-[#131314] text-white">
            <div className="mx-auto flex h-11 max-w-[1360px] items-center justify-between gap-4 px-[clamp(16px,4vw,48px)]">
              <nav aria-label="News sections" className="-mx-1 flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
                <span className="mr-2 hidden shrink-0 rounded-full bg-[#befc65] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#131314] sm:inline">
                  Insights
                </span>
                {SECTIONS.map((s) => {
                  const active = sectionActive(s.href)
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative shrink-0 whitespace-nowrap px-2.5 py-2.5 text-[13px] font-medium transition-colors',
                        active ? 'text-white' : 'text-white/60 hover:text-white'
                      )}
                    >
                      {s.label}
                      {active && <span className="absolute inset-x-2.5 bottom-0 h-[3px] rounded-full bg-[#befc65]" aria-hidden />}
                    </Link>
                  )
                })}
              </nav>
              <div className="flex shrink-0 items-center gap-1">
                <Link href="/news#search" aria-label="Search stories" className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                  <Search className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-[#befc65] hover:bg-white/10 sm:inline-flex">
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Mobile menu: same items as the main site ── */}
      {menuOpen && (
        <div
          id="mobileMenu"
          className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-[#131314] px-[clamp(16px,4vw,48px)] pb-8 text-white min-[1081px]:hidden"
          style={{ paddingTop: menuTop }}
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {[
              { href: `${MAIN}/`, label: 'Home' },
              { href: `${MAIN}/about/`, label: 'About' },
              { href: `${MAIN}/#services`, label: 'Services' },
            ].map((l) => (
              <a key={l.label} href={l.href} className="border-b border-white/10 py-3.5 text-[28px] font-medium tracking-[-0.02em]">
                {l.label}
              </a>
            ))}
            <div className="grid gap-0.5 border-b border-white/10 py-2 pl-0.5 pb-3.5">
              {SERVICES.map((s) => (
                <a key={s.href} href={s.href} className="py-1.5 text-[17px] opacity-70 hover:opacity-100">{s.title}</a>
              ))}
            </div>
            <Link href="/" onClick={() => setMenuOpen(false)} className="border-b border-white/10 py-3.5 text-[28px] font-medium tracking-[-0.02em] text-[#befc65]">
              Insights
            </Link>
            <div className="grid gap-0.5 border-b border-white/10 py-2 pl-0.5 pb-3.5">
              {SECTIONS.slice(1).map((s) => (
                <Link key={s.href} href={s.href} onClick={() => setMenuOpen(false)} className="py-1.5 text-[17px] opacity-70 hover:opacity-100">
                  {s.label}
                </Link>
              ))}
            </div>
            {[
              { href: `${MAIN}/resources/`, label: 'Resources' },
              { href: `${MAIN}/contact/`, label: 'Contact' },
            ].map((l) => (
              <a key={l.label} href={l.href} className="border-b border-white/10 py-3.5 text-[28px] font-medium tracking-[-0.02em]">
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href={`${MAIN}/contact/`}
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#befc65] px-6 text-lg font-medium text-[#131314]"
          >
            Start Your Project
          </a>
        </div>
      )}
    </>
  )
}

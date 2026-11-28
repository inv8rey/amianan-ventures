'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarCheck, ChevronDown, GraduationCap, LineChart, Newspaper, Rocket, Search, Sprout, Store, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAIN_SITE_URL } from '@/lib/site'

// Same primary navigation as amiananventures.org. "Insights" is this site.
const MAIN = MAIN_SITE_URL
const SERVICES: MenuItem[] = [
  { href: `${MAIN}/#svc-startups`, title: 'For Startups', sub: 'Product strategy, design, and your first working version.', Icon: Rocket },
  { href: `${MAIN}/#svc-research`, title: 'For Students & Researchers', sub: 'Capstone, thesis, and research projects turned into real tools.', Icon: GraduationCap },
  { href: `${MAIN}/#svc-msme`, title: 'For MSMEs & Businesses', sub: 'Practical digital tools that improve how you operate.', Icon: Store },
  { href: `${MAIN}/#svc-tbi`, title: 'For Incubators (TBIs)', sub: 'Product development support for your incubatees.', Icon: Sprout },
]

type MenuItem = { href: string; title: string; sub: string; Icon: LucideIcon; internal?: boolean }

const INSIGHTS: MenuItem[] = [
  { href: '/news', title: 'News', sub: 'Startup and innovation news from the region and beyond.', Icon: Newspaper, internal: true },
  { href: '/founder-stories', title: 'Founder Stories', sub: 'Real journeys of people building ventures.', Icon: UserRound, internal: true },
  { href: '/opportunities', title: 'Opportunities', sub: 'Grants, programs, and events, sorted by deadline.', Icon: CalendarCheck, internal: true },
  { href: '/ecosystem-pulse', title: 'Ecosystem Insights', sub: 'Research and data on how ventures grow.', Icon: LineChart, internal: true },
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
  const [hidden, setHidden] = useState(false)
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

              <NavDrop
                id="servicesMenu"
                label="Services"
                href={`${MAIN}/#services`}
                items={SERVICES}
                foot={{ href: `${MAIN}/#work`, label: 'See selected work' }}
              />
              <NavDrop
                id="insightsMenu"
                label="Insights"
                href="/"
                current
                items={INSIGHTS}
                foot={{ href: '/', label: 'See the latest stories', internal: true }}
              />
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

/** Desktop dropdown, same look and behaviour as amiananventures.org: hover, click, or keyboard. */
function NavDrop({
  id,
  label,
  href,
  items,
  foot,
  current = false,
}: {
  id: string
  label: string
  href: string
  items: MenuItem[]
  foot: { href: string; label: string; internal?: boolean }
  current?: boolean
}) {
  const [clicked, setClicked] = useState(false)
  const [hovered, setHovered] = useState(false)
  const open = clicked || hovered
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!clicked) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setClicked(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setClicked(false); setHovered(false) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [clicked])

  const close = () => { setClicked(false); setHovered(false) }
  const itemClass =
    'group/item grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[#f3f3f4] focus-visible:bg-[#f3f3f4]'
  const footClass =
    'mt-1 flex items-center justify-between rounded-b-xl border-t border-[#e0dfdf] p-3 text-sm font-medium hover:bg-[#f3f3f4]'

  return (
    <div
      ref={ref}
      className="relative flex items-center gap-0.5"
      onMouseEnter={() => window.matchMedia('(hover: hover) and (pointer: fine)').matches && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) close() }}
    >
      {href.startsWith('/') ? (
        <Link href={href} aria-current={current ? 'page' : undefined} className={cn(navLink, current && 'opacity-100')}>{label}</Link>
      ) : (
        <a href={href} className={navLink}>{label}</a>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Show ${label.toLowerCase()}`}
        onClick={() => setClicked((v) => !v)}
        className={cn('grid h-6 w-6 place-items-center rounded-full opacity-[.86] transition-transform duration-300 hover:opacity-100', open && 'rotate-180 opacity-100')}
      >
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
      <div
        id={id}
        role="menu"
        aria-label={label}
        className={cn(
          'absolute left-1/2 top-[calc(100%+14px)] grid w-[400px] gap-0.5 rounded-2xl border border-[#e0dfdf] bg-white p-2 text-[#131314] shadow-[0_24px_48px_-16px_rgba(19,19,20,.28)] transition-all duration-300',
          'before:absolute before:inset-x-0 before:-top-4 before:h-4 before:content-[""]',
          open ? 'visible -translate-x-1/2 translate-y-0 opacity-100' : 'invisible -translate-x-1/2 -translate-y-1.5 opacity-0'
        )}
      >
        {items.map(({ href: to, title, sub, Icon, internal }) => {
          const inner = (
            <>
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#f3f3f4] transition-colors group-hover/item:bg-[#befc65]">
                <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
              </span>
              <span className="grid gap-0.5">
                <strong className="text-[15px] font-medium tracking-[-0.01em]">{title}</strong>
                <small className="text-[13px] leading-[1.4] text-[#66646d]">{sub}</small>
              </span>
            </>
          )
          return internal ? (
            <Link key={to} href={to} role="menuitem" onClick={close} className={itemClass}>{inner}</Link>
          ) : (
            <a key={to} href={to} role="menuitem" className={itemClass}>{inner}</a>
          )
        })}
        {foot.internal ? (
          <Link href={foot.href} role="menuitem" onClick={close} className={footClass}>
            {foot.label} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <a href={foot.href} role="menuitem" className={footClass}>
            {foot.label} <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </div>
  )
}

import type React from 'react'
import Link from 'next/link'
import { Mail, PenLine, ShieldCheck, ArrowRight, Compass, Users, BookOpen, Heart, MapPin } from 'lucide-react'
import { NewsletterSignup } from './NewsletterSignup'
import { FacebookIcon } from './SocialIcons'
import { MAIN_SITE_URL } from '@/lib/site'

const EXPLORE_LINKS = [
  { href: '/news', label: 'News & Updates' },
  { href: '/founder-stories', label: 'Founder Stories' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/events', label: 'Events' },
]

const PARTICIPATE_LINKS = [
  { href: '/get-featured', label: 'Get Featured' },
  { href: '/share-your-story', label: 'Submit a Story' },
  { href: '/partner', label: 'Partner With Us' },
]

const RESOURCE_LINKS = [
  { href: '/ecosystem-pulse', label: 'Ecosystem Insights' },
  { href: '/contact', label: 'Contact Us' },
  { href: MAIN_SITE_URL, label: 'Work With Us' },
]

const FOLLOW_LINKS = [
  { href: 'https://www.facebook.com/amiananventures', label: 'Facebook', icon: FacebookIcon, external: true },
  { href: 'mailto:amiananventures@gmail.com', label: 'Email Us', icon: Mail, external: true },
]

function LinkColumn({
  icon: Icon,
  title,
  links,
}: {
  icon: React.ElementType
  title: string
  links: { href: string; label: string; external?: boolean }[]
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-[#befc65]" />
        <h4 className="text-[10px] font-semibold text-white uppercase tracking-widest">{title}</h4>
      </div>
      <ul className="space-y-2.5">
        {links.map((link) => {
          const className = 'flex items-center gap-1 text-sm text-zinc-400 hover:text-[#befc65] transition-colors group'
          const chevron = (
            <span className="text-[#befc65] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all">›</span>
          )
          return (
            <li key={link.href}>
              {link.external ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {chevron}
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className={className}>
                  {chevron}
                  {link.label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#131314] text-white mt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">

        {/* Top CTA card — newsletter + share your story */}
        <div id="newsletter" className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-10 mb-14 scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:divide-x md:divide-white/10">
            {/* Newsletter */}
            <div className="md:pr-10">
              <div className="w-12 h-12 rounded-full bg-[#befc65]/10 flex items-center justify-center mb-5">
                <Mail className="h-5 w-5 text-[#befc65]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#befc65] mb-2">Stay in the Loop</p>
              <h3 className="text-2xl font-semibold text-white leading-tight mb-3 max-w-sm">
                Stories, opportunities, and updates, rooted in Northern Luzon.
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-sm">
                Subscribe to our newsletter and never miss what&apos;s happening in the innovation ecosystem.
              </p>
              <NewsletterSignup source="footer" />
              <p className="flex items-center gap-1.5 text-xs text-zinc-500 mt-3">
                <ShieldCheck className="h-3.5 w-3.5 text-[#befc65]" /> No spam. Unsubscribe anytime.
              </p>
            </div>

            {/* Share your story */}
            <div className="md:pl-10">
              <div className="w-12 h-12 rounded-full bg-[#befc65]/10 flex items-center justify-center mb-5">
                <PenLine className="h-5 w-5 text-[#befc65]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#befc65] mb-2">Share Your Story</p>
              <h3 className="text-2xl font-semibold text-white leading-tight mb-3 max-w-sm">
                Help inspire and inform the ecosystem.
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-sm">
                Your story can spark ideas, build connections, and drive meaningful change.
              </p>
              <Link
                href="/share-your-story"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-5 py-2.5 rounded font-bold text-sm uppercase tracking-wide hover:bg-white/5 transition-colors"
              >
                Submit Your Story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-12">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex flex-col gap-2 mb-5" aria-label="Amianan Ventures News home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/amianan-logo-light.svg" alt="Amianan Ventures" width={129} height={48} className="h-12 w-auto" />
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
                News · Rooted in the North
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mb-5">
              Stories, opportunities, and insights for founders and ecosystem builders. Rooted in Northern Luzon, open to builders everywhere.
            </p>
            <div className="flex items-center gap-2.5">
              {FOLLOW_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  aria-label={link.label}
                  className="w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-zinc-400 hover:text-[#befc65] hover:border-[#befc65]/40 transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn icon={Compass} title="Explore" links={EXPLORE_LINKS} />
          <LinkColumn icon={Users} title="Participate" links={PARTICIPATE_LINKS} />
          <LinkColumn icon={BookOpen} title="Resources" links={RESOURCE_LINKS} />
          <LinkColumn icon={Heart} title="Follow" links={FOLLOW_LINKS} />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-xs text-zinc-500 text-center sm:text-left">
            <MapPin className="h-3.5 w-3.5 text-[#befc65] shrink-0" />
            Rooted in Northern Luzon. Working beyond it.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Amianan Ventures. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

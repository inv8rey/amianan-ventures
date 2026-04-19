import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#042212] text-white mt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-16">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#00cc6a]">
                <span className="text-black font-black text-sm leading-none">AV</span>
              </div>
              <div>
                <div className="text-sm font-black tracking-tight text-white leading-none">
                  AMIANAN <span className="text-[#00cc6a]">VENTURES</span>
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  Northern Luzon · Est. 2025
                </div>
              </div>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              An innovation platform connecting startups, founders, universities, and ecosystem partners across Northern Luzon. Open, mapped, community-updated.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[10px] font-black mb-4 text-white uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/news', label: 'News & Stories' },
                { href: '/founder-stories', label: 'Founder Stories' },
                { href: '/events', label: 'Events' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-400 hover:text-[#00cc6a] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <div>
            <h4 className="text-[10px] font-black mb-4 text-white uppercase tracking-widest">Submit</h4>
            <ul className="space-y-2.5">
              {[
                { href: 'https://airtable.com/appYUrRsmwImGgG3C/pagsOvlAtunXtZ5Og/form', label: 'List a startup' },
                { href: 'https://airtable.com/appYUrRsmwImGgG3C/pagjZcduZUZQd759K/form', label: 'Share your story' },
                { href: 'https://airtable.com/appYUrRsmwImGgG3C/pagGIjuSJK91I4fV0/form', label: 'For founder story' },
                { href: `mailto:amiananventures@gmail.com`, label: 'Partner with us' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-[#00cc6a] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4 className="text-[10px] font-black mb-4 text-white uppercase tracking-widest">Follow</h4>
            <ul className="space-y-2.5">
              {[
                { href: 'https://www.facebook.com/amiananventures', label: 'Facebook' },
                { href: `mailto:amiananventures@gmail.com`, label: 'Email us' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-[#00cc6a] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Amianan Innovation Ventures · All rights reserved
          </p>
          <div className="flex items-center gap-4">
            <Link href="/news?location=cordillera" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Cordillera</Link>
            <Link href="/news?location=cagayan-valley" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Cagayan Valley</Link>
            <Link href="/news?location=ilocos-region" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Ilocos Region</Link>
            <Link href="/news?location=pangasinan" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Pangasinan</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

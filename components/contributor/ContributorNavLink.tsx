'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ContributorNavLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: ReactNode
  label: string
}) {
  const pathname = usePathname()
  const basePath = href.split('#')[0]
  const active = pathname === basePath

  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 pb-1 text-sm font-semibold border-b-2 transition-colors ${
        active
          ? 'text-zinc-900 border-[#00cc6a]'
          : 'text-zinc-500 border-transparent hover:text-zinc-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

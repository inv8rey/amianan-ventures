'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

export function ContributorNavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
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
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

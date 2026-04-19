'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { DirectoryEntry, DirectoryType } from '@/types'

const TABS: { type: DirectoryType; label: string }[] = [
  { type: 'startup', label: 'Startups' },
  { type: 'incubator', label: 'Incubators & TBIs' },
  { type: 'government', label: 'Government' },
  { type: 'university', label: 'Universities & HEIs' },
  { type: 'community', label: 'Communities' },
]

function LogoCard({ entry }: { entry: DirectoryEntry }) {
  const initial = entry.name.charAt(0).toUpperCase()
  const card = (
    <div className="group flex flex-col gap-3 p-4 border border-zinc-200 rounded-lg bg-white hover:border-black hover:shadow-sm transition-all h-full">
      {/* Logo or initial */}
      <div className="relative w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
        {entry.logo_url ? (
          <Image src={entry.logo_url} alt={entry.name} fill className="object-contain p-1" sizes="48px" />
        ) : (
          <span className="text-xl font-black text-zinc-400">{initial}</span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        {entry.sector && (
          <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-[#00a855] mb-1">
            {entry.sector}
          </span>
        )}
        <h4 className="text-xs font-bold text-zinc-900 group-hover:text-black leading-snug line-clamp-2">
          {entry.name}
        </h4>
        {entry.city && (
          <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-0.5">
            <span className="w-1 h-1 rounded-full bg-[#00cc6a] inline-block shrink-0" />
            {entry.city}
          </p>
        )}
      </div>
    </div>
  )

  return entry.website ? (
    <a href={entry.website} target="_blank" rel="noopener noreferrer" className="h-full block">{card}</a>
  ) : (
    <div className="h-full">{card}</div>
  )
}

interface Props {
  entriesByType: Record<DirectoryType, DirectoryEntry[]>
  counts: Record<DirectoryType, number>
  showViewAll?: boolean
}

export function EcosystemSection({ entriesByType, counts, showViewAll = false }: Props) {
  const [active, setActive] = useState<DirectoryType>('startup')
  const shown = entriesByType[active] ?? []
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <section className="mt-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00a855] mb-1">Open Directory</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">
            Discover the <span className="text-[#00cc6a]">Northern Luzon</span> ecosystem
          </h2>
          <p className="text-sm text-zinc-500 mt-1 leading-relaxed max-w-xl">
            An open directory of startups, programs, and organizations across Northern Luzon. Updated by the community.
          </p>
        </div>
        {totalCount > 0 && (
          <span className="shrink-0 text-xs text-zinc-400 font-medium">{totalCount} organizations listed</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-5 border-b border-zinc-200">
        {TABS.map((tab) => {
          const count = counts[tab.type] ?? 0
          const isActive = active === tab.type
          return (
            <button
              key={tab.type}
              onClick={() => setActive(tab.type)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#00cc6a] text-black' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Logo grid — max 4 per row, uniform height */}
      {shown.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
          {shown.map((entry) => (
            <LogoCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border border-dashed border-zinc-200 rounded-lg">
          <p className="text-sm text-zinc-400">
            No listings yet.{' '}
            <Link href="/contact" className="text-[#00a855] font-semibold hover:underline">
              Submit the first one →
            </Link>
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-t border-zinc-200">
        <p className="text-xs text-zinc-500">
          Know a startup or program we should list?{' '}
          <span className="font-semibold text-zinc-700">Help build the most complete Northern Luzon directory.</span>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {showViewAll && (
            <Link
              href="/ecosystem"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00a855] hover:text-[#00cc6a] transition-colors"
            >
              View full directory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-black border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition-colors uppercase tracking-wider"
          >
            Submit a listing <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

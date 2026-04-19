'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ExternalLink, Search, X } from 'lucide-react'
import type { DirectoryEntry, DirectoryType, DirectoryLocation } from '@/types'
import { DIRECTORY_LOCATIONS } from '@/types'

const TABS: { type: DirectoryType; label: string }[] = [
  { type: 'startup', label: 'Startups' },
  { type: 'incubator', label: 'Incubators & TBIs' },
  { type: 'government', label: 'Government Agencies' },
  { type: 'university', label: 'Universities & HEIs' },
  { type: 'community', label: 'Communities' },
]

const TYPE_LABELS: Record<DirectoryType, string> = {
  startup: 'Startup',
  incubator: 'Incubator / TBI',
  government: 'Government Agency',
  university: 'University / HEI',
  community: 'Community',
}

function DirectoryCard({ entry }: { entry: DirectoryEntry }) {
  const initial = entry.name.charAt(0).toUpperCase()
  const inner = (
    <div className="group flex gap-4 p-4 rounded-lg border border-zinc-200 hover:border-black hover:shadow-sm transition-all bg-white h-full">
      <div className="relative shrink-0 w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center">
        {entry.logo_url ? (
          <Image src={entry.logo_url} alt={entry.name} fill className="object-contain p-1" sizes="48px" />
        ) : (
          <span className="text-xl font-black text-zinc-400">{initial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#00a855]">
            {TYPE_LABELS[entry.type]}
          </span>
          {entry.sector && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">{entry.sector}</span>
            </>
          )}
        </div>
        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-black leading-snug">{entry.name}</h3>
        {entry.city && (
          <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#00cc6a] inline-block shrink-0" />
            {entry.city}
          </p>
        )}
      </div>
      {entry.website && (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-300 group-hover:text-zinc-600 transition-colors mt-0.5" />
      )}
    </div>
  )

  return entry.website ? (
    <a href={entry.website} target="_blank" rel="noopener noreferrer" className="h-full block">{inner}</a>
  ) : (
    <div className="h-full">{inner}</div>
  )
}

interface Props {
  entriesByType: Record<DirectoryType, DirectoryEntry[]>
  counts: Record<DirectoryType, number>
}

export function EcosystemDirectory({ entriesByType, counts }: Props) {
  const [active, setActive] = useState<DirectoryType>('startup')
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<DirectoryLocation | null>(null)

  const base = entriesByType[active] ?? []

  const filtered = useMemo(() => {
    let result = base

    // Location filter
    if (location) {
      result = result.filter((e) => e.location === location)
    }

    // Search filter
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.sector?.toLowerCase().includes(q) ?? false) ||
          (e.city?.toLowerCase().includes(q) ?? false)
      )
    }

    return result
  }, [base, location, query])

  const hasFilters = !!location || query.trim().length > 0

  function clearFilters() {
    setQuery('')
    setLocation(null)
  }

  return (
    <div>
      {/* Category tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6 border-b-2 border-zinc-900">
        {TABS.map((tab) => {
          const count = counts[tab.type] ?? 0
          const isActive = active === tab.type
          return (
            <button
              key={tab.type}
              onClick={() => setActive(tab.type)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors whitespace-nowrap border-b-2 -mb-[2px] ${
                isActive
                  ? 'border-black text-black'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search + Location filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, sector, or city…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-black transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Location pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setLocation(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              location === null
                ? 'bg-black text-white'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            All
          </button>
          {DIRECTORY_LOCATIONS.filter((l) => l.value !== 'national').map((loc) => (
            <button
              key={loc.value}
              onClick={() => setLocation(location === loc.value ? null : loc.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                location === loc.value
                  ? 'bg-[#00cc6a] text-black'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {loc.label}
            </button>
          ))}
          <button
            onClick={() => setLocation(location === 'national' ? null : 'national')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              location === 'national'
                ? 'bg-[#00cc6a] text-black'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            National
          </button>
        </div>
      </div>

      {/* Results count + clear */}
      {hasFilters && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-zinc-500">
            <span className="font-bold text-zinc-900">{filtered.length}</span>{' '}
            result{filtered.length !== 1 ? 's' : ''}
            {location && (
              <> in <span className="font-semibold text-zinc-700">{DIRECTORY_LOCATIONS.find((l) => l.value === location)?.label}</span></>
            )}
            {query && (
              <> for <span className="font-semibold text-zinc-700">&ldquo;{query}&rdquo;</span></>
            )}
          </p>
          <button
            onClick={clearFilters}
            className="text-xs text-zinc-400 hover:text-zinc-700 underline transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {filtered.map((entry) => (
            <DirectoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-zinc-200 rounded-xl">
          {hasFilters ? (
            <>
              <p className="text-base font-semibold text-zinc-400">No results found.</p>
              <button
                onClick={clearFilters}
                className="text-sm text-[#00a855] font-semibold hover:underline mt-1"
              >
                Clear filters →
              </button>
            </>
          ) : (
            <p className="text-base font-semibold text-zinc-400">No listings in this category yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, Search, SlidersHorizontal, Star, ExternalLink, MapPin,
  Rocket, GraduationCap, Building, Landmark, UsersRound, LayoutGrid,
  ChevronRight, BadgeCheck, X,
} from 'lucide-react'
import type { DirectoryEntry, DirectoryType } from '@/types'
import { DIRECTORY_LOCATIONS } from '@/types'

const TABS: { type: DirectoryType; label: string }[] = [
  { type: 'startup',    label: 'Startups' },
  { type: 'university', label: 'Universities & HEIs' },
  { type: 'incubator',  label: 'Programs & TBIs' },
  { type: 'government', label: 'Government' },
  { type: 'community',  label: 'Communities' },
]

const STAT_CARDS: { type: DirectoryType; label: string; sub: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'startup',    label: 'Startups',             sub: 'Active builders',           Icon: Rocket },
  { type: 'university', label: 'Universities & HEIs',  sub: 'Knowledge institutions',     Icon: GraduationCap },
  { type: 'incubator',  label: 'Programs & TBIs',      sub: 'Incubators & accelerators',  Icon: Building },
  { type: 'government', label: 'Government Agencies', sub: 'Public sector partners',     Icon: Landmark },
  { type: 'community',  label: 'Communities',          sub: 'Groups & networks',          Icon: UsersRound },
]

const TYPE_LABEL: Record<DirectoryType, string> = {
  startup: 'Startup',
  incubator: 'Program / TBI',
  government: 'Government',
  university: 'University',
  community: 'Community',
}

type SortKey = 'recent' | 'featured' | 'az'

function isNew(createdAt: string) {
  return (Date.now() - new Date(createdAt).getTime()) / 86400000 <= 14
}

function badgeFor(entry: DirectoryEntry): { label: string; className: string } | null {
  if (entry.featured) return { label: 'Featured', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  if (isNew(entry.created_at)) return { label: 'New', className: 'bg-[#00a855]/10 text-[#00a855] border-[#00a855]/20' }
  return null
}

interface Props {
  entries: DirectoryEntry[]
}

export function EcosystemSection({ entries }: Props) {
  const [active, setActive]   = useState<DirectoryType | 'all'>('all')
  const [query, setQuery]     = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [region, setRegion]   = useState<string | null>(null)
  const [sort, setSort]       = useState<SortKey>('recent')

  const counts = useMemo(() => {
    const c = {} as Record<DirectoryType, number>
    for (const t of ['startup', 'incubator', 'government', 'university', 'community'] as DirectoryType[]) {
      c[t] = entries.filter((e) => e.type === t).length
    }
    return c
  }, [entries])

  const totalCount = entries.length
  const featured = useMemo(() => entries.filter((e) => e.featured).slice(0, 4), [entries])

  const filtered = useMemo(() => {
    let r = active === 'all' ? entries : entries.filter((e) => e.type === active)

    if (region) r = r.filter((e) => e.location === region)

    const q = query.trim().toLowerCase()
    if (q) {
      r = r.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.sector?.toLowerCase().includes(q) ?? false) ||
          (e.city?.toLowerCase().includes(q) ?? false)
      )
    }

    const sorted = [...r]
    if (sort === 'recent') sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    else if (sort === 'featured') sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
    else sorted.sort((a, b) => a.name.localeCompare(b.name))

    return sorted
  }, [entries, active, region, query, sort])

  const hasFilters = !!region || query.trim().length > 0

  return (
    <section className="mt-16">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-7">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00a855] mb-2">Open Directory</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">
            Discover Northern Luzon&apos;s<br />
            <span className="text-[#00cc6a]">Innovation Ecosystem</span>
          </h2>
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            An open directory of startups, programs, and organizations across Northern Luzon. Updated by the community.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto lg:shrink-0">
          {/* Search */}
          <div className="relative sm:w-64 lg:w-72 h-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search startups, organizations…"
              className="w-full h-full pl-9 pr-8 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-zinc-900 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center justify-center gap-2 px-4 h-12 rounded-lg border text-sm font-semibold transition-colors shrink-0 ${
              showFilters || region
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Help grow the directory */}
          <Link
            href="/submit-startup"
            className="group flex items-center gap-3 px-4 h-12 rounded-lg border border-[#00a855]/25 bg-[#00a855]/5 hover:bg-[#00a855]/10 transition-colors shrink-0"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 whitespace-nowrap">Help grow the directory</p>
              <p className="text-[10px] text-zinc-500 leading-snug hidden lg:block truncate max-w-[180px]">
                List your organization and be part of the ecosystem.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#00a855] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Region filter panel */}
      {showFilters && (
        <div className="flex items-center gap-1.5 flex-wrap mb-7 -mt-2">
          <button
            onClick={() => setRegion(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              region === null ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            All Regions
          </button>
          {DIRECTORY_LOCATIONS.map((loc) => (
            <button
              key={loc.value}
              onClick={() => setRegion(region === loc.value ? null : loc.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                region === loc.value ? 'bg-[#00cc6a] text-black' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-7">
        {STAT_CARDS.map(({ type, label, sub, Icon }) => (
          <div key={type} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-white">
            <div className="w-10 h-10 rounded-lg bg-[#00a855]/8 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-[#00a855]" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-zinc-900 leading-none">{counts[type]}</p>
              <p className="text-[11px] font-semibold text-zinc-700 mt-1 truncate">{label}</p>
              <p className="text-[10px] text-zinc-400 truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + sort ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActive('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              active === 'all' ? 'bg-[#00cc6a] text-black' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            All
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active === 'all' ? 'bg-black/10' : 'bg-zinc-100 text-zinc-500'}`}>
              {totalCount}
            </span>
          </button>
          {TABS.map((tab) => {
            const isActive = active === tab.type
            return (
              <button
                key={tab.type}
                onClick={() => setActive(tab.type)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                  isActive ? 'bg-[#00cc6a] text-black' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/10' : 'bg-zinc-100 text-zinc-500'}`}>
                  {counts[tab.type] ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-zinc-900 transition-colors shrink-0"
        >
          <option value="recent">Recently Added</option>
          <option value="featured">Featured First</option>
          <option value="az">A–Z</option>
        </select>
      </div>

      {/* ── Featured Organizations ── */}
      {featured.length > 0 && (
        <div className="mb-9">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <div>
                <span className="text-sm font-black text-zinc-900">Featured Organizations</span>
                <span className="block text-xs text-zinc-400">Highlighted builders and partners making an impact in the region.</span>
              </div>
            </div>
            <Link href="/ecosystem" className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#00a855] hover:underline shrink-0">
              View all featured <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((entry) => <FeaturedCard key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}

      {/* ── All Organizations ── */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-zinc-400" />
            <div>
              <span className="text-sm font-black text-zinc-900">All Organizations</span>
              <span className="block text-xs text-zinc-400">Browse the complete directory.</span>
            </div>
          </div>
          <span className="text-sm font-bold text-[#00a855] shrink-0">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
            {filtered.slice(0, 8).map((entry) => <OrgCard key={entry.id} entry={entry} />)}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-zinc-200 rounded-xl">
            <p className="text-sm text-zinc-400">
              {hasFilters ? 'No results match your filters.' : 'No listings yet.'}
            </p>
            {hasFilters && (
              <button onClick={() => { setQuery(''); setRegion(null) }} className="text-xs text-[#00a855] font-semibold hover:underline mt-1">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Footer CTA ── */}
      <div className="flex flex-col items-center gap-2 mt-10">
        <Link
          href="/ecosystem"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-zinc-900 text-zinc-900 text-sm font-bold hover:bg-zinc-900 hover:text-white transition-colors"
        >
          View Full Directory <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-zinc-400">See all {totalCount} organizations in the ecosystem</p>
      </div>
    </section>
  )
}

// ── Featured card ───────────────────────────────────────────────
function FeaturedCard({ entry }: { entry: DirectoryEntry }) {
  const initial = entry.name.charAt(0).toUpperCase()
  const inner = (
    <div className="group flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:border-amber-300 hover:shadow-md transition-all h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="relative w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
          {entry.logo_url ? (
            <Image src={entry.logo_url} alt={entry.name} fill className="object-contain p-1.5" sizes="44px" unoptimized />
          ) : (
            <span className="text-lg font-black text-zinc-400">{initial}</span>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Featured
        </span>
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-zinc-900 leading-snug line-clamp-1">{entry.name}</h4>
        <p className="text-xs text-zinc-400 mt-0.5">{entry.sector ?? TYPE_LABEL[entry.type]}</p>
        {entry.city && (
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />{entry.city}
          </p>
        )}
        <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">
          {TYPE_LABEL[entry.type]}
        </span>
      </div>
      <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#00a855] flex items-center gap-1">
          <BadgeCheck className="h-3.5 w-3.5" /> Featured on Amianan
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-[#00a855] transition-colors" />
      </div>
    </div>
  )
  return entry.website ? (
    <a href={entry.website} target="_blank" rel="noopener noreferrer" className="h-full block">{inner}</a>
  ) : (
    <div className="h-full">{inner}</div>
  )
}

// ── Standard org card ───────────────────────────────────────────
function OrgCard({ entry }: { entry: DirectoryEntry }) {
  const initial = entry.name.charAt(0).toUpperCase()
  const badge = badgeFor(entry)
  const inner = (
    <div className="group flex flex-col gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="relative w-11 h-11 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
          {entry.logo_url ? (
            <Image src={entry.logo_url} alt={entry.name} fill className="object-contain p-1.5" sizes="44px" unoptimized />
          ) : (
            <span className="text-lg font-black text-zinc-400">{initial}</span>
          )}
        </div>
        {badge && (
          <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-zinc-900 group-hover:text-black leading-snug line-clamp-1">{entry.name}</h4>
        <p className="text-xs text-zinc-400 mt-0.5">{entry.sector ?? TYPE_LABEL[entry.type]}</p>
        {entry.city && (
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />{entry.city}
          </p>
        )}
      </div>
      <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 group-hover:text-[#00a855] transition-colors">View Profile</span>
        {entry.website && <ExternalLink className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />}
      </div>
    </div>
  )
  return entry.website ? (
    <a href={entry.website} target="_blank" rel="noopener noreferrer" className="h-full block">{inner}</a>
  ) : (
    <div className="h-full">{inner}</div>
  )
}

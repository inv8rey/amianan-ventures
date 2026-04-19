import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Star } from 'lucide-react'
import { getAllDirectoryEntries, getFeaturedDirectoryEntries } from '@/lib/queries'
import { EcosystemDirectory } from '@/components/site/EcosystemDirectory'
import type { DirectoryEntry, DirectoryType } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Ecosystem Directory',
  description:
    'An open directory of startups, incubators, universities, and government agencies driving innovation across Northern Luzon. Updated by the community.',
}

const DIRECTORY_TYPES: { type: DirectoryType; label: string; description: string }[] = [
  { type: 'startup', label: 'Startups', description: 'Tech and innovation companies building in Northern Luzon.' },
  { type: 'incubator', label: 'Incubators & TBIs', description: 'Programs that support and accelerate early-stage startups.' },
  { type: 'government', label: 'Government Agencies', description: 'Public sector bodies supporting innovation and entrepreneurship.' },
  { type: 'university', label: 'Universities & HEIs', description: 'Academic institutions with innovation programs and tech transfer offices.' },
  { type: 'community', label: 'Communities', description: 'Networks and communities connecting founders and innovators.' },
]

const TYPE_LABELS: Record<DirectoryType, string> = {
  startup: 'Startup',
  incubator: 'Incubator / TBI',
  government: 'Government',
  university: 'University / HEI',
  community: 'Community',
}

export default async function EcosystemPage() {
  const [directoryAll, featuredEntries] = await Promise.all([
    getAllDirectoryEntries(500).catch(() => [] as DirectoryEntry[]),
    getFeaturedDirectoryEntries().catch(() => [] as DirectoryEntry[]),
  ])

  const types: DirectoryType[] = ['startup', 'incubator', 'government', 'university', 'community']

  // Pass ALL entries per type (no slice) — the client component shows everything
  const entriesByType = types.reduce((acc, type) => {
    acc[type] = directoryAll.filter((e) => e.type === type)
    return acc
  }, {} as Record<DirectoryType, DirectoryEntry[]>)

  const counts = types.reduce((acc, type) => {
    acc[type] = directoryAll.filter((e) => e.type === type).length
    return acc
  }, {} as Record<DirectoryType, number>)

  const totalCount = directoryAll.length

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-3">Open Directory</p>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 text-white">
              Discover the<br />
              <span className="text-[#00cc6a]">Northern Luzon</span>{' '}
              <span className="text-white">Ecosystem</span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed mb-7 max-w-lg">
              An open directory of startups, programs, universities, and organizations driving innovation across Baguio, Cordillera, and Northern Luzon. Updated by the community.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <a
                href="https://airtable.com/appYUrRsmwImGgG3C/pagsOvlAtunXtZ5Og/form"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#00cc6a] text-black px-5 py-2.5 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors uppercase tracking-wide"
              >
                Submit a listing <ArrowRight className="h-4 w-4" />
              </a>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-2xl font-black text-white">{totalCount}</span>
                organizations listed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Type overview cards ── */}
      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {DIRECTORY_TYPES.map((dt) => (
              <div
                key={dt.type}
                className="p-4 rounded-lg border border-zinc-200 hover:border-black transition-colors"
              >
                <p className="text-2xl font-black text-zinc-900 mb-0.5">{counts[dt.type]}</p>
                <p className="text-xs font-bold text-zinc-800">{dt.label}</p>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">{dt.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Spotlight ── */}
      {featuredEntries.length > 0 && (
        <div className="border-b border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Featured Organizations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredEntries.map((entry) => (
                <FeaturedCard key={entry.id} entry={entry} typeLabel={TYPE_LABELS[entry.type]} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Full directory (tabbed) ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <EcosystemDirectory entriesByType={entriesByType} counts={counts} />
      </div>

      {/* ── Submit CTA ── */}
      <div className="bg-[#042212] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-black text-white mb-1">Know a startup or organization we should list?</h2>
            <p className="text-sm text-zinc-400">Help us build the most complete Northern Luzon innovation directory.</p>
          </div>
          <a
            href="https://airtable.com/appYUrRsmwImGgG3C/pagsOvlAtunXtZ5Og/form"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-[#00cc6a] text-black px-6 py-3 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors uppercase tracking-wide"
          >
            Submit a listing <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Featured card (larger, spotlight style) ──────────────────
function FeaturedCard({ entry, typeLabel }: { entry: DirectoryEntry; typeLabel: string }) {
  const initial = entry.name.charAt(0).toUpperCase()
  const inner = (
    <div className="group flex gap-4 p-5 rounded-xl border border-zinc-200 hover:border-black hover:shadow-md transition-all bg-white h-full">
      {/* Logo */}
      <div className="relative shrink-0 w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center">
        {entry.logo_url ? (
          <Image src={entry.logo_url} alt={entry.name} fill className="object-contain p-1.5" sizes="56px" />
        ) : (
          <span className="text-2xl font-black text-zinc-400">{initial}</span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#00a855]">{typeLabel}</span>
          {entry.sector && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">{entry.sector}</span>
            </>
          )}
        </div>
        <h3 className="text-sm font-black text-zinc-900 group-hover:text-black leading-snug mb-1">{entry.name}</h3>
        {entry.city && (
          <p className="text-[10px] text-zinc-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00cc6a] inline-block shrink-0" />
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

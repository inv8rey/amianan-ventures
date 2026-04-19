import Image from 'next/image'
import type { DirectoryEntry } from '@/types'

interface Props {
  entries: DirectoryEntry[]
}

function LogoItem({ entry }: { entry: DirectoryEntry }) {
  const initial = entry.name.charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-2.5 mx-6 shrink-0">
      <div className="relative w-7 h-7 rounded bg-zinc-100 overflow-hidden flex items-center justify-center">
        {entry.logo_url ? (
          <Image src={entry.logo_url} alt={entry.name} fill className="object-contain p-0.5" sizes="28px" />
        ) : (
          <span className="text-xs font-black text-zinc-500">{initial}</span>
        )}
      </div>
      <span className="text-xs font-semibold text-zinc-600 whitespace-nowrap">{entry.name}</span>
    </div>
  )
}

export function LogoTicker({ entries }: Props) {
  if (entries.length === 0) return null

  // Duplicate for seamless loop
  const doubled = [...entries, ...entries]

  return (
    <div className="border-y border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-2 pl-4 pr-5 py-3 border-r border-zinc-200 bg-black">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00cc6a] whitespace-nowrap">
            Ecosystem
          </span>
        </div>

        {/* Scrolling logos */}
        <div className="flex-1 overflow-hidden py-3">
          <div className="ticker-track">
            {doubled.map((entry, i) => (
              <LogoItem key={`${entry.id}-${i}`} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

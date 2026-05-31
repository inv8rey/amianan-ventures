'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { format } from 'date-fns'
import { BarChart2, Info, ArrowRight, Download } from 'lucide-react'

type Report = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  published_at: string | null
}

function Tooltip() {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((v) => !v)}
        aria-label="What is Ecosystem Pulse?"
        className="p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <Info className="h-3 w-3" />
      </button>

      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg px-3 py-2.5 text-left pointer-events-none">
          <p className="text-[11px] font-bold text-zinc-800 mb-1">What is Ecosystem Pulse?</p>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Original research reports on the Northern Luzon startup and innovation ecosystem —
            data, trends, and insights for founders, policymakers, and builders.
          </p>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-200" />
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-[3px] w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
        </div>
      )}
    </div>
  )
}

export function EcosystemPulseWidget({ reports }: { reports: Report[] }) {
  if (reports.length === 0) return null

  return (
    <div className="pt-7">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-black">
        <span className="w-1 h-4 bg-[#00cc6a] rounded-full" />
        <BarChart2 className="h-3.5 w-3.5 text-zinc-700" />
        <span className="text-xs font-black uppercase tracking-widest text-black">Ecosystem Pulse</span>
        <Tooltip />
      </div>

      {/* Report list */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/ecosystem-pulse/${report.slug}`}
            className="group flex gap-3 items-start"
          >
            {/* Cover thumbnail */}
            {report.cover_image_url ? (
              <div className="relative shrink-0 w-16 h-11 rounded overflow-hidden bg-zinc-100">
                <Image
                  src={report.cover_image_url}
                  alt={report.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="shrink-0 w-16 h-11 rounded bg-zinc-900 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-[#00cc6a]" />
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-[#00a855] transition-colors line-clamp-2 leading-snug">
                {report.title}
              </h4>
              <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                <Download className="h-2.5 w-2.5 shrink-0" />
                Free download
                {report.published_at && (
                  <> · {format(new Date(report.published_at), 'MMM yyyy')}</>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* All reports link — shown once there are multiple */}
      {reports.length >= 2 && (
        <Link
          href="/ecosystem-pulse"
          className="mt-3 flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider transition-colors"
        >
          All reports <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

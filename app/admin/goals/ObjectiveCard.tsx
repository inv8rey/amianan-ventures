'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type KeyResult = {
  id: string
  title: string
  target_type: 'number' | 'percentage'
  target_value: number
  current_value: number
  unit: string | null
}

type Objective = {
  id: string
  title: string
  description: string | null
  quarter: string | null
  status: string
  key_results: KeyResult[]
}

function formatValue(value: number, type: 'number' | 'percentage', unit: string | null) {
  if (type === 'percentage') return `${value}%`
  if (unit) return `${value.toLocaleString()} ${unit}`
  return value.toLocaleString()
}

function getProgress(kr: KeyResult): number {
  if (kr.target_value === 0) return 0
  const pct = (kr.current_value / kr.target_value) * 100
  return Math.min(100, Math.max(0, pct))
}

export function ObjectiveCard({ objective }: { objective: Objective }) {
  const krs = objective.key_results ?? []

  // Overall progress = average of individual KR progress
  const overallProgress = krs.length
    ? Math.round(krs.reduce((sum, kr) => sum + getProgress(kr), 0) / krs.length)
    : 0

  const progressColor =
    overallProgress >= 80 ? 'bg-[#00a855]' :
    overallProgress >= 50 ? 'bg-amber-400' :
    'bg-zinc-300'

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white hover:border-zinc-300 transition-colors">
      {/* Objective header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-zinc-900">{objective.title}</h3>
            {objective.quarter && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                {objective.quarter}
              </span>
            )}
            {objective.status === 'completed' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00a855]/10 text-[#00a855]">
                Completed
              </span>
            )}
            {objective.status === 'cancelled' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-400">
                Cancelled
              </span>
            )}
          </div>
          {objective.description && (
            <p className="text-xs text-zinc-500 mt-0.5">{objective.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 ml-4">
          {/* Overall progress pill */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div className={`h-full rounded-full ${progressColor} transition-all`} style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-xs font-semibold text-zinc-500 tabular-nums w-8">{overallProgress}%</span>
          </div>
          <Link
            href={`/admin/goals/${objective.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            Edit <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Key results */}
      {krs.length > 0 ? (
        <div className="divide-y divide-zinc-50">
          {krs.map((kr) => {
            const pct = getProgress(kr)
            const barColor =
              pct >= 80 ? 'bg-[#00a855]' :
              pct >= 50 ? 'bg-amber-400' :
              'bg-zinc-300'

            return (
              <div key={kr.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-700 truncate">{kr.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium tabular-nums shrink-0">
                      {formatValue(kr.current_value, kr.target_type, kr.unit)}
                      {' / '}
                      {formatValue(kr.target_value, kr.target_type, kr.unit)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="px-5 py-3 text-xs text-zinc-400">No key results yet — click Edit to add some.</p>
      )}
    </div>
  )
}

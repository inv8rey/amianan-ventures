'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp } from 'lucide-react'

type Period = '7d' | '30d' | '3m'

interface DataPoint {
  date: string
  label: string
  pageviews: number
}

const PERIODS: { key: Period; label: string }[] = [
  { key: '7d',  label: '7D'  },
  { key: '30d', label: '1M'  },
  { key: '3m',  label: '3M'  },
]

// ── SVG Line Chart ─────────────────────────────────────────────────────────────
function LineChart({ data, loading }: { data: DataPoint[]; loading: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 800, H = 180
  const padL = 38, padR = 16, padT = 12, padB = 32
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const maxVal = Math.max(...data.map(d => d.pageviews), 1)
  const minVal = 0

  const pts = data.map((d, i) => ({
    x: padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
    y: padT + chartH - ((d.pageviews - minVal) / (maxVal - minVal)) * chartH,
    ...d,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = pts.length > 0
    ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + chartH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + chartH).toFixed(1)} Z`
    : ''

  // Y-axis grid values
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  // X-axis label step — show ~7 labels max
  const xStep = Math.max(1, Math.ceil(data.length / 7))

  // Tooltip position
  const hPt = hovered !== null ? pts[hovered] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-44">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-44 text-center">
        <TrendingUp className="h-7 w-7 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No GA4 data available for this period</p>
      </div>
    )
  }

  return (
    <div className="relative select-none">
      {/* Tooltip */}
      {hPt && (
        <div
          className="absolute z-20 pointer-events-none px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl text-xs"
          style={{
            left: `${(hPt.x / W) * 100}%`,
            top: `${(hPt.y / H) * 100}%`,
            transform: 'translate(-50%, calc(-100% - 8px))',
          }}
        >
          <p className="font-bold text-white">{hPt.pageviews.toLocaleString()} views</p>
          <p className="text-zinc-400 mt-0.5">{hPt.label}</p>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: '180px' }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((f) => {
          const y = padT + chartH * (1 - f)
          const val = Math.round(maxVal * f)
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" className="text-foreground" />
              <text x={padL - 6} y={y + 3.5} textAnchor="end" fontSize="9.5"
                fill="currentColor" fillOpacity="0.35" className="text-foreground font-mono">
                {val >= 1000 ? `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k` : val}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* X-axis labels */}
        {pts.map((p, i) => {
          if (i % xStep !== 0 && i !== pts.length - 1) return null
          return (
            <text key={p.date} x={p.x} y={H - 6} textAnchor="middle" fontSize="9.5"
              fill="currentColor" fillOpacity="0.35" className="text-foreground">
              {p.label}
            </text>
          )
        })}

        {/* Hover dots + invisible hit areas */}
        {pts.map((p, i) => {
          const slotW = chartW / Math.max(data.length, 1)
          return (
            <g key={i}>
              {hovered === i && (
                <>
                  <line x1={p.x} y1={padT} x2={p.x} y2={padT + chartH}
                    stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,3" />
                  <circle cx={p.x} cy={p.y} r="5" fill="hsl(var(--primary))" />
                  <circle cx={p.x} cy={p.y} r="3" fill="white" />
                </>
              )}
              <rect
                x={p.x - slotW / 2} y={padT} width={slotW} height={chartH}
                fill="transparent" style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHovered(i)}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ViewsChart() {
  const [period, setPeriod] = useState<Period>('30d')
  const [data, setData]     = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/views-chart?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  const totalForPeriod = data.reduce((s, d) => s + d.pageviews, 0)
  const peak = data.reduce((m, d) => d.pageviews > m.pageviews ? d : m, data[0] ?? { pageviews: 0, label: '' })

  return (
    <div className="rounded-lg border border-border/40 bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Article Views</h2>
          </div>
          {!loading && data.length > 0 && (
            <div className="flex items-center gap-4 mt-1">
              <p className="text-2xl font-bold">{totalForPeriod.toLocaleString()}</p>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>total pageviews</p>
                {peak.pageviews > 0 && <p>Peak: <span className="text-foreground font-medium">{peak.pageviews.toLocaleString()}</span> on {peak.label}</p>}
              </div>
            </div>
          )}
        </div>
        {/* Period tabs */}
        <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-1">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                period === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <LineChart data={data} loading={loading} />
    </div>
  )
}

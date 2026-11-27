'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getCountdown, pad2 } from '@/lib/countdown'

/**
 * Current time that keeps ticking. The first render uses the server's
 * timestamp so the HTML matches, then switches to the visitor's clock.
 */
function useNow(initialNow: number, deadline: string, alwaysSeconds: boolean) {
  const [now, setNow] = useState(initialNow)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const current = Date.now()
      setNow(current)
      const { urgency } = getCountdown(deadline, current)
      if (urgency === 'closed') return
      // Seconds only matter under 24h (or on the featured tiles); otherwise once a minute is enough.
      const every = alwaysSeconds || urgency === 'final' ? 1000 : 60_000
      timer = setTimeout(tick, every - (current % every) + 5)
    }
    timer = setTimeout(tick, 0)
    return () => clearTimeout(timer)
  }, [deadline, alwaysSeconds])

  return now
}

/** Large DD / HH / MM / SS tiles for the featured opportunity. */
export function CountdownTiles({ deadline, initialNow }: { deadline: string; initialNow: number }) {
  const now = useNow(initialNow, deadline, true)
  const c = getCountdown(deadline, now)

  if (c.urgency === 'closed') {
    return (
      <div className="rounded-lg bg-zinc-200 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-zinc-600">
        Closed
      </div>
    )
  }

  const tiles = [
    { value: c.days, label: c.days === 1 ? 'Day' : 'Days' },
    { value: c.hours, label: 'Hours' },
    { value: c.minutes, label: 'Minutes' },
    { value: c.seconds, label: 'Seconds' },
  ]
  const hot = c.urgency === 'final' || c.urgency === 'urgent'

  return (
    <div
      role="timer"
      aria-label={`${c.days} days, ${c.hours} hours, ${c.minutes} minutes left`}
      className="grid grid-cols-4 gap-1.5"
    >
      {tiles.map((t) => (
        <div
          key={t.label}
          className={cn(
            'rounded-lg px-1 py-2 text-center',
            hot ? 'bg-rose-100 text-rose-900' : 'bg-[#eefdd6] text-[#131314]'
          )}
        >
          <div className="font-editorial font-bold text-[1.65rem] leading-none tabular-nums" aria-hidden>
            {t.value > 99 ? t.value : pad2(t.value)}
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] opacity-75" aria-hidden>
            {t.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Compact deadline indicator for the smaller opportunity cards. */
export function CountdownBadge({ deadline, initialNow }: { deadline: string; initialNow: number }) {
  const now = useNow(initialNow, deadline, false)
  const c = getCountdown(deadline, now)

  const box = 'flex min-w-[5.25rem] flex-col items-center justify-center rounded-lg px-2.5 py-2 text-center'
  const label = 'mt-0.5 text-[9px] font-semibold uppercase leading-tight tracking-[0.1em]'

  if (c.urgency === 'closed') {
    return (
      <div className={cn(box, 'bg-zinc-200 text-zinc-600')}>
        <span className="text-xs font-semibold uppercase tracking-[0.12em]">Closed</span>
      </div>
    )
  }

  if (c.urgency === 'final') {
    return (
      <div role="timer" className={cn(box, 'bg-rose-100 text-rose-900')}>
        <span className={cn(label, 'mt-0 mb-0.5')}>Closes in</span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          {pad2(c.hours)}:{pad2(c.minutes)}:{pad2(c.seconds)}
        </span>
      </div>
    )
  }

  const hot = c.urgency === 'urgent'
  const soon = c.urgency === 'soon'
  return (
    <div
      className={cn(
        box,
        hot ? 'bg-rose-100 text-rose-900' : soon ? 'bg-amber-100 text-amber-950' : 'bg-[#eefdd6] text-[#131314]'
      )}
    >
      <span className="font-editorial font-bold text-[1.75rem] leading-none tabular-nums">
        {c.days > 99 ? c.days : pad2(c.days)}
      </span>
      <span className={label}>{c.days === 1 ? 'Day left' : 'Days left'}</span>
    </div>
  )
}

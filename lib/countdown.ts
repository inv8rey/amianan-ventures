import { OPPORTUNITY_TIMEZONE } from '@/types/opportunities'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export type Urgency = 'open' | 'soon' | 'urgent' | 'final' | 'closed'

export interface CountdownParts {
  remainingMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
  /**
   * open:   more than 7 days left      → "12 DAYS LEFT"
   * soon:   2 to 7 days left           → "03 DAYS LEFT"
   * urgent: 24 to 48 hours left        → "01 DAY LEFT"
   * final:  under 24 hours             → live HH:MM:SS
   * closed: deadline reached           → "CLOSED"
   */
  urgency: Urgency
}

export function getCountdown(deadline: string | Date, now: number): CountdownParts {
  const end = typeof deadline === 'string' ? Date.parse(deadline) : deadline.getTime()
  const remainingMs = Math.max(0, end - now)
  const days = Math.floor(remainingMs / DAY)
  const hours = Math.floor((remainingMs % DAY) / HOUR)
  const minutes = Math.floor((remainingMs % HOUR) / MINUTE)
  const seconds = Math.floor((remainingMs % MINUTE) / SECOND)

  let urgency: Urgency
  if (remainingMs <= 0) urgency = 'closed'
  else if (remainingMs < DAY) urgency = 'final'
  else if (remainingMs < 2 * DAY) urgency = 'urgent'
  else if (remainingMs <= 7 * DAY) urgency = 'soon'
  else urgency = 'open'

  return { remainingMs, days, hours, minutes, seconds, urgency }
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

/** "Dec 4, 2026" in Philippine Standard Time. */
export function formatDeadlineDate(deadline: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: OPPORTUNITY_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(deadline))
}

/** "Dec 4, 2026, 11:59 PM PHT" in Philippine Standard Time. */
export function formatDeadlineFull(deadline: string) {
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone: OPPORTUNITY_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(deadline))
  return `${s} PHT`
}

/** ISO string → "YYYY-MM-DDTHH:mm" wall-clock in Manila, for <input type="datetime-local">. */
export function toManilaInputValue(iso: string | null) {
  if (!iso) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: OPPORTUNITY_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

/** "YYYY-MM-DDTHH:mm" typed as Manila wall-clock time → ISO string. Manila has no DST (UTC+8). */
export function fromManilaInputValue(value: string) {
  if (!value) return null
  return new Date(`${value}:00+08:00`).toISOString()
}

/** Request-time clock for server components; countdowns hydrate from it, then tick in the browser. */
export const requestTime = () => Date.now()

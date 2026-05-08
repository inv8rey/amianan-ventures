'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft, ChevronRight, CalendarDays, LayoutGrid,
  Clock, MapPin, ExternalLink,
} from 'lucide-react'
import type { Event } from '@/types'

// ---------------------------------------------------------------------------
// Timezone helpers (Manila)
// ---------------------------------------------------------------------------
const PH_TZ = 'Asia/Manila'

function toPHDate(iso: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PH_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? '0')
  return { year: get('year'), month: get('month'), day: get('day') }
}

function phTimeStr(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PH_TZ, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso))
}

function phDateStr(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PH_TZ, weekday: 'short', month: 'short', day: 'numeric',
  }).format(new Date(iso))
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Props {
  events: Event[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function EventsCalendar({ events }: Props) {
  const today = toPHDate(new Date().toISOString())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [year, setYear] = useState(today.year)
  const [month, setMonth] = useState(today.month) // 1-indexed
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Build a map: dateKey → Event[]
  const eventMap = useMemo(() => {
    const map: Record<string, Event[]> = {}
    for (const e of events) {
      const start = toPHDate(e.date)
      const end = e.end_date ? toPHDate(e.end_date) : start
      // Walk through all days from start to end
      const s = new Date(start.year, start.month - 1, start.day)
      const en = new Date(end.year, end.month - 1, end.day)
      for (let d = new Date(s); d <= en; d.setDate(d.getDate() + 1)) {
        const k = dateKey(d.getFullYear(), d.getMonth() + 1, d.getDate())
        if (!map[k]) map[k] = []
        if (!map[k].find((ev) => ev.id === e.id)) map[k].push(e)
      }
    }
    return map
  }, [events])

  // Calendar grid
  const firstDow = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = new Date(year, month - 1, 0).getDate()
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
    setSelectedKey(null)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
    setSelectedKey(null)
  }
  function goToday() {
    setYear(today.year); setMonth(today.month); setSelectedKey(null)
  }

  const selectedEvents = selectedKey ? (eventMap[selectedKey] ?? []) : []

  // Upcoming events for list view
  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.date) >= now)
  const past = events.filter((e) => new Date(e.date) < now)

  return (
    <div>
      {/* ── View toggle ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 border border-zinc-200">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            List
          </button>
        </div>

        {view === 'calendar' && (
          <button
            onClick={goToday}
            className="text-xs font-semibold text-[#00a855] hover:underline"
          >
            Today
          </button>
        )}
      </div>

      {/* ── CALENDAR VIEW ───────────────────────────────────────────── */}
      {view === 'calendar' && (
        <div className="space-y-4">
          {/* Month navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-500" />
            </button>
            <h2 className="text-base font-bold text-zinc-900">
              {MONTHS[month - 1]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-zinc-200 pb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
            {Array.from({ length: totalCells }, (_, i) => {
              const offset = i - firstDow
              const isCurrentMonth = offset >= 0 && offset < daysInMonth
              const day = isCurrentMonth
                ? offset + 1
                : offset < 0
                  ? prevMonthDays + offset + 1
                  : offset - daysInMonth + 1

              const displayYear = isCurrentMonth ? year
                : offset < 0 ? (month === 1 ? year - 1 : year)
                : (month === 12 ? year + 1 : year)
              const displayMonth = isCurrentMonth ? month
                : offset < 0 ? (month === 1 ? 12 : month - 1)
                : (month === 12 ? 1 : month + 1)

              const key = dateKey(displayYear, displayMonth, day)
              const dayEvents = eventMap[key] ?? []
              const isToday = displayYear === today.year && displayMonth === today.month && day === today.day && isCurrentMonth
              const isSelected = key === selectedKey
              const hasFuture = dayEvents.some((e) => new Date(e.date) >= now)
              const hasPast = dayEvents.some((e) => new Date(e.date) < now)

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (dayEvents.length > 0) setSelectedKey(key === selectedKey ? null : key)
                  }}
                  className={`relative bg-white min-h-[60px] sm:min-h-[72px] p-1.5 sm:p-2 flex flex-col transition-colors
                    ${!isCurrentMonth ? 'bg-zinc-50/60' : ''}
                    ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-emerald-50' : 'cursor-default'}
                    ${isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-[#00cc6a]' : ''}
                  `}
                >
                  {/* Day number */}
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-[#00cc6a] text-white' : isCurrentMonth ? 'text-zinc-700' : 'text-zinc-300'}
                  `}>
                    {day}
                  </span>

                  {/* Event dots / labels */}
                  {dayEvents.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5 w-full">
                      {dayEvents.slice(0, 2).map((e) => {
                        const isPastEvent = new Date(e.date) < now
                        return (
                          <span
                            key={e.id}
                            className={`hidden sm:block text-[9px] font-semibold px-1 rounded truncate leading-4
                              ${isPastEvent ? 'bg-zinc-100 text-zinc-400' : 'bg-emerald-100 text-emerald-700'}
                            `}
                          >
                            {e.title}
                          </span>
                        )
                      })}
                      {/* Mobile: just dots */}
                      <div className="flex sm:hidden gap-0.5 mt-0.5 justify-center">
                        {hasFuture && <span className="w-1.5 h-1.5 rounded-full bg-[#00cc6a]" />}
                        {hasPast && <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                      </div>
                      {dayEvents.length > 2 && (
                        <span className="hidden sm:block text-[9px] text-zinc-400 px-1">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected day panel */}
          {selectedKey && selectedEvents.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-700">
                  {new Intl.DateTimeFormat('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                    timeZone: PH_TZ,
                  }).format(new Date(selectedKey + 'T00:00:00+08:00'))}
                </p>
                <button
                  onClick={() => setSelectedKey(null)}
                  className="text-zinc-400 hover:text-zinc-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <div className="divide-y divide-zinc-100">
                {selectedEvents.map((e) => {
                  const isPastEvent = new Date(e.date) < now
                  return (
                    <div key={e.id} className="flex gap-4 p-4">
                      {e.cover_image && (
                        <div className="shrink-0 relative w-20 h-14 rounded-lg overflow-hidden bg-zinc-100">
                          <Image src={e.cover_image} alt={e.title} fill className="object-cover" sizes="80px" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link
                            href={`/events/${e.slug}`}
                            className="text-sm font-bold text-zinc-900 hover:text-[#00a855] transition-colors line-clamp-2 leading-snug"
                          >
                            {e.title}
                          </Link>
                          {isPastEvent && (
                            <span className="shrink-0 text-[9px] bg-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded font-semibold uppercase">Past</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#00cc6a]" />
                            {phTimeStr(e.date)}{e.end_date ? ` – ${phTimeStr(e.end_date)}` : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-[#00cc6a]" />
                            {e.location}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-2.5">
                          <Link
                            href={`/events/${e.slug}`}
                            className="text-xs font-semibold text-[#00a855] hover:underline flex items-center gap-0.5"
                          >
                            View details <ExternalLink className="h-3 w-3" />
                          </Link>
                          {e.event_url && (
                            <a
                              href={e.event_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 hover:underline"
                            >
                              Register →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-5 text-[11px] text-zinc-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#00cc6a] inline-block" /> Upcoming event
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-zinc-200 inline-block" /> Past event
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-5 rounded-full bg-[#00cc6a] inline-flex items-center justify-center text-white text-[9px] font-bold">1</span> Today
            </span>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ───────────────────────────────────────────────── */}
      {view === 'list' && (
        <div className="space-y-10">
          {/* Upcoming */}
          {upcoming.length > 0 ? (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-5">
                Upcoming Events
              </h2>
              <div className="space-y-3">
                {upcoming.map((e) => (
                  <EventListRow key={e.id} event={e} isPast={false} />
                ))}
              </div>
            </section>
          ) : (
            <div className="text-center py-16 text-zinc-400 border border-zinc-200 rounded-xl">
              <p className="text-base">No upcoming events at the moment.</p>
              <p className="text-sm mt-1">Check back soon for new events.</p>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-5">
                Past Events
              </h2>
              <div className="space-y-3">
                {past.map((e) => (
                  <EventListRow key={e.id} event={e} isPast />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// List row sub-component
// ---------------------------------------------------------------------------
function EventListRow({ event: e, isPast }: { event: Event; isPast: boolean }) {
  const startPH = toPHDate(e.date)
  return (
    <Link
      href={`/events/${e.slug}`}
      className="flex gap-4 p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all group"
    >
      {/* Date badge */}
      <div className={`shrink-0 w-12 text-center rounded-lg py-2 ${isPast ? 'bg-zinc-100' : 'bg-emerald-50 border border-emerald-100'}`}>
        <p className={`text-[10px] font-semibold uppercase ${isPast ? 'text-zinc-400' : 'text-emerald-600'}`}>
          {new Date(startPH.year, startPH.month - 1).toLocaleString('default', { month: 'short' })}
        </p>
        <p className={`text-xl font-bold leading-tight ${isPast ? 'text-zinc-400' : 'text-zinc-800'}`}>
          {startPH.day}
        </p>
      </div>

      {/* Cover image */}
      {e.cover_image && (
        <div className="shrink-0 relative w-20 h-14 rounded-lg overflow-hidden bg-zinc-100 hidden sm:block">
          <Image src={e.cover_image} alt={e.title} fill className="object-cover" sizes="80px" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-zinc-900 group-hover:text-[#00a855] transition-colors line-clamp-1 mb-1">
          {e.title}
        </p>
        <p className="text-xs text-zinc-500 line-clamp-1 mb-2">{e.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#00cc6a]" />
            {phDateStr(e.date)} · {phTimeStr(e.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#00cc6a]" />
            {e.location}
          </span>
        </div>
      </div>

      {isPast && (
        <span className="shrink-0 self-start text-[10px] bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded font-semibold">Past</span>
      )}
    </Link>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ArrowRight } from 'lucide-react'
import type { Announcement } from '@/app/admin/settings/actions'

export type { Announcement }

const COLOR_STYLES: Record<string, string> = {
  green:  'bg-[#00cc6a] text-black',
  dark:   'bg-[#042212] text-white',
  amber:  'bg-amber-400 text-black',
  black:  'bg-black text-white',
  white:  'bg-white text-zinc-900 border-b border-zinc-200',
}

const DISMISS_KEY = 'av_announcement_bar_dismissed'

function isDark(bg: string) {
  return bg === 'dark' || bg === 'black'
}

export function AnnouncementBar({ announcements }: { announcements: Announcement[] }) {
  const [visible, setVisible] = useState(false)
  const [index, setIndex]     = useState(0)
  const [fading, setFading]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fingerprint the full list so any change resets dismiss state
  const fingerprint = announcements.map((a) => a.message).join('|')

  useEffect(() => {
    const key = `${DISMISS_KEY}_${btoa(fingerprint).slice(0, 20)}`
    if (!sessionStorage.getItem(key)) setVisible(true)
  }, [fingerprint])

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (!visible || announcements.length <= 1) return

    timerRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % announcements.length)
        setFading(false)
      }, 300)
    }, 7000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [visible, announcements.length])

  if (!visible || announcements.length === 0) return null

  const current = announcements[index]
  const colorClass = COLOR_STYLES[current.bg_color] ?? COLOR_STYLES.dark
  const dark = isDark(current.bg_color)
  const mutedClass = dark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
  const dotBase = dark ? 'bg-white/30' : 'bg-black/20'
  const dotActive = dark ? 'bg-white' : 'bg-black'

  function dismiss() {
    const key = `${DISMISS_KEY}_${btoa(fingerprint).slice(0, 20)}`
    sessionStorage.setItem(key, '1')
    setVisible(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function goTo(i: number) {
    if (i === index) return
    setFading(true)
    setTimeout(() => { setIndex(i); setFading(false) }, 300)
    // Reset timer
    if (timerRef.current) clearInterval(timerRef.current)
    if (announcements.length > 1) {
      timerRef.current = setInterval(() => {
        setFading(true)
        setTimeout(() => {
          setIndex((cur) => (cur + 1) % announcements.length)
          setFading(false)
        }, 300)
      }, 7000)
    }
  }

  return (
    <div className={`relative w-full transition-colors duration-300 ${colorClass}`}>
      <div className="mx-auto max-w-7xl px-10 sm:px-12">
        {/* Message row */}
        <div
          className={`flex items-center justify-center gap-3 py-2.5 text-center min-h-[40px] transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}
        >
          <p className="text-xs sm:text-sm font-semibold leading-snug">
            {current.message}
          </p>
          {current.link_text && current.link_url && (
            <a
              href={current.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold underline underline-offset-2 hover:no-underline transition-all ${mutedClass}`}
            >
              {current.link_text}
              <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Progress dots — only if multiple announcements */}
        {announcements.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pb-1.5">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to announcement ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? `${dotActive} w-3` : dotBase}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors ${mutedClass}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

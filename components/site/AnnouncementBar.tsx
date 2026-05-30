'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'

export type AnnouncementConfig = {
  enabled: boolean
  message: string
  link_text: string
  link_url: string
  bg_color: 'green' | 'dark' | 'amber' | 'black' | 'white'
}

const COLOR_STYLES: Record<AnnouncementConfig['bg_color'], string> = {
  green:  'bg-[#00cc6a] text-black',
  dark:   'bg-[#042212] text-white',
  amber:  'bg-amber-400 text-black',
  black:  'bg-black text-white',
  white:  'bg-white text-zinc-900 border-b border-zinc-200',
}

const DISMISS_KEY = 'av_announcement_dismissed'

export function AnnouncementBar({ config }: { config: AnnouncementConfig }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show unless dismissed — key includes message so new messages always show
    const key = `${DISMISS_KEY}_${btoa(config.message).slice(0, 16)}`
    if (!sessionStorage.getItem(key)) setVisible(true)
  }, [config.message])

  if (!config.enabled || !config.message || !visible) return null

  function dismiss() {
    const key = `${DISMISS_KEY}_${btoa(config.message).slice(0, 16)}`
    sessionStorage.setItem(key, '1')
    setVisible(false)
  }

  const colorClass = COLOR_STYLES[config.bg_color] ?? COLOR_STYLES.green

  return (
    <div className={`relative w-full ${colorClass}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 py-2.5 text-center min-h-[40px]">
          <p className="text-xs sm:text-sm font-semibold leading-snug">
            {config.message}
          </p>
          {config.link_text && config.link_url && (
            <Link
              href={config.link_url}
              className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold underline underline-offset-2 hover:no-underline transition-all ${
                config.bg_color === 'green' || config.bg_color === 'amber' || config.bg_color === 'white'
                  ? 'text-black/70 hover:text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {config.link_text}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors ${
          config.bg_color === 'green' || config.bg_color === 'amber' || config.bg_color === 'white'
            ? 'text-black/50 hover:text-black'
            : 'text-white/50 hover:text-white'
        }`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

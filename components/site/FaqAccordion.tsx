'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  q: string
  a: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-zinc-50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-bold text-zinc-900">{item.q}</span>
              <ChevronDown className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 -mt-1">
                <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

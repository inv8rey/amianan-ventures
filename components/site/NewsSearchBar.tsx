'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { ArticleCard } from './ArticleCard'
import type { Article, Location } from '@/types'

const locationLabel: Record<Location, string> = {
  cordillera: 'Cordillera',
  'cagayan-valley': 'Cagayan Valley',
  'ilocos-region': 'Ilocos Region',
  pangasinan: 'Pangasinan',
  national: 'National',
}

interface NewsSearchBarProps {
  articles: Article[]
  activeLocation?: Location
}

export function NewsSearchBar({ articles, activeLocation }: NewsSearchBarProps) {
  const [query, setQuery] = useState('')

  const trimmed = query.trim()
  const filtered = trimmed
    ? articles.filter((a) => {
        const q = trimmed.toLowerCase()
        return (
          a.title.toLowerCase().includes(q) ||
          (a.excerpt ?? '').toLowerCase().includes(q) ||
          (a.tags ?? []).some((t) => t.toLowerCase().includes(q))
        )
      })
    : articles

  return (
    <>
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white focus:ring-0 transition-colors"
        />
        {trimmed && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results count when searching */}
      {trimmed && (
        <p className="text-xs text-zinc-500 mb-4">
          {filtered.length === 0
            ? 'No results'
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}{' '}
          for <span className="font-semibold text-zinc-700">"{trimmed}"</span>
        </p>
      )}

      {/* Articles grid or empty state */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-zinc-200 rounded-xl">
          {trimmed ? (
            <>
              <p className="text-lg font-semibold text-zinc-500">No articles match your search.</p>
              <p className="text-sm text-zinc-400 mt-1">Try a different keyword.</p>
              <button
                onClick={() => setQuery('')}
                className="mt-4 inline-block text-sm font-semibold text-[#00a855] hover:underline"
              >
                ← Clear search
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-zinc-500">
                {activeLocation
                  ? `No articles from ${locationLabel[activeLocation]} yet.`
                  : 'No articles published yet.'}
              </p>
              <p className="text-sm text-zinc-400 mt-1">Check back soon.</p>
              {activeLocation && (
                <Link
                  href="/news"
                  className="mt-4 inline-block text-sm font-semibold text-[#00a855] hover:underline"
                >
                  ← View all regions
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { NewsSearchBar } from '@/components/site/NewsSearchBar'
import { getPublishedArticles } from '@/lib/queries'
import { LOCATIONS } from '@/types'
import type { Location } from '@/types'

export const revalidate = 60

const VALID_LOCATIONS: string[] = LOCATIONS.map((l) => l.value)

const locationLabel: Record<Location, string> = {
  cordillera: 'Cordillera',
  'cagayan-valley': 'Cagayan Valley',
  'ilocos-region': 'Ilocos Region',
  pangasinan: 'Pangasinan',
  national: 'National',
}

const locationSubtext: Record<Location, string> = {
  cordillera: 'Startup ecosystem, innovation programs, and founder stories from the Cordillera Administrative Region.',
  'cagayan-valley': 'Startup ecosystem, innovation programs, and founder stories from Cagayan Valley (Region II).',
  'ilocos-region': 'Startup ecosystem, innovation programs, and founder stories from the Ilocos Region (Region I).',
  pangasinan: 'Startup ecosystem, innovation programs, and founder stories from Pangasinan.',
  national: 'National news and developments relevant to the Northern Luzon innovation ecosystem.',
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ location?: string }> }
): Promise<Metadata> {
  const { location } = await searchParams
  const active = VALID_LOCATIONS.includes(location ?? '') ? (location as Location) : undefined
  const title = active ? `News from ${locationLabel[active]}` : 'News & Updates'
  return {
    title,
    description: active
      ? locationSubtext[active]
      : 'Innovation ecosystem news from Baguio, Cordillera, and Northern Luzon.',
  }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>
}) {
  const { location } = await searchParams
  const activeLocation = VALID_LOCATIONS.includes(location ?? '') ? location as Location : undefined

  const articles = await getPublishedArticles(undefined, 'news', activeLocation)

  const headline = activeLocation
    ? `News & Updates from ${locationLabel[activeLocation]}`
    : 'News & Updates'

  const subtext = activeLocation
    ? locationSubtext[activeLocation]
    : 'Innovation ecosystem news from Baguio, Cordillera, and Northern Luzon.'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-1 h-6 bg-[#00cc6a] rounded-full" />
          <h1 className="text-3xl font-black text-zinc-900">{headline}</h1>
        </div>
        <p className="text-sm text-zinc-500 ml-4 max-w-xl">{subtext}</p>
      </div>

      {/* Location filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-8 pb-4 border-b border-zinc-200">
        <Link
          href="/news"
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !activeLocation
              ? 'bg-black text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          All Regions
        </Link>
        {LOCATIONS.map((loc) => (
          <Link
            key={loc.value}
            href={`/news?location=${loc.value}`}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeLocation === loc.value
                ? 'bg-black text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {loc.label}
          </Link>
        ))}
      </div>

      {/* Search + Articles grid */}
      <NewsSearchBar articles={articles} activeLocation={activeLocation} />
    </div>
  )
}

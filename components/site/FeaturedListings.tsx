import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import type { FeaturedListing } from '@/types'

interface FeaturedListingsProps {
  listings: FeaturedListing[]
}

// Placeholder shown when a listing has no image yet
function PlaceholderCard({ listing }: { listing: FeaturedListing }) {
  return (
    <a
      href={listing.cta_url ?? '#'}
      target={listing.cta_url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-200 min-h-[200px] p-6 hover:border-[#00cc6a]/60 transition-colors"
    >
      {/* Decorative rings */}
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />

      {/* Sponsor label */}
      <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">
        {listing.sponsor_label}
      </span>

      {/* CTA icon */}
      {listing.cta_url && (
        <ExternalLink className="absolute top-4 right-4 h-3.5 w-3.5 text-zinc-600 group-hover:text-[#00cc6a] transition-colors" />
      )}

      {/* Content */}
      <div>
        <p className="text-base font-black text-white mb-1 group-hover:text-[#00cc6a] transition-colors">
          {listing.title}
        </p>
        {listing.tagline && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{listing.tagline}</p>
        )}
      </div>
    </a>
  )
}

function PhotoCard({ listing }: { listing: FeaturedListing }) {
  return (
    <a
      href={listing.cta_url ?? '#'}
      target={listing.cta_url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-end overflow-hidden rounded-xl min-h-[200px] hover:shadow-lg transition-shadow"
    >
      <Image
        src={listing.image_url!}
        alt={listing.title}
        fill
        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Sponsor label */}
      <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/20 rounded px-1.5 py-0.5 bg-black/40 backdrop-blur-sm">
        {listing.sponsor_label}
      </span>

      {listing.cta_url && (
        <ExternalLink className="absolute top-4 right-4 h-3.5 w-3.5 text-white/60 group-hover:text-white transition-colors" />
      )}

      <div className="relative p-5">
        <p className="text-base font-black text-white mb-1">{listing.title}</p>
        {listing.tagline && (
          <p className="text-xs text-white/70 leading-relaxed line-clamp-2">{listing.tagline}</p>
        )}
      </div>
    </a>
  )
}

// Promotional placeholder — shown when no listings are published yet
function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
      <div className="shrink-0 text-center">
        <div className="text-4xl font-black text-zinc-200">AD</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Your Space</div>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-1">Featured Partner</p>
        <p className="text-lg font-black text-zinc-900 mb-1">Reach Northern Luzon&apos;s Innovation Community</p>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
          Feature your organization, program, or product prominently on the Amianan Ventures homepage. Seen by founders, investors, and ecosystem builders across the region.
        </p>
        <a
          href="/partner"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#00a855] hover:underline"
        >
          Learn about partnerships <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  if (listings.length === 0) {
    return (
      <section className="py-6 border-t border-zinc-100">
        <PromoBanner />
      </section>
    )
  }

  return (
    <section className="py-6 border-t border-zinc-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-[#00cc6a] rounded-full shrink-0" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-800">Featured Partners</span>
      </div>
      <div className={`grid gap-4 ${listings.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {listings.map((listing) =>
          listing.image_url ? (
            <PhotoCard key={listing.id} listing={listing} />
          ) : (
            <PlaceholderCard key={listing.id} listing={listing} />
          )
        )}
      </div>
    </section>
  )
}

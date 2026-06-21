import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { getFeaturedListings } from '@/lib/queries'

// Single ad slot shown inside an article — picks one published featured
// listing at random per request, or a "your space" promo when none exist.
export async function ArticleAd() {
  const listings = await getFeaturedListings().catch(() => [])
  const listing = listings.length > 0 ? listings[Math.floor(Math.random() * listings.length)] : null

  if (!listing) {
    return (
      <div className="my-8 relative overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="shrink-0 text-center">
          <div className="text-4xl font-black text-zinc-200">AD</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Your Space</div>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-1">Sponsor This Article</p>
          <p className="text-lg font-black text-zinc-900 mb-1">Reach Northern Luzon&apos;s Innovation Community</p>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
            Feature your organization, program, or product alongside our stories. Seen by founders, investors, and ecosystem builders across the region.
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

  return (
    <a
      href={listing.cta_url ? `/api/featured-listings/click?id=${listing.id}` : '#'}
      target={listing.cta_url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="my-8 group relative flex flex-col justify-end overflow-hidden rounded-xl min-h-[160px] border border-zinc-200 hover:shadow-lg transition-shadow"
    >
      {listing.image_url ? (
        <>
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
        </>
      ) : (
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6">
          <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">
            {listing.sponsor_label}
          </span>
          {listing.cta_url && (
            <ExternalLink className="absolute top-4 right-4 h-3.5 w-3.5 text-zinc-600 group-hover:text-[#00cc6a] transition-colors" />
          )}
          <p className="text-base font-black text-white mb-1 group-hover:text-[#00cc6a] transition-colors">{listing.title}</p>
          {listing.tagline && (
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{listing.tagline}</p>
          )}
        </div>
      )}
    </a>
  )
}

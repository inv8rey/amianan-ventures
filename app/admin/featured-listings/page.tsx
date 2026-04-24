import Link from 'next/link'
import { PlusCircle, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { FeaturedListing } from '@/types'

export default async function FeaturedListingsAdminPage() {
  const supabase = await createClient()
  const { data: listings } = await supabase
    .from('featured_listings')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Featured Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">Sponsored / partner photo cards shown on the homepage</p>
        </div>
        <Link
          href="/admin/featured-listings/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> New Listing
        </Link>
      </div>

      {!listings?.length ? (
        <div className="rounded-lg border border-border/40 bg-card p-12 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground mb-1">No featured listings yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first sponsored or partner listing to display it on the homepage.</p>
          <Link href="/admin/featured-listings/new" className="text-xs text-primary hover:underline font-medium">
            Create a listing →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
          <div className="divide-y divide-border/40">
            {(listings as FeaturedListing[]).map((listing) => (
              <Link
                key={listing.id}
                href={`/admin/featured-listings/${listing.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-16 h-10 rounded overflow-hidden bg-muted border border-border/40">
                  {listing.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{listing.title}</p>
                  {listing.tagline && (
                    <p className="text-xs text-muted-foreground truncate">{listing.tagline}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">Order: {listing.display_order}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    listing.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

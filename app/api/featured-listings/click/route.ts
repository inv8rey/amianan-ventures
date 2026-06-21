import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Redirect-through endpoint for Featured Listing CTAs — increments the
// listing's click count (service role, bypasses RLS) then redirects to
// the real destination. Used instead of a client-side onClick handler so
// FeaturedListings/ArticleAd can stay server components.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!id || !url || !serviceKey) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

  const { data: listing } = await supabase
    .from('featured_listings')
    .select('cta_url')
    .eq('id', id)
    .single()

  if (!listing?.cta_url) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  await supabase.rpc('increment_featured_listing_clicks', { listing_id: id })

  return NextResponse.redirect(listing.cta_url)
}

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeaturedListingForm } from '@/components/admin/FeaturedListingForm'
import type { FeaturedListing } from '@/types'

export default async function EditFeaturedListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('featured_listings').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Featured Listing</h1>
      <FeaturedListingForm listing={data as FeaturedListing} />
    </div>
  )
}

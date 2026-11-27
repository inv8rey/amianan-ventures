import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OpportunityForm } from '@/components/admin/OpportunityForm'
import type { Opportunity } from '@/types/opportunities'

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('opportunities').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Opportunity</h1>
      <OpportunityForm opportunity={data as Opportunity} />
    </div>
  )
}

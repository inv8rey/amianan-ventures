import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResourceForm } from '@/components/admin/ResourceForm'
import type { FounderResource } from '@/types/resources'

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: resource } = await supabase
    .from('founder_resources')
    .select('*')
    .eq('id', id)
    .single()

  if (!resource) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Resource</h1>
      <ResourceForm resource={resource as FounderResource} />
    </div>
  )
}

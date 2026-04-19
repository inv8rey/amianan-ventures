import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventForm } from '@/components/admin/EventForm'
import type { Event } from '@/types'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <EventForm event={event as Event} />
    </div>
  )
}

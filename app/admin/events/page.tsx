import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { EventsBulkTable } from '@/components/admin/EventsBulkTable'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date, location, status')
    .order('date', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-xs text-muted-foreground mt-1">{events?.length ?? 0} total</p>
        </div>
        <Link href="/admin/events/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <PlusCircle className="h-4 w-4 mr-1.5" /> New Event
        </Link>
      </div>

      <EventsBulkTable events={events ?? []} />
    </div>
  )
}

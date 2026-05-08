import type { Metadata } from 'next'
import { EventsCalendar } from '@/components/site/EventsCalendar'
import { getPublishedEvents } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming innovation workshops, conferences, and community gatherings across Northern Luzon.',
}

export const revalidate = 60

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getPublishedEvents(true),
    getPublishedEvents(false),
  ])

  // Merge and deduplicate all events
  const seen = new Set<string>()
  const allEvents = [...upcoming, ...past].filter((e) => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-emerald-400 rounded-full" />
          <h1 className="text-3xl font-bold">Events</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-4">
          Innovation workshops, conferences, and gatherings across Northern Luzon
        </p>
      </div>

      <EventsCalendar events={allEvents} />
    </div>
  )
}

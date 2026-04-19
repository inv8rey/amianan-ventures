import type { Metadata } from 'next'
import { EventCard } from '@/components/site/EventCard'
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

  const pastOnly = past.filter(
    (e) => !upcoming.find((u) => u.id === e.id)
  )

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

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <section className="mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2 mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 text-muted-foreground border border-border/40 rounded-xl mb-14">
          <p className="text-lg">No upcoming events at the moment.</p>
          <p className="text-sm mt-1">Check back soon for new events.</p>
        </div>
      )}

      {/* Past events */}
      {pastOnly.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2 mb-6">
            Past Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastOnly.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

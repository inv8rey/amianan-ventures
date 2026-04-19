import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, MapPin, ExternalLink } from 'lucide-react'
import { getEventBySlug } from '@/lib/queries'
import { createBuildClient } from '@/lib/supabase/build'

export const revalidate = 60

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http')) return []
  const supabase = createBuildClient()
  const { data } = await supabase
    .from('events')
    .select('slug')
    .eq('status', 'published')
  return (data ?? []).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return {}

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      type: 'article',
      images: event.cover_image ? [{ url: event.cover_image }] : [],
    },
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const dateStr = format(new Date(event.date), 'EEEE, MMMM d, yyyy')
  const timeStr = format(new Date(event.date), 'h:mm a')
  const endDateStr = event.end_date
    ? format(new Date(event.end_date), 'MMMM d, yyyy · h:mm a')
    : null
  const isPast = new Date(event.date) < new Date()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.date,
    endDate: event.end_date ?? undefined,
    location: { '@type': 'Place', name: event.location },
    image: event.cover_image ?? undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Amianan Ventures',
      url: 'https://amiananventures.org',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Events
        </Link>

        {event.cover_image && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-muted">
            <Image
              src={event.cover_image}
              alt={event.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
            {isPast && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-black/70 text-white text-sm px-4 py-2 rounded-full">
                  Past Event
                </span>
              </div>
            )}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
          {event.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">{event.description}</p>

        {/* Event details card */}
        <div className="rounded-lg border border-border/40 bg-card p-5 mb-8 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">{dateStr}</p>
              <p className="text-muted-foreground">{timeStr}{endDateStr ? ` → ${endDateStr}` : ''}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">{event.location}</p>
              {event.event_url && (
                <a
                  href={event.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs flex items-center gap-1 mt-0.5"
                >
                  Event page <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {event.content && (
          <div
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        )}
      </div>
    </>
  )
}

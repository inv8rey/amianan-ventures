import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Calendar, MapPin } from 'lucide-react'
import type { Event } from '@/types'

export function EventCard({ event }: { event: Event }) {
  const href = `/events/${event.slug}`
  const dateStr = format(new Date(event.date), 'EEE, MMM d, yyyy')
  const timeStr = format(new Date(event.date), 'h:mm a')
  const isPast = new Date(event.date) < new Date()

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="relative aspect-video bg-zinc-100 overflow-hidden">
        {event.cover_image ? (
          <Image
            src={event.cover_image}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
            <Calendar className="h-10 w-10 text-zinc-300" />
          </div>
        )}
        {isPast && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] bg-zinc-800 text-white px-2 py-0.5 rounded font-semibold">Past</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#00a855] transition-colors line-clamp-2 leading-snug mb-3">
          {event.title}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {event.description}
        </p>
        <div className="space-y-1.5 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#00cc6a] shrink-0" />
            <span>{dateStr} · {timeStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#00cc6a] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

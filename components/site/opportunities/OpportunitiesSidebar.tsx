import Link from 'next/link'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { splitFeatured } from '@/lib/opportunities'
import type { Opportunity } from '@/types/opportunities'
import { FeaturedOpportunityCard, OpportunityCard } from './OpportunityCards'

export function OpportunitiesSidebar({
  items,
  isSample,
  now,
}: {
  items: Opportunity[]
  isSample: boolean
  now: number
}) {
  const { featured, rest } = splitFeatured(items)

  return (
    <section aria-labelledby="opportunities-heading">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#befc65]">
          <CalendarClock className="h-5 w-5 text-[#131314]" aria-hidden />
        </span>
        <div>
          <h2 id="opportunities-heading" className="font-editorial font-bold text-[2.1rem] leading-none text-[#131314]">
            Opportunities
          </h2>
          <p className="mt-2 text-sm text-zinc-600">Deadlines coming up for founders and innovators.</p>
        </div>
      </div>

      {isSample && (
        <p className="mt-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Development sample data. Add real opportunities in the admin; samples never show in production.
        </p>
      )}

      {featured ? (
        <div className="mt-6 space-y-3">
          <FeaturedOpportunityCard opportunity={featured} now={now} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
            {rest.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} now={now} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
          No open calls right now. New grants, competitions and programs are added as they are announced.
        </div>
      )}

      <Link
        href="/opportunities"
        className="mt-5 flex items-center justify-center gap-2 rounded-full border border-[#131314] px-5 py-3 text-sm font-semibold text-[#131314] transition-colors hover:bg-[#befc65] hover:border-[#befc65]"
      >
        View all opportunities <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  )
}

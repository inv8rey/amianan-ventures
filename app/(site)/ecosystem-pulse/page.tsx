import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowRight, BarChart3 } from 'lucide-react'
import { getPublishedReports } from '@/lib/reports'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Ecosystem Insights',
  description: 'Research, data and trends on startup and innovation ecosystems, starting with our home in Northern Luzon.',
}

export default async function EcosystemInsightsPage() {
  const reports = await getPublishedReports()

  return (
    <div className="bg-[#f7f7f1]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <header className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#131314]">
            <span className="h-3.5 w-1 rounded-full bg-[#befc65]" aria-hidden />
            Ecosystem Insights
          </p>
          <h1 className="mt-2 font-editorial text-[2.5rem] font-bold leading-[1.02] text-[#131314] sm:text-[3.4rem]">
            Research on how ventures grow.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:text-[17px]">
            Data, trends, and insights on startup and innovation ecosystems, starting with our home in Northern Luzon, for founders,
            policymakers, and builders.
          </p>
        </header>

        {reports.length > 0 ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <article key={r.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
                <Link href={`/ecosystem-pulse/${r.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[16/9] bg-[#131314]">
                  {r.cover_image_url ? (
                    <Image src={r.cover_image_url} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <BarChart3 className="h-10 w-10 text-[#befc65]" strokeWidth={1.4} />
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  {r.published_at && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      {format(new Date(r.published_at), 'MMM d, yyyy')}
                    </p>
                  )}
                  <h2 className="mt-2 font-editorial text-[1.3rem] font-bold leading-snug text-[#131314]">
                    <Link href={`/ecosystem-pulse/${r.slug}`} className="decoration-[#befc65] decoration-2 underline-offset-4 hover:underline">
                      {r.title}
                    </Link>
                  </h2>
                  {r.description && <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-zinc-600">{r.description}</p>}
                  <Link
                    href={`/ecosystem-pulse/${r.slug}`}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 border-b-2 border-[#befc65] pb-0.5 pt-4 text-sm font-semibold text-[#131314]"
                  >
                    Read the report <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-9 rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-zinc-400" strokeWidth={1.4} aria-hidden />
            <p className="mt-3 font-editorial text-xl font-bold text-[#131314]">Our first reports are on the way.</p>
            <p className="mt-1 text-sm text-zinc-600">In the meantime, explore the latest news and open opportunities.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/news" className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold hover:border-[#131314]">Read the news</Link>
              <Link href="/opportunities" className="rounded-full bg-[#131314] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a2a2c]">See opportunities</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

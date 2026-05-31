import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { DownloadGate } from './DownloadGate'

export const dynamic = 'force-dynamic'

async function getReport(slug: string) {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('ecosystem_reports')
      .select('id, title, slug, description, cover_image_url, published_at')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const report = await getReport(slug)
  if (!report) return { title: 'Not Found' }
  return {
    title: `${report.title} — Ecosystem Pulse · Amianan Ventures`,
    description: report.description ?? undefined,
    openGraph: {
      title: report.title,
      description: report.description ?? undefined,
      ...(report.cover_image_url ? { images: [{ url: report.cover_image_url }] } : {}),
    },
  }
}

export default async function EcosystemPulseDownloadPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const report = await getReport(slug)
  if (!report) notFound()

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mb-8 uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Amianan Ventures
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 xl:gap-14">

          {/* Left — report info */}
          <div>
            {/* Label */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#00a855] mb-4">
              <BarChart2 className="h-3.5 w-3.5" />
              Ecosystem Pulse
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight tracking-tight mb-4">
              {report.title}
            </h1>

            {report.published_at && (
              <p className="text-xs text-zinc-400 mb-6">
                Published {format(new Date(report.published_at), 'MMMM yyyy')}
              </p>
            )}

            {/* Cover image */}
            {report.cover_image_url && (
              <div className="relative w-full rounded-2xl overflow-hidden mb-6 shadow-sm" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={report.cover_image_url}
                  alt={report.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                  unoptimized
                />
              </div>
            )}

            {/* Description */}
            {report.description && (
              <div className="space-y-4">
                {report.description
                  .split(/\n\n|\n/)
                  .map((para: string) => para.trim())
                  .filter(Boolean)
                  .map((para: string, i: number) => (
                    <p key={i} className="text-base text-zinc-600 leading-relaxed">
                      {para}
                    </p>
                  ))}
              </div>
            )}

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00cc6a]" />
                Free to download
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00cc6a]" />
                Original research
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00cc6a]" />
                Northern Luzon focused
              </span>
            </div>
          </div>

          {/* Right — download gate */}
          <div className="lg:pt-16">
            <DownloadGate reportId={report.id} reportTitle={report.title} />
          </div>
        </div>
      </div>
    </div>
  )
}

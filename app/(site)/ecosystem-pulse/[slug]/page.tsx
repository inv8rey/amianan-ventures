import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, BarChart2, FileText, BookOpen, MapPin, User } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { DownloadGate } from './DownloadGate'

export const dynamic = 'force-dynamic'

async function getReport(slug: string) {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('ecosystem_reports')
      .select('id, title, slug, description, cover_image_url, published_at, author')
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

  const author = (report.author as string | null) ?? 'Amianan Ventures Research'

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero band ── */}
      <div className="bg-[#042212]">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-12 lg:py-16">

          {/* Back link — explicit white so global heading styles don't bleed */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold !text-white/40 hover:!text-white/80 transition-colors mb-8 uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <ArrowLeft className="h-3 w-3" /> Amianan Ventures
          </Link>

          {/* Series label */}
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="h-4 w-4 text-[#00cc6a]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00cc6a]">
              Ecosystem Pulse
            </span>
          </div>

          {/* Title — must override global h1 { color: text-foreground } */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight max-w-3xl mb-5"
            style={{ color: '#ffffff' }}
          >
            {report.title}
          </h1>

          {/* Author + meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <User className="h-3 w-3" />
              {author}
            </span>

            <span className="w-px h-3 bg-white/20 hidden sm:block" />

            {report.published_at && (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00cc6a]" />
                Published {format(new Date(report.published_at), 'MMMM yyyy')}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#00cc6a]" />
              Free to download
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#00cc6a]" />
              Original research
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Northern Luzon
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 xl:gap-20">

          {/* Left */}
          <div className="min-w-0">

            {report.cover_image_url && (
              <div className="relative w-full rounded-2xl overflow-hidden mb-10 shadow-md border border-zinc-100" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={report.cover_image_url}
                  alt={report.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                  unoptimized
                />
              </div>
            )}

            {report.description && (
              <>
                <div className="mb-5 flex items-center gap-2">
                  <span className="w-0.5 h-5 bg-[#00cc6a] rounded-full" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    About this report
                  </span>
                </div>

                <div className="space-y-5">
                  {report.description
                    .split(/\n\n|\n/)
                    .map((para: string) => para.trim())
                    .filter(Boolean)
                    .map((para: string, i: number) => (
                      <p key={i} className="text-base sm:text-[17px] text-zinc-600 leading-relaxed">
                        {para}
                      </p>
                    ))}
                </div>
              </>
            )}

            <div className="mt-10 pt-8 border-t border-zinc-100">
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4">What's inside</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: FileText,  label: 'Full PDF Report' },
                  { icon: BarChart2, label: 'Data & Charts' },
                  { icon: BookOpen,  label: 'Strategic Insights' },
                  { icon: MapPin,    label: 'Northern Luzon Focus' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-600">
                    <Icon className="h-3 w-3 text-[#00a855]" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — sticky form */}
          <div>
            <div className="sticky top-6">
              <DownloadGate reportId={report.id} reportTitle={report.title} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

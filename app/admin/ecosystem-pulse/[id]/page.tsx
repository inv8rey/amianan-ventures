import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { ReportForm } from '../ReportForm'

export const dynamic = 'force-dynamic'

async function getReport(id: string) {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('ecosystem_reports')
      .select('*')
      .eq('id', id)
      .single()
    return data
  } catch {
    return null
  }
}

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getReport(id)
  if (!report) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/ecosystem-pulse" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mb-6 uppercase tracking-wider">
        <ArrowLeft className="h-3.5 w-3.5" /> Ecosystem Pulse
      </Link>
      <h1 className="text-xl font-bold mb-6">Edit Report</h1>
      <ReportForm initial={{
        id: report.id,
        title: report.title,
        slug: report.slug,
        description: report.description ?? '',
        cover_image_url: report.cover_image_url ?? '',
        file_url: report.file_url,
        is_published: report.is_published,
        published_at: report.published_at,
      }} />
    </div>
  )
}

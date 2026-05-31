import Link from 'next/link'
import { Plus, BarChart2, Download } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getReports() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('ecosystem_reports')
      .select('id, title, slug, is_published, published_at, created_at')
      .order('created_at', { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

async function getDownloadCounts() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('report_downloads')
      .select('report_id')
    const counts: Record<string, number> = {}
    for (const d of data ?? []) {
      counts[d.report_id] = (counts[d.report_id] ?? 0) + 1
    }
    return counts
  } catch {
    return {} as Record<string, number>
  }
}

export default async function EcosystemPulseAdmin() {
  const [reports, downloadCounts] = await Promise.all([getReports(), getDownloadCounts()])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[#00a855]" />
            Ecosystem Pulse
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Research reports with gated downloads</p>
        </div>
        <Link
          href="/admin/ecosystem-pulse/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl border-zinc-200">
          <BarChart2 className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">No reports yet</p>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Create your first Ecosystem Pulse report to start capturing leads.</p>
          <Link
            href="/admin/ecosystem-pulse/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create Report
          </Link>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Downloads</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-800 line-clamp-1">{r.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">/ecosystem-pulse/{r.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${r.is_published ? 'bg-[#00a855]/10 text-[#00a855]' : 'bg-zinc-100 text-zinc-500'}`}>
                      {r.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm font-semibold text-zinc-700">
                      <Download className="h-3.5 w-3.5 text-zinc-400" />
                      {downloadCounts[r.id] ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {r.published_at ? format(new Date(r.published_at), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/ecosystem-pulse/${r.id}`}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

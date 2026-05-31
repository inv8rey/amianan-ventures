import Link from 'next/link'
import { ArrowLeft, Download, Users, Mail, Building2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

async function getData(reportId: string) {
  try {
    const supabase = createServiceClient()
    const [{ data: report }, { data: leads }] = await Promise.all([
      supabase
        .from('ecosystem_reports')
        .select('id, title, slug')
        .eq('id', reportId)
        .single(),
      supabase
        .from('report_downloads')
        .select('id, name, organization, email, downloaded_at')
        .eq('report_id', reportId)
        .order('downloaded_at', { ascending: false }),
    ])
    return { report, leads: leads ?? [] }
  } catch {
    return { report: null, leads: [] }
  }
}

export default async function ReportLeadsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { report, leads } = await getData(id)
  if (!report) notFound()

  // Group by organization for a quick summary
  const orgCounts: Record<string, number> = {}
  for (const l of leads) {
    const key = l.organization?.trim() || 'No organization'
    orgCounts[key] = (orgCounts[key] ?? 0) + 1
  }
  const topOrgs = Object.entries(orgCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/admin/ecosystem-pulse/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mb-4 uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {report.title}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Download Leads</h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-sm">{report.title}</p>
          </div>
          {leads.length > 0 && (
            <a
              href={`/api/ecosystem-pulse/export?reportId=${id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-200 text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border border-zinc-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Leads</span>
          </div>
          <p className="text-2xl font-black text-zinc-900">{leads.length}</p>
        </div>
        <div className="border border-zinc-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Organizations</span>
          </div>
          <p className="text-2xl font-black text-zinc-900">
            {Object.keys(orgCounts).filter((k) => k !== 'No organization').length}
          </p>
        </div>
        <div className="border border-zinc-200 rounded-xl p-4 bg-white col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Latest</span>
          </div>
          <p className="text-sm font-bold text-zinc-700 truncate">
            {leads[0] ? format(new Date(leads[0].downloaded_at), 'MMM d, yyyy') : '—'}
          </p>
        </div>
      </div>

      {/* Top orgs */}
      {topOrgs.length > 0 && (
        <div className="border border-zinc-200 rounded-xl p-4 bg-white">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Top Organizations</p>
          <div className="flex flex-wrap gap-2">
            {topOrgs.map(([org, count]) => (
              <span key={org} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
                {org}
                <span className="text-[10px] font-bold text-zinc-400">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leads table */}
      {leads.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl border-zinc-200">
          <Users className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-400">No downloads yet</p>
          <p className="text-xs text-zinc-400 mt-1">Leads will appear here once visitors request the report.</p>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Organization</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-800">{lead.name}</td>
                  <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">
                    {lead.organization || <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${lead.email}`} className="text-[#00a855] hover:underline text-xs">
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400 hidden md:table-cell">
                    {format(new Date(lead.downloaded_at), 'MMM d, yyyy · h:mm a')}
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

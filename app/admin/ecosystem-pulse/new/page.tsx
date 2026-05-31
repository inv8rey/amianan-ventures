import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ReportForm } from '../ReportForm'

export default function NewReportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/ecosystem-pulse" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mb-6 uppercase tracking-wider">
        <ArrowLeft className="h-3.5 w-3.5" /> Ecosystem Pulse
      </Link>
      <h1 className="text-xl font-bold mb-6">New Report</h1>
      <ReportForm initial={{}} />
    </div>
  )
}

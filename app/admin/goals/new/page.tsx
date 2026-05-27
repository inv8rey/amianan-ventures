import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ObjectiveEditor } from '../[id]/ObjectiveEditor'

export default function NewObjectivePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/goals"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Goals
      </Link>
      <h1 className="text-xl font-bold mb-6">New Objective</h1>
      <ObjectiveEditor objective={null} />
    </div>
  )
}

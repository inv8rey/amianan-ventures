import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { ObjectiveEditor } from './ObjectiveEditor'

export const dynamic = 'force-dynamic'

async function getObjective(id: string) {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('objectives')
      .select(`
        id, title, description, quarter, status,
        key_results (
          id, title, target_type, target_value, current_value, unit, sort_order
        )
      `)
      .eq('id', id)
      .single()
    return data
  } catch {
    return null
  }
}

export default async function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const objective = await getObjective(id)
  if (!objective) notFound()

  const sortedKRs = [...(objective.key_results ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/goals"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Goals
      </Link>

      <ObjectiveEditor objective={{ ...objective, key_results: sortedKRs }} />
    </div>
  )
}

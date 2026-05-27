import Link from 'next/link'
import { Plus, Target } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { ObjectiveCard } from './ObjectiveCard'

export const dynamic = 'force-dynamic'

async function getObjectives() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('objectives')
      .select(`
        id, title, description, quarter, status,
        key_results (
          id, title, target_type, target_value, current_value, unit
        )
      `)
      .order('created_at', { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

export default async function GoalsPage() {
  const objectives = await getObjectives()

  const active = objectives.filter((o) => o.status === 'active')
  const completed = objectives.filter((o) => o.status === 'completed')
  const cancelled = objectives.filter((o) => o.status === 'cancelled')

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-[#00a855]" />
            Goals & OKRs
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track objectives and key results for Amianan Ventures
          </p>
        </div>
        <Link
          href="/admin/goals/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Objective
        </Link>
      </div>

      {objectives.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl border-zinc-200">
          <Target className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-500">No objectives yet</p>
          <p className="text-xs text-zinc-400 mt-1 mb-4">Create your first OKR to start tracking progress.</p>
          <Link
            href="/admin/goals/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Objective
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Active</h2>
              <div className="space-y-4">
                {active.map((obj) => (
                  <ObjectiveCard key={obj.id} objective={obj} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Completed</h2>
              <div className="space-y-4">
                {completed.map((obj) => (
                  <ObjectiveCard key={obj.id} objective={obj} />
                ))}
              </div>
            </section>
          )}

          {cancelled.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Cancelled</h2>
              <div className="space-y-4">
                {cancelled.map((obj) => (
                  <ObjectiveCard key={obj.id} objective={obj} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

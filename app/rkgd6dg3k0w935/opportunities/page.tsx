import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { formatDeadlineFull, requestTime } from '@/lib/countdown'
import { OPPORTUNITY_CATEGORY_LABELS } from '@/types/opportunities'
import type { Opportunity } from '@/types/opportunities'

export default async function AdminOpportunitiesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, category, organization, deadline, status, featured')
    .order('deadline', { ascending: true })

  const rows = (data ?? []) as Pick<Opportunity, 'id' | 'title' | 'category' | 'organization' | 'deadline' | 'status' | 'featured'>[]
  const now = requestTime()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {rows.length} total · deadlines shown in Philippine Standard Time
          </p>
        </div>
        <Link href="/rkgd6dg3k0w935/opportunities/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <PlusCircle className="h-4 w-4 mr-1.5" /> New Opportunity
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700">
          The opportunities table isn&rsquo;t set up yet. Run <code>opportunities-schema.sql</code> in the Supabase SQL Editor.
        </p>
      )}

      <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Deadline</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((o) => {
              const closed = Date.parse(o.deadline) <= now
              return (
                <tr key={o.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    <Link href={`/rkgd6dg3k0w935/opportunities/${o.id}`} className="font-medium hover:underline">
                      {o.title}
                      {o.featured && <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600 font-semibold">Featured</span>}
                    </Link>
                    <p className="text-xs text-muted-foreground">{o.organization}</p>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{OPPORTUNITY_CATEGORY_LABELS[o.category]}</td>
                  <td className={cn('px-4 py-2.5', closed ? 'text-muted-foreground line-through' : '')}>
                    {formatDeadlineFull(o.deadline)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                      closed
                        ? 'bg-zinc-500/10 text-zinc-600'
                        : o.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    )}>
                      {closed ? 'Closed' : o.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No opportunities yet. Add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

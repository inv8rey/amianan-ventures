import Link from 'next/link'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { ImageIcon } from 'lucide-react'
import {
  STATUS_LABELS, STATUS_COLORS,
  type SpotlightApplication, type SpotlightStatus,
} from '@/types/spotlight'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all',               label: 'All' },
  { value: 'submitted',         label: 'Submitted' },
  { value: 'under_review',      label: 'Under Review' },
  { value: 'approved',          label: 'Approved' },
  { value: 'rejected',          label: 'Rejected' },
  { value: 'awaiting_payment',  label: 'Awaiting Payment' },
  { value: 'payment_submitted', label: 'Payment Submitted' },
  { value: 'paid',              label: 'Paid' },
  { value: 'in_production',     label: 'In Production' },
  { value: 'published',         label: 'Published' },
]

export default async function AdminSpotlightPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const activeFilter = filterStatus ?? 'all'

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createAdminClient(url, serviceKey, { auth: { persistSession: false } })

  const { count: unreviewed } = await supabase
    .from('spotlight_applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')

  let query = supabase
    .from('spotlight_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    query = query.eq('status', activeFilter)
  }

  const { data } = await query
  const items = (data ?? []) as SpotlightApplication[]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Get Featured</h1>
        {!!unreviewed && unreviewed > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold">
            {unreviewed} new
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">{items.length} application{items.length !== 1 ? 's' : ''} shown</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/admin/spotlight' : `/admin/spotlight?status=${f.value}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === f.value ? 'bg-black text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Business</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((app) => {
                const status = app.status as SpotlightStatus
                return (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(app.created_at), 'MMM d')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/30" />
                        </div>
                        <p className="font-medium line-clamp-1 text-sm">{app.business_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                      {app.contact_name}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                      ₱{app.amount_php.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/spotlight/${app.id}`} className="text-xs font-semibold text-primary hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No applications {activeFilter !== 'all' ? `with status "${activeFilter}"` : 'yet'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

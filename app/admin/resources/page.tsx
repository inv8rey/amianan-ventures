import Link from 'next/link'
import { PlusCircle, Download } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export default async function AdminResourcesPage() {
  const supabase = await createClient()
  const { data: resources } = await supabase
    .from('founder_resources')
    .select('id, title, category, format, status, featured, download_count')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Founder Resources</h1>
          <p className="text-xs text-muted-foreground mt-1">{resources?.length ?? 0} total</p>
        </div>
        <Link href="/admin/resources/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <PlusCircle className="h-4 w-4 mr-1.5" /> New Resource
        </Link>
      </div>

      <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Format</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Downloads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {(resources ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/resources/${r.id}`} className="font-medium hover:underline">
                    {r.title}
                    {r.featured && <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600 font-semibold">Featured</span>}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.category}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.format}</td>
                <td className="px-4 py-2.5">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                    r.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  )}>
                    {r.status === 'published' ? 'Published' : 'Coming Soon'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Download className="h-3 w-3" /> {r.download_count}
                  </span>
                </td>
              </tr>
            ))}
            {(!resources || resources.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No resources yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

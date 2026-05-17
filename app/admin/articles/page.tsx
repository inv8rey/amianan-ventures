import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ArticlesBulkTable } from '@/components/admin/ArticlesBulkTable'

// Auto-publish any scheduled articles whose time has passed.
// Uses the authenticated admin session — no service key required.
async function autoPublishDue() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: due, error: fetchErr } = await supabase
    .from('articles')
    .select('id, slug, category')
    .eq('status', 'scheduled')
    .lte('published_at', now)

  if (fetchErr) { console.error('[autoPublish] fetch error:', fetchErr.message); return 0 }
  if (!due || due.length === 0) return 0

  const { error: updateErr } = await supabase
    .from('articles')
    .update({ status: 'published' })
    .in('id', due.map((a) => a.id))

  if (updateErr) { console.error('[autoPublish] update error:', updateErr.message); return 0 }

  revalidatePath('/news')
  revalidatePath('/founder-stories')
  revalidatePath('/')
  for (const a of due) revalidatePath(`/${a.category}/${a.slug}`)

  console.log(`[autoPublish] published ${due.length} article(s)`)
  return due.length
}

export default async function AdminArticlesPage() {
  // Fire auto-publish before fetching so the table shows correct statuses.
  const justPublished = await autoPublishDue()

  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, category, status, featured, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      {justPublished > 0 && (
        <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 font-medium">
          ✓ {justPublished} scheduled article{justPublished > 1 ? 's' : ''} just went live.
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-xs text-muted-foreground mt-1">{articles?.length ?? 0} total</p>
        </div>
        <Link href="/admin/articles/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <PlusCircle className="h-4 w-4 mr-1.5" /> New Article
        </Link>
      </div>

      <ArticlesBulkTable articles={articles ?? []} />
    </div>
  )
}

import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { ArticlesBulkTable } from '@/components/admin/ArticlesBulkTable'

// Auto-publish any scheduled articles whose time has passed.
// Runs silently every time an admin loads this page — no cron needed.
async function autoPublishDue() {
  try {
    const supabase = createServiceClient()
    const now = new Date().toISOString()
    const { data: due } = await supabase
      .from('articles')
      .select('id, slug, category')
      .eq('status', 'scheduled')
      .lte('published_at', now)
    if (!due || due.length === 0) return
    await supabase.from('articles').update({ status: 'published' }).in('id', due.map((a) => a.id))
    revalidatePath('/news')
    revalidatePath('/founder-stories')
    revalidatePath('/')
    for (const a of due) revalidatePath(`/${a.category}/${a.slug}`)
  } catch {
    // fail silently — don't break the admin page
  }
}

export default async function AdminArticlesPage() {
  // Fire auto-publish check before fetching the list so the table reflects
  // the updated statuses immediately.
  await autoPublishDue()

  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, category, status, featured, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
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

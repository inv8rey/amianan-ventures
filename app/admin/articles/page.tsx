import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { ArticlesBulkTable } from '@/components/admin/ArticlesBulkTable'

export default async function AdminArticlesPage() {
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

import { createServiceClient } from '@/lib/supabase/service'
import { CommentsModerationTable } from '@/components/admin/CommentsModerationTable'

export const dynamic = 'force-dynamic'

export default async function CommentsAdminPage() {
  const supabase = createServiceClient()

  const { data: comments } = await supabase
    .from('article_comments')
    .select('id, article_type, article_id, author_name, author_email, content, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">Comments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(comments ?? []).length} comment{(comments ?? []).length !== 1 ? 's' : ''} across all articles
          </p>
        </div>
      </div>

      <CommentsModerationTable initialComments={comments ?? []} />
    </div>
  )
}

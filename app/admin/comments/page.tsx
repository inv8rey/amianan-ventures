import { createServiceClient } from '@/lib/supabase/service'
import { CommentsModerationTable } from '@/components/admin/CommentsModerationTable'

export const dynamic = 'force-dynamic'

export default async function CommentsAdminPage() {
  const supabase = createServiceClient()

  const { data: comments } = await supabase
    .from('article_comments')
    .select('id, article_type, article_id, author_name, author_email, content, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const pending   = (comments ?? []).filter(c => c.status === 'pending').length
  const approved  = (comments ?? []).filter(c => c.status === 'approved').length
  const rejected  = (comments ?? []).filter(c => c.status === 'rejected').length

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">Comments</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate reader comments on articles and contributions</p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: pending,  color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { label: 'Approved',       value: approved, color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Rejected',       value: rejected, color: 'text-red-600 bg-red-50 border-red-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg border px-5 py-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-semibold mt-0.5 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <CommentsModerationTable initialComments={comments ?? []} />
    </div>
  )
}

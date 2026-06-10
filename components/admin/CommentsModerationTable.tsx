'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X, Trash2, ExternalLink } from 'lucide-react'

interface Comment {
  id: string
  article_type: string
  article_id: string
  author_name: string
  author_email: string
  content: string
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'text-amber-700 bg-amber-50 border-amber-200',
  approved: 'text-green-700 bg-green-50 border-green-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
}

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const
type Filter = typeof FILTERS[number]

export function CommentsModerationTable({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [filter, setFilter]     = useState<Filter>('pending')
  const [loading, setLoading]   = useState<string | null>(null)

  const filtered = filter === 'all' ? comments : comments.filter(c => c.status === filter)

  function articleUrl(c: Comment) {
    return c.article_type === 'contribution'
      ? `/contributions/${c.article_id}`
      : `/news/${c.article_id}` // slug-based articles
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setLoading(id)
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c))
      }
    } finally {
      setLoading(null)
    }
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment permanently?')) return
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== id))
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {FILTERS.map(f => {
          const count = f === 'all' ? comments.length : comments.filter(c => c.status === f).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {f} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border/40 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No {filter === 'all' ? '' : filter} comments.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Author</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Comment</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">Article</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 whitespace-nowrap">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  {/* Author */}
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-foreground whitespace-nowrap">{c.author_name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.author_email}</p>
                  </td>

                  {/* Comment */}
                  <td className="px-4 py-3 align-top max-w-xs">
                    <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">{c.content}</p>
                  </td>

                  {/* Article link */}
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <a
                      href={articleUrl(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="capitalize">{c.article_type}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <p className="text-xs text-muted-foreground">{format(new Date(c.created_at), 'MMM d, yyyy')}</p>
                    <p className="text-[10px] text-muted-foreground/60">{format(new Date(c.created_at), 'h:mm a')}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_STYLES[c.status] ?? ''}`}>
                      {c.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-1">
                      {c.status !== 'approved' && (
                        <button
                          onClick={() => updateStatus(c.id, 'approved')}
                          disabled={loading === c.id}
                          title="Approve"
                          className="p-1.5 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-40 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {c.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(c.id, 'rejected')}
                          disabled={loading === c.id}
                          title="Reject"
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(c.id)}
                        disabled={loading === c.id}
                        title="Delete"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

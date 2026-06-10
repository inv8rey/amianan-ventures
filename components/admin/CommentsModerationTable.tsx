'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Trash2, ExternalLink, Search } from 'lucide-react'

interface Comment {
  id: string
  article_type: string
  article_id: string
  author_name: string
  author_email: string
  content: string
  created_at: string
}

export function CommentsModerationTable({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch]     = useState('')

  const filtered = search.trim()
    ? comments.filter(c =>
        c.author_name.toLowerCase().includes(search.toLowerCase()) ||
        c.author_email.toLowerCase().includes(search.toLowerCase()) ||
        c.content.toLowerCase().includes(search.toLowerCase())
      )
    : comments

  function articleUrl(c: Comment) {
    return c.article_type === 'contribution'
      ? `/contributions/${c.article_id}`
      : `/news/${c.article_id}`
  }

  async function deleteComment(id: string) {
    if (!confirm('Delete this comment?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' })
      if (res.ok) setComments(prev => prev.filter(c => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or content…"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border/40 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? 'No comments match your search.' : 'No comments yet.'}
          </p>
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
                <th className="w-12" />
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
                  <td className="px-4 py-3 align-top max-w-sm">
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

                  {/* Delete */}
                  <td className="px-4 py-3 align-top text-right">
                    <button
                      onClick={() => deleteComment(c.id)}
                      disabled={deleting === c.id}
                      title="Delete comment"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

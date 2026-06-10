'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Send, CheckCircle2, AlertCircle, User } from 'lucide-react'

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface Props {
  articleType: 'article' | 'contribution'
  articleId: string
}

export function CommentSection({ articleType, articleId }: Props) {
  const [comments, setComments]   = useState<Comment[]>([])
  const [loading, setLoading]     = useState(true)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [content, setContent]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/comments?type=${articleType}&id=${encodeURIComponent(articleId)}`)
      .then(r => r.json())
      .then(d => { setComments(d.comments ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [articleType, articleId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleType,
          articleId,
          authorName: name,
          authorEmail: email,
          content,
        }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
        setName(''); setEmail(''); setContent('')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-16 pt-10 border-t border-zinc-100">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className="h-4 w-4 text-zinc-400" />
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
          {loading ? 'Comments' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
        </h2>
      </div>

      {/* ── Approved comments list ── */}
      {loading ? (
        <div className="space-y-4 mb-10">
          {[1,2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-24 bg-zinc-100 rounded mb-2" />
              <div className="h-3 w-full bg-zinc-100 rounded mb-1" />
              <div className="h-3 w-3/4 bg-zinc-100 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              {/* Avatar */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {c.author_name.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-zinc-900">{c.author_name}</span>
                  <span className="text-[11px] text-zinc-400">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-1 mb-10">
          <p className="text-sm text-zinc-400">No comments yet. Be the first to share your thoughts.</p>
        </div>
      )}

      {/* ── Comment form ── */}
      <div ref={formRef} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="h-3.5 w-3.5 text-zinc-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Leave a Comment</h3>
        </div>

        {submitted ? (
          <div className="flex items-start gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-[#00a855] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-zinc-900">Comment posted!</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Your comment is now live on this article.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-[#00a855] font-semibold mt-3 hover:underline"
              >
                Leave another comment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  maxLength={100}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00a855]/30 focus:border-[#00a855] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                  Email <span className="text-red-400">*</span>
                  <span className="font-normal text-zinc-400 ml-1">(not published)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00a855]/30 focus:border-[#00a855] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                Comment <span className="text-red-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                required
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00a855]/30 focus:border-[#00a855] transition-colors resize-none"
              />
              <p className="text-[11px] text-zinc-400 mt-1 text-right">
                {content.length}/1000
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your comment will appear immediately.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

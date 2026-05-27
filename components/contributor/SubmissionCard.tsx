'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Loader2, Trash2, Undo2, ImageIcon, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import {
  CONTENT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type ContributorSubmission,
  type SubmissionStatus,
} from '@/types/contributor'

interface SubmissionCardProps {
  submission: ContributorSubmission
}

export function SubmissionCard({ submission: sub }: SubmissionCardProps) {
  const router = useRouter()
  const status = sub.status as SubmissionStatus
  const isDraft = status === 'draft'
  const isRevision = status === 'revision_requested'
  const isPublished = status === 'published'
  const isApproved = status === 'approved'
  const isScheduled = isApproved && !!sub.scheduled_for

  // States that allow delete (not published, not approved)
  const canDelete = !isPublished && !isApproved
  // States that allow withdraw (pull back to draft)
  const canWithdraw = status === 'submitted' || status === 'under_review'

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAction(action: 'delete' | 'withdraw') {
    setLoading(true)
    try {
      const res = await fetch('/api/contributor/delete-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: sub.id, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')

      if (action === 'delete') {
        toast.success('Submission deleted')
      } else {
        toast.success('Submission withdrawn — you can edit it as a draft')
      }
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className={`rounded-xl border bg-white transition-colors ${
      isDraft ? 'border-zinc-200 bg-zinc-50/60' :
      isRevision ? 'border-orange-200 bg-orange-50/30' :
      'border-zinc-200'
    }`}>
      <div className="flex items-center gap-3 p-4">
        {/* Cover thumbnail */}
        <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-100">
          {sub.cover_image_url ? (
            <Image
              src={sub.cover_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-zinc-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {CONTENT_TYPE_LABELS[sub.content_type]}
            </span>
            <span className="text-zinc-200">·</span>
            <span className="text-[10px] text-zinc-400">
              {format(new Date(sub.created_at), 'MMM d, yyyy')}
            </span>
            {isScheduled && sub.scheduled_for && (
              <>
                <span className="text-zinc-200">·</span>
                <span className="text-[10px] text-emerald-500 font-semibold">
                  Scheduled {format(new Date(sub.scheduled_for), 'MMM d')}
                </span>
              </>
            )}
          </div>
          <p className={`text-sm font-bold line-clamp-1 ${isDraft ? 'text-zinc-500' : 'text-zinc-900'}`}>
            {sub.headline}
          </p>
        </div>

        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>

        {isPublished && sub.published_url ? (
          <a
            href={sub.published_url}
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#00a855] hover:underline shrink-0"
          >
            Read Live →
          </a>
        ) : isDraft ? (
          <Link
            href={`/submit?edit=${sub.id}`}
            className="text-xs font-bold text-zinc-700 hover:text-black shrink-0"
          >
            Continue →
          </Link>
        ) : (
          <Link
            href={`/submissions/${sub.id}`}
            className={`text-xs font-bold shrink-0 ${
              isRevision ? 'text-orange-600 hover:underline' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {isRevision ? 'View Feedback →' : 'View →'}
          </Link>
        )}
      </div>

      {/* Actions row */}
      {!loading && !confirmDelete && (
        <div className="flex items-center gap-3 px-4 pb-3 border-t border-zinc-100 pt-2.5">
          {/* Edit — available for all statuses */}
          <Link
            href={`/submit?edit=${sub.id}`}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>

          {canWithdraw && (
            <>
              <span className="text-zinc-200">·</span>
              <button
                onClick={() => handleAction('withdraw')}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <Undo2 className="h-3 w-3" />
                Withdraw
              </button>
            </>
          )}

          {canDelete && (
            <>
              <span className="text-zinc-200">·</span>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="flex items-center gap-3 px-4 pb-3 border-t border-red-100 pt-2.5">
          <p className="text-[11px] text-red-600 font-semibold flex-1">Delete this submission?</p>
          <button
            onClick={() => handleAction('delete')}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Yes, delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-[11px] text-zinc-400 hover:text-zinc-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !confirmDelete && (
        <div className="flex items-center gap-2 px-4 pb-3 border-t border-zinc-100 pt-2.5">
          <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
          <span className="text-[11px] text-zinc-400">Processing…</span>
        </div>
      )}
    </div>
  )
}

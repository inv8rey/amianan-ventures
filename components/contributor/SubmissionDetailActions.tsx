'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Undo2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { SubmissionStatus } from '@/types/contributor'

interface SubmissionDetailActionsProps {
  submissionId: string
  status: SubmissionStatus
}

export function SubmissionDetailActions({ submissionId, status }: SubmissionDetailActionsProps) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  // Delete: not allowed for published or approved
  const canDelete = status !== 'published' && status !== 'approved'
  // Withdraw: only submitted or under_review
  const canWithdraw = status === 'submitted' || status === 'under_review'

  async function handleAction(action: 'delete' | 'withdraw') {
    setLoading(true)
    try {
      const res = await fetch('/api/contributor/delete-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')

      if (action === 'delete') {
        toast.success('Submission deleted')
        router.push('/dashboard')
      } else {
        toast.success('Withdrawn — saved as a draft')
        router.push(`/submit?edit=${submissionId}`)
      }
    } catch (e) {
      toast.error((e as Error).message)
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Actions</p>

      <div className="flex flex-wrap gap-2">
        {/* Edit — always available */}
        <Link
          href={`/submit?edit=${submissionId}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Article
        </Link>

        {canWithdraw && (
          <button
            onClick={() => handleAction('withdraw')}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
            Withdraw to Draft
          </button>
        )}

        {canDelete && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:border-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Submission
          </button>
        )}

        {confirmDelete && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 font-semibold">Permanently delete?</span>
            <button
              onClick={() => handleAction('delete')}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-zinc-400 hover:text-zinc-700 px-2 py-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {status === 'published' && (
        <p className="text-[11px] text-zinc-400 mt-2">
          Edits will be resubmitted for review. Your article stays live at its current URL during that time.
        </p>
      )}
    </div>
  )
}

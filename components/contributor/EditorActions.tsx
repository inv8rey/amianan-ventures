'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, MessageSquare, XCircle, Globe, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { ContributorSubmission, SubmissionStatus } from '@/types/contributor'

interface EditorActionsProps {
  submission: ContributorSubmission
}

type ActionMode = null | 'revision' | 'reject'

export function EditorActions({ submission }: EditorActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<ActionMode>(null)
  const [revisionNotes, setRevisionNotes] = useState(submission.revision_notes ?? '')
  const [editorNotes, setEditorNotes] = useState(submission.editor_notes ?? '')
  const [saving, setSaving] = useState(false)

  const status = submission.status as SubmissionStatus
  const isApproved = status === 'approved'
  const isPublished = status === 'published'
  const isClosed = status === 'rejected' || isPublished

  // Is this approved but scheduled for a future date?
  const isScheduledFuture = isApproved && !!submission.scheduled_for &&
    new Date(submission.scheduled_for) > new Date()

  async function updateStatus(
    newStatus: SubmissionStatus,
    extra: Record<string, unknown> = {}
  ) {
    setSaving(true)
    try {
      const res = await fetch('/api/contributor/editor-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          status: newStatus,
          editorNotes: editorNotes || null,
          revisionNotes: mode === 'revision' ? revisionNotes : submission.revision_notes,
          ...extra,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Action failed')
      }
      setMode(null)
      startTransition(() => router.refresh())
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editor Actions</p>

      {/* Private notes — always visible */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Private Notes (not shown to contributor)
        </label>
        <textarea
          value={editorNotes}
          onChange={(e) => setEditorNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes for your records…"
          className="w-full rounded-md border border-border/40 bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-border resize-none"
          disabled={isClosed}
        />
      </div>

      {/* ── Action buttons (not yet approved / closed) ──────────── */}
      {!isClosed && !isApproved && (
        <div className="space-y-2">
          {/* Request Revision */}
          {mode !== 'revision' ? (
            <button
              onClick={() => setMode('revision')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border/40 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
              Request Revision
            </button>
          ) : (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
              <label className="block text-xs font-semibold text-amber-400">Revision Notes (shown to contributor)</label>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={4}
                placeholder="Describe what changes are needed…"
                autoFocus
                className="w-full rounded-md border border-amber-500/30 bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-amber-500/60 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus('revision_requested')}
                  disabled={saving || !revisionNotes.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Send Feedback
                </button>
                <button onClick={() => setMode(null)} className="px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted/50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Approve — auto-publishes (or schedules if contributor set a future date) */}
          <button
            onClick={() => updateStatus('approved')}
            disabled={saving || isPending}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {(saving || isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            {submission.scheduled_for && new Date(submission.scheduled_for) > new Date()
              ? 'Approve & Schedule'
              : 'Approve & Publish'}
          </button>

          {/* Reject */}
          {mode !== 'reject' ? (
            <button
              onClick={() => setMode('reject')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              Reject
            </button>
          ) : (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-destructive">Reject submission?</p>
              <p className="text-[10px] text-muted-foreground">A rejection notice will be sent to the contributor.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Yes, Reject
                </button>
                <button onClick={() => setMode(null)} className="px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted/50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Approved + Scheduled state ──────────────────────────── */}
      {isScheduledFuture && (
        <div className="space-y-2">
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-400">Approved — Scheduled</p>
            </div>
            <p className="text-[11px] text-emerald-300">
              Will auto-publish on{' '}
              <span className="font-semibold">
                {format(new Date(submission.scheduled_for!), 'MMM d, yyyy · h:mm a')}
              </span>
            </p>
          </div>
          {/* Publish immediately option */}
          <button
            onClick={() => updateStatus('published')}
            disabled={saving || isPending}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#00a855] text-white text-xs font-bold hover:bg-[#008f49] disabled:opacity-50 transition-colors"
          >
            {(saving || isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
            Publish Now Instead
          </button>
        </div>
      )}

      {/* Closed states */}
      {isClosed && (
        <p className="text-xs text-muted-foreground text-center py-2">
          This submission is {status === 'rejected' ? 'rejected' : 'published'} — no further actions.
        </p>
      )}
    </div>
  )
}

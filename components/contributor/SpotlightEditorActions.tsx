'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, Globe, ExternalLink, Banknote, CalendarClock, ListChecks, Check } from 'lucide-react'
import { toast } from 'sonner'
import { DELIVERABLES, type SpotlightApplication, type SpotlightStatus } from '@/types/spotlight'

interface Props {
  application: SpotlightApplication
}

type ActionMode = null | 'reject' | 'reject_payment' | 'publish'

function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Builds a clean, professional URL from the business name — capped at a
// short word count so the slug never sprawls into something unwieldy.
function generatePublishedUrl(businessName: string) {
  const words = slugify(businessName).split('-').filter(Boolean)
  let slug = ''
  for (const word of words) {
    const next = slug ? `${slug}-${word}` : word
    if (next.length > 50) break
    slug = next
  }
  return `https://amiananventures.org/founder-stories/${slug}`
}

export function SpotlightEditorActions({ application }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<ActionMode>(null)
  const [editorNotes, setEditorNotes] = useState(application.editor_notes ?? '')
  const [publishUrl, setPublishUrl] = useState(application.published_url ?? '')
  const [saving, setSaving] = useState(false)
  const [scheduledDate, setScheduledDate] = useState(toLocalInputValue(application.scheduled_publish_at))
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [deliverables, setDeliverables] = useState<Record<string, boolean>>(application.deliverables ?? {})
  const [savingDeliverable, setSavingDeliverable] = useState<string | null>(null)

  const status = application.status as SpotlightStatus
  const isClosed = status === 'rejected' || status === 'published' || status === 'cancelled'

  async function updateStatus(newStatus: SpotlightStatus, extra: Record<string, unknown> = {}) {
    setSaving(true)
    try {
      const res = await fetch('/api/spotlight/editor-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          status: newStatus,
          editorNotes: editorNotes || null,
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

  async function saveSchedule() {
    setSavingSchedule(true)
    try {
      const res = await fetch('/api/spotlight/editor-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          scheduledPublishAt: scheduledDate ? new Date(scheduledDate).toISOString() : null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save date')
      }
      toast.success('Publish date saved.')
      startTransition(() => router.refresh())
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSavingSchedule(false)
    }
  }

  async function toggleDeliverable(title: string) {
    const next = { ...deliverables, [title]: !deliverables[title] }
    setDeliverables(next)
    setSavingDeliverable(title)
    try {
      const res = await fetch('/api/spotlight/editor-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id, deliverables: next }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to update deliverable')
      }
    } catch (e) {
      setDeliverables(deliverables)
      toast.error((e as Error).message)
    } finally {
      setSavingDeliverable(null)
    }
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editor Actions</p>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Private Notes (not shown to applicant)
        </label>
        <textarea
          value={editorNotes}
          onChange={(e) => setEditorNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes…"
          className="w-full rounded-md border border-border/40 bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-border resize-none"
          disabled={isClosed}
        />
      </div>

      {/* Scheduled publish date — set once production starts */}
      {(status === 'paid' || status === 'in_production') && (
        <div className="rounded-md border border-border/40 bg-muted/30 p-3 space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" /> Expected Publish Date
          </label>
          <p className="text-[10px] text-muted-foreground">Shown to the applicant as an expected timeline — does not auto-publish.</p>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="flex-1 rounded-md border border-border/40 bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-border"
            />
            <button
              onClick={saveSchedule}
              disabled={savingSchedule}
              className="px-3 py-2 rounded-md bg-foreground text-background text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-colors shrink-0"
            >
              {savingSchedule ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Deliverables checklist — mark each item completed/posted */}
      {(status === 'paid' || status === 'in_production' || status === 'published') && (
        <div className="rounded-md border border-border/40 bg-muted/30 p-3 space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" /> Deliverables
          </label>
          <div className="space-y-1.5">
            {DELIVERABLES[application.package].map((item) => {
              const done = !!deliverables[item.title]
              const isSaving = savingDeliverable === item.title
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => toggleDeliverable(item.title)}
                  disabled={isSaving}
                  className="w-full flex items-center gap-2 text-left disabled:opacity-60"
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-600' : 'bg-border/60'}`}>
                    {isSaving ? <Loader2 className="h-2.5 w-2.5 animate-spin text-white" /> : done && <Check className="h-2.5 w-2.5 text-white" />}
                  </span>
                  <span className={`text-xs ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{item.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* under_review → approve or reject */}
      {status === 'under_review' && (
        <div className="space-y-2">
          <button
            onClick={() => updateStatus('approved')}
            disabled={saving || isPending}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {(saving || isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            Approve & Send Payment Instructions
          </button>

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
              <p className="text-xs font-semibold text-destructive">Reject this application?</p>
              <p className="text-[10px] text-muted-foreground">A rejection notice with your notes will be sent.</p>
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

      {(status === 'approved' || status === 'awaiting_payment') && (
        <p className="text-xs text-amber-600 font-semibold">Waiting on applicant to submit payment proof.</p>
      )}

      {/* payment_submitted → confirm or reject payment */}
      {status === 'payment_submitted' && (
        <div className="space-y-2">
          <button
            onClick={() => updateStatus('paid')}
            disabled={saving || isPending}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {(saving || isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />}
            Confirm Payment Received
          </button>

          {mode !== 'reject_payment' ? (
            <button
              onClick={() => setMode('reject_payment')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              Couldn&apos;t Verify Payment
            </button>
          ) : (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-destructive">Send back for resubmission?</p>
              <p className="text-[10px] text-muted-foreground">Add a note above explaining why, then confirm.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus('awaiting_payment', { silent: true })}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Yes, Send Back
                </button>
                <button onClick={() => setMode(null)} className="px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted/50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* paid → mark in production */}
      {status === 'paid' && (
        <button
          onClick={() => updateStatus('in_production')}
          disabled={saving || isPending}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {(saving || isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
          Mark as In Production
        </button>
      )}
      {status === 'paid' && (
        <p className="text-[10px] text-muted-foreground">
          This locks the applicant&apos;s ability to edit their business/story details.
        </p>
      )}

      {/* in_production → publish */}
      {status === 'in_production' && (
        <div className="space-y-2">
          {mode !== 'publish' ? (
            <button
              onClick={() => {
                if (!publishUrl.trim()) setPublishUrl(generatePublishedUrl(application.business_name))
                setMode('publish')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#00a855] text-white text-xs font-bold hover:bg-[#008f49] transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              Mark as Published
            </button>
          ) : (
            <div className="rounded-md border border-border/40 bg-muted/30 p-3 space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">Published Article URL</label>
              <input
                type="url"
                value={publishUrl}
                onChange={(e) => setPublishUrl(e.target.value)}
                placeholder="https://amiananventures.org/founder-stories/..."
                className="w-full rounded-md border border-border/40 bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-border"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus('published', { publishedUrl: publishUrl })}
                  disabled={saving || !publishUrl.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#00a855] text-white text-xs font-bold hover:bg-[#008f49] disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Confirm Publish
                </button>
                <button onClick={() => setMode(null)} className="px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted/50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Closed states */}
      {isClosed && (
        <div className="space-y-2">
          {status === 'published' ? (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-emerald-400">✓ Published</p>
              {application.published_url && (
                <a href={application.published_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  <ExternalLink className="h-3 w-3 shrink-0" /> View Live Story
                </a>
              )}
            </div>
          ) : status === 'cancelled' ? (
            <p className="text-xs text-muted-foreground text-center py-2">The applicant cancelled this application — no further actions.</p>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">This application was rejected — no further actions.</p>
          )}
        </div>
      )}
    </div>
  )
}

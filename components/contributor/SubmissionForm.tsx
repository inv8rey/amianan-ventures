'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Loader2, Save, Send, FileText, Link2, Check, CalendarClock, ImageIcon, Upload,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_DESCRIPTIONS,
  SECTORS,
  CONTRIBUTOR_REGIONS,
  type ContentType,
  type DraftType,
  type ContributorSubmission,
} from '@/types/contributor'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor').then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-64 rounded-lg border border-zinc-200 bg-zinc-50 animate-pulse" /> }
)

interface SubmissionFormProps {
  contributorId: string
  editSubmission?: ContributorSubmission
}

// Convert UTC ISO to local datetime-local value (YYYY-MM-DDTHH:mm)
function toLocalDatetimeInput(isoString: string): string {
  const d = new Date(isoString)
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16)
}

function minScheduleTime(): string {
  return toLocalDatetimeInput(new Date(Date.now() + 3600000).toISOString())
}

export function SubmissionForm({ contributorId, editSubmission }: SubmissionFormProps) {
  const router = useRouter()
  const isEdit = !!editSubmission
  const isDraftEdit = editSubmission?.status === 'draft'

  // ── Form state ─────────────────────────────────────────────────
  const [contentType, setContentType] = useState<ContentType | ''>(
    editSubmission?.content_type ?? ''
  )
  const [headline, setHeadline] = useState(editSubmission?.headline ?? '')
  const [summary, setSummary] = useState(editSubmission?.summary ?? '')
  const [region, setRegion] = useState(editSubmission?.region ?? '')
  const [sector, setSector] = useState(editSubmission?.sector ?? '')
  const [draftType, setDraftType] = useState<DraftType>(editSubmission?.draft_type ?? 'text')
  const [draftContent, setDraftContent] = useState(editSubmission?.draft_content ?? '')
  const [gdocsUrl, setGdocsUrl] = useState(editSubmission?.gdocs_url ?? '')
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>(
    editSubmission?.scheduled_for ? 'scheduled' : 'immediate'
  )
  const [scheduledFor, setScheduledFor] = useState(
    editSubmission?.scheduled_for ? toLocalDatetimeInput(editSubmission.scheduled_for) : ''
  )
  const [coverImageUrl, setCoverImageUrl] = useState(editSubmission?.cover_image_url ?? '')
  const [agreed1, setAgreed1] = useState(false)
  const [agreed2, setAgreed2] = useState(false)

  // ── Save state ──────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [savedDraftId, setSavedDraftId] = useState<string | null>(
    isDraftEdit ? (editSubmission?.id ?? null) : null
  )

  const handleContent = useCallback((html: string) => setDraftContent(html), [])

  const hasContent = draftType === 'gdocs' ? !!gdocsUrl.trim() : !!draftContent.trim()
  const canSubmit =
    !!contentType && !!headline.trim() && !!summary.trim() && hasContent && !!coverImageUrl && agreed1 && agreed2
  const canSaveDraft = !!headline.trim()

  // ── Cover image upload ──────────────────────────────────────────
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }

    setUploadingCover(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${contributorId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('contributor-covers')
      .upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed: ' + error.message); setUploadingCover(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('contributor-covers')
      .getPublicUrl(path)
    setCoverImageUrl(publicUrl)
    setUploadingCover(false)
  }

  // ── Save Draft ──────────────────────────────────────────────────
  async function handleSaveDraft() {
    if (!canSaveDraft) { toast.error('Enter a headline to save your draft'); return }
    setDraftSaving(true)
    const supabase = createClient()

    const payload = {
      contributor_id: contributorId,
      content_type: contentType || ('founder_story' as ContentType),
      headline: headline.trim(),
      summary: summary.trim(),
      region: region || null,
      sector: sector || null,
      draft_type: draftType,
      draft_content: draftType === 'text' ? draftContent : null,
      gdocs_url: draftType === 'gdocs' ? gdocsUrl.trim() : null,
      cover_image_url: coverImageUrl || null,
      status: 'draft',
      scheduled_for: null,
    }

    const targetId = savedDraftId ?? (isEdit && isDraftEdit ? editSubmission?.id : null)

    if (targetId) {
      const { error } = await supabase.from('contributor_submissions').update(payload).eq('id', targetId)
      if (error) { toast.error('Could not save draft: ' + error.message); setDraftSaving(false); return }
    } else {
      const { data, error } = await supabase.from('contributor_submissions').insert(payload).select('id').single()
      if (error) { toast.error('Could not save draft: ' + error.message); setDraftSaving(false); return }
      setSavedDraftId(data.id)
    }

    toast.success('Draft saved')
    setDraftSaving(false)
  }

  // ── Submit for Review ───────────────────────────────────────────
  async function handleSubmit() {
    if (!contentType) { toast.error('Select a content type'); return }
    if (!headline.trim()) { toast.error('Headline is required'); return }
    if (!summary.trim()) { toast.error('Summary is required'); return }
    if (!hasContent) { toast.error('Add your article content or a Google Docs link'); return }
    if (!coverImageUrl) { toast.error('Upload a cover image before submitting'); return }
    if (!agreed1 || !agreed2) { toast.error('Please check both confirmation boxes'); return }
    if (scheduleType === 'scheduled' && !scheduledFor) {
      toast.error('Select a publish date or choose "Publish when approved"'); return
    }

    setSubmitting(true)
    const supabase = createClient()

    const payload = {
      contributor_id: contributorId,
      content_type: contentType,
      headline: headline.trim(),
      summary: summary.trim(),
      region: region || null,
      sector: sector || null,
      draft_type: draftType,
      draft_content: draftType === 'text' ? draftContent : null,
      gdocs_url: draftType === 'gdocs' ? gdocsUrl.trim() : null,
      cover_image_url: coverImageUrl || null,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      scheduled_for: scheduleType === 'scheduled' && scheduledFor
        ? new Date(scheduledFor).toISOString()
        : null,
    }

    const updateId = savedDraftId ?? (isEdit ? editSubmission?.id : null)
    let submissionId: string

    if (updateId) {
      const { error } = await supabase.from('contributor_submissions').update(payload).eq('id', updateId)
      if (error) { toast.error('Save failed: ' + error.message); setSubmitting(false); return }
      submissionId = updateId
    } else {
      const { data, error } = await supabase.from('contributor_submissions').insert(payload).select('id').single()
      if (error) { toast.error('Submission failed: ' + error.message); setSubmitting(false); return }
      submissionId = data.id
    }

    await fetch('/api/contributor/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'submission_received', submissionId, headline: headline.trim() }),
    }).catch(() => {})

    const isResubmit = isEdit && !isDraftEdit
    toast.success(isResubmit ? 'Resubmitted successfully!' : 'Submitted! We\'ll review it shortly.')
    router.push(`/submissions/${submissionId}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Left: Main content ─────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Cover Image */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-zinc-700">
            Cover Image <span className="text-red-500">*</span>
            <span className="ml-2 text-[11px] font-normal text-zinc-400">16:9 recommended · JPG/PNG/WebP · max 5 MB</span>
          </label>
          <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-zinc-200 bg-zinc-50"
            style={{ aspectRatio: '16/9' }}>
            {coverImageUrl ? (
              <>
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  unoptimized
                />
                {/* Replace overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer group">
                  <span className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 text-xs font-bold shadow transition-opacity">
                    <Upload className="h-3.5 w-3.5" /> Replace Image
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} disabled={uploadingCover} />
                </label>
              </>
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer">
                {uploadingCover ? (
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-zinc-600">Click to upload cover image</p>
                      <p className="text-xs text-zinc-400 mt-0.5">16:9 ratio looks best on article cards</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} disabled={uploadingCover} />
              </label>
            )}
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-zinc-700">
            Headline <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value.slice(0, 120))}
              maxLength={120}
              placeholder="Write a compelling headline for your article"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-base font-medium text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors"
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${headline.length > 100 ? 'text-orange-500' : 'text-zinc-300'}`}>
              {headline.length}/120
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-zinc-700">
            Summary / Pitch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value.slice(0, 500))}
              maxLength={500}
              rows={3}
              placeholder="What is this piece about and why should readers care?"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors resize-none"
            />
            <span className={`absolute right-3 bottom-3 text-[10px] ${summary.length > 450 ? 'text-orange-500' : 'text-zinc-300'}`}>
              {summary.length}/500
            </span>
          </div>
        </div>

        {/* Draft Content */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-700">
            Content <span className="text-red-500">*</span>
          </label>

          {/* Toggle */}
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden w-fit">
            <button
              type="button"
              onClick={() => setDraftType('text')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${
                draftType === 'text' ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Write / Paste Text
            </button>
            <button
              type="button"
              onClick={() => setDraftType('gdocs')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${
                draftType === 'gdocs' ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" /> Google Docs Link
            </button>
          </div>

          {draftType === 'text' ? (
            <RichTextEditor
              value={draftContent}
              onChange={handleContent}
              placeholder="Start writing your article…"
            />
          ) : (
            <div className="space-y-1.5">
              <input
                type="url"
                value={gdocsUrl}
                onChange={(e) => setGdocsUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors"
              />
              <p className="text-xs text-zinc-400">
                Make sure the doc is set to &quot;Anyone with the link can view&quot;
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── Right: Sidebar ─────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Submit panel */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Submit</h3>

          {/* Agreement checkboxes */}
          <div className="space-y-2.5">
            {[
              { checked: agreed1, set: setAgreed1, text: 'This is my original work and I have the right to publish it.' },
              { checked: agreed2, set: setAgreed2, text: 'Amianan Innovation Ventures may edit for clarity and style.' },
            ].map(({ checked, set: setChecked, text }, i) => (
              <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                <div
                  onClick={() => setChecked(!checked)}
                  className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors cursor-pointer ${
                    checked ? 'bg-black border-black' : 'border-zinc-300'
                  }`}
                >
                  {checked && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <span className="text-xs text-zinc-500 leading-relaxed">{text}</span>
              </label>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={draftSaving || submitting || !canSaveDraft}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {draftSaving
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Save className="h-3.5 w-3.5" />
                }
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || draftSaving || !canSubmit}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#00cc6a] text-black text-xs font-bold hover:bg-[#00b85e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Send className="h-3.5 w-3.5" />
                }
                {isEdit && !isDraftEdit ? 'Resubmit' : 'Submit'}
              </button>
            </div>
            {savedDraftId && !submitting && (
              <p className="text-[10px] text-zinc-400 text-center">Draft saved ✓</p>
            )}
          </div>
        </div>

        {/* Settings panel */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900">Settings</h3>

          {/* Content Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Content Type <span className="text-red-500">*</span>
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            >
              <option value="">Select type…</option>
              {(Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]).map(([v, l]) => (
                <option key={v} value={v} title={CONTENT_TYPE_DESCRIPTIONS[v]}>{l}</option>
              ))}
            </select>
            {contentType && (
              <p className="text-[11px] text-zinc-400 leading-snug">
                {CONTENT_TYPE_DESCRIPTIONS[contentType]}
              </p>
            )}
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            >
              <option value="">All regions</option>
              {CONTRIBUTOR_REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            >
              <option value="">Select sector</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Publish Timing panel */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900">Publish Timing</h3>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="radio"
                checked={scheduleType === 'immediate'}
                onChange={() => setScheduleType('immediate')}
                className="mt-0.5 w-3.5 h-3.5 accent-black"
              />
              <div>
                <span className="text-xs font-semibold text-zinc-700">Publish when approved</span>
                <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                  Goes live as soon as the editor approves it.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="radio"
                checked={scheduleType === 'scheduled'}
                onChange={() => setScheduleType('scheduled')}
                className="mt-0.5 w-3.5 h-3.5 accent-black"
              />
              <div>
                <span className="text-xs font-semibold text-zinc-700">Schedule a date</span>
                <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                  Auto-publishes at your chosen time after approval.
                </p>
              </div>
            </label>

            {scheduleType === 'scheduled' && (
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={minScheduleTime()}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

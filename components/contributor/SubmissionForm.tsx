'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mic2, Lightbulb, BookOpen, Building2, FlaskConical, FileText, Link2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
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

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor').then(m => m.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-64 rounded-lg border border-zinc-200 bg-zinc-50 animate-pulse" />,
})

const CONTENT_ICONS: Record<ContentType, React.ElementType> = {
  founder_story: Mic2,
  opinion_essay: Lightbulb,
  program_recap: BookOpen,
  ecosystem_spotlight: Building2,
  field_notes: FlaskConical,
}

interface SubmissionFormProps {
  contributorId: string
  editSubmission?: ContributorSubmission
}

interface FormData {
  contentType: ContentType | ''
  headline: string
  summary: string
  region: string
  sector: string
  draftType: DraftType
  draftContent: string
  gdocsUrl: string
}

const INITIAL: FormData = {
  contentType: '',
  headline: '',
  summary: '',
  region: '',
  sector: '',
  draftType: 'text',
  draftContent: '',
  gdocsUrl: '',
}

const STEPS = ['Content Type', 'Your Article', 'Review & Submit']

export function SubmissionForm({ contributorId, editSubmission }: SubmissionFormProps) {
  const router = useRouter()
  const isEdit = !!editSubmission

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(
    editSubmission
      ? {
          contentType: editSubmission.content_type,
          headline: editSubmission.headline,
          summary: editSubmission.summary,
          region: editSubmission.region ?? '',
          sector: editSubmission.sector ?? '',
          draftType: editSubmission.draft_type,
          draftContent: editSubmission.draft_content ?? '',
          gdocsUrl: editSubmission.gdocs_url ?? '',
        }
      : INITIAL
  )
  const [agreed1, setAgreed1] = useState(false)
  const [agreed2, setAgreed2] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleContent = useCallback((html: string) => set('draftContent', html), [])

  function canAdvance(): boolean {
    if (step === 0) return !!form.contentType
    if (step === 1) {
      const hasContent = form.draftType === 'gdocs' ? !!form.gdocsUrl.trim() : !!form.draftContent.trim()
      return !!form.headline.trim() && !!form.summary.trim() && hasContent
    }
    return true
  }

  async function handleSubmit() {
    if (!agreed1 || !agreed2) {
      toast.error('Please check both confirmation boxes to continue')
      return
    }
    setSubmitting(true)

    const supabase = createClient()

    const payload = {
      contributor_id: contributorId,
      content_type: form.contentType,
      headline: form.headline.trim(),
      summary: form.summary.trim(),
      region: form.region || null,
      sector: form.sector || null,
      draft_type: form.draftType,
      draft_content: form.draftType === 'text' ? form.draftContent : null,
      gdocs_url: form.draftType === 'gdocs' ? form.gdocsUrl.trim() : null,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }

    let submissionId: string

    if (isEdit && editSubmission) {
      const { error } = await supabase
        .from('contributor_submissions')
        .update(payload)
        .eq('id', editSubmission.id)
      if (error) { toast.error('Save failed: ' + error.message); setSubmitting(false); return }
      submissionId = editSubmission.id
    } else {
      const { data, error } = await supabase
        .from('contributor_submissions')
        .insert(payload)
        .select('id')
        .single()
      if (error) { toast.error('Submission failed: ' + error.message); setSubmitting(false); return }
      submissionId = data.id
    }

    // Send emails via API
    await fetch('/api/contributor/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'submission_received',
        submissionId,
        headline: form.headline.trim(),
      }),
    }).catch(() => {})

    toast.success(isEdit ? 'Resubmitted successfully!' : 'Submission received!')
    router.push(`/submissions/${submissionId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                i < step ? 'bg-[#00a855] text-white' :
                i === step ? 'bg-black text-white' :
                'bg-zinc-200 text-zinc-500'
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${
                i === step ? 'text-zinc-900' : i < step ? 'text-[#00a855]' : 'text-zinc-400'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-[#00a855]' : 'bg-zinc-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Content Type ─────────────────────────────────────────── */}
      {step === 0 && (
        <div>
          <h2 className="text-lg font-black text-zinc-900 mb-1">What are you submitting?</h2>
          <p className="text-sm text-zinc-500 mb-6">Choose the format that best fits your piece</p>
          <div className="space-y-3">
            {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((type) => {
              const Icon = CONTENT_ICONS[type]
              const selected = form.contentType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('contentType', type)}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? 'border-black bg-zinc-50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selected ? 'bg-black' : 'bg-zinc-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${selected ? 'text-[#00cc6a]' : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${selected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                      {CONTENT_TYPE_LABELS[type]}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      {CONTENT_TYPE_DESCRIPTIONS[type]}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                    selected ? 'border-black bg-black' : 'border-zinc-300'
                  }`}>
                    {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Step 1: Article Details ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-black text-zinc-900 mb-1">Your article</h2>
            <p className="text-sm text-zinc-500">Tell us what you&apos;re writing about</p>
          </div>

          {/* Headline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Headline <span className="text-red-500">*</span>
              </label>
              <span className={`text-[10px] ${form.headline.length > 100 ? 'text-orange-500' : 'text-zinc-400'}`}>
                {form.headline.length}/120
              </span>
            </div>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => set('headline', e.target.value.slice(0, 120))}
              maxLength={120}
              placeholder="Write a compelling headline for your article"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Summary / Pitch <span className="text-red-500">*</span>
              </label>
              <span className={`text-[10px] ${form.summary.length > 450 ? 'text-orange-500' : 'text-zinc-400'}`}>
                {form.summary.length}/500
              </span>
            </div>
            <textarea
              value={form.summary}
              onChange={(e) => set('summary', e.target.value.slice(0, 500))}
              maxLength={500}
              rows={3}
              placeholder="What is this piece about and why should readers care?"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Region + Sector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Region
              </label>
              <select
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              >
                <option value="">All regions</option>
                {CONTRIBUTOR_REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Sector
              </label>
              <select
                value={form.sector}
                onChange={(e) => set('sector', e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              >
                <option value="">Select sector</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Draft toggle */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Draft Content <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-lg border border-zinc-200 overflow-hidden mb-3 w-fit">
              <button
                type="button"
                onClick={() => set('draftType', 'text')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${
                  form.draftType === 'text' ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Paste Text
              </button>
              <button
                type="button"
                onClick={() => set('draftType', 'gdocs')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${
                  form.draftType === 'gdocs' ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" /> Google Docs
              </button>
            </div>

            {form.draftType === 'text' ? (
              <RichTextEditor
                value={form.draftContent}
                onChange={handleContent}
                placeholder="Write or paste your article here…"
              />
            ) : (
              <div>
                <input
                  type="url"
                  value={form.gdocsUrl}
                  onChange={(e) => set('gdocsUrl', e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                />
                <p className="text-xs text-zinc-400 mt-1.5">
                  Make sure your doc is set to "Anyone with the link can view"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Review ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-black text-zinc-900 mb-1">Review your submission</h2>
          <p className="text-sm text-zinc-500 mb-6">Check everything looks good before submitting</p>

          <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100 mb-6">
            <div className="px-4 py-3 flex items-start gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">Type</span>
              <span className="text-sm font-semibold text-zinc-900">{CONTENT_TYPE_LABELS[form.contentType as ContentType]}</span>
            </div>
            <div className="px-4 py-3 flex items-start gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">Headline</span>
              <span className="text-sm text-zinc-900">{form.headline}</span>
            </div>
            <div className="px-4 py-3 flex items-start gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">Summary</span>
              <span className="text-sm text-zinc-600 leading-relaxed">{form.summary}</span>
            </div>
            {(form.region || form.sector) && (
              <div className="px-4 py-3 flex items-start gap-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {form.region && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium capitalize">
                      {form.region.replace('-', ' ')}
                    </span>
                  )}
                  {form.sector && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                      {form.sector}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="px-4 py-3 flex items-start gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">Draft</span>
              <span className="text-sm text-zinc-600">
                {form.draftType === 'gdocs' ? (
                  <a href={form.gdocsUrl} target="_blank" rel="noopener noreferrer" className="text-[#00a855] hover:underline truncate block max-w-xs">
                    {form.gdocsUrl}
                  </a>
                ) : (
                  <span className="text-zinc-500">Rich text content included ({form.draftContent.length} characters)</span>
                )}
              </span>
            </div>
          </div>

          {/* Agreement checkboxes */}
          <div className="space-y-3 mb-6">
            {[
              { checked: agreed1, set: setAgreed1, text: 'I confirm this is original work and I have the right to publish it.' },
              { checked: agreed2, set: setAgreed2, text: 'I understand Amianan Innovation Ventures may edit my submission for clarity and style.' },
            ].map(({ checked, set: setChecked, text }, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setChecked(!checked)}
                  className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors cursor-pointer ${
                    checked ? 'bg-black border-black' : 'border-zinc-300'
                  }`}
                >
                  {checked && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-zinc-600 leading-relaxed">{text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-600 hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !agreed1 || !agreed2}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Resubmit' : 'Submit for Review'}
          </button>
        )}
      </div>
    </div>
  )
}

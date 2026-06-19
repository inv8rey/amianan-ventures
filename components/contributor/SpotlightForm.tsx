'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft, Loader2, Upload, CheckCircle2, ExternalLink, Lock, ImageIcon, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  type SpotlightApplication, type PaymentMethod, type StoryQuestionKey,
  STATUS_LABELS, STATUS_COLORS, EDITABLE_STATUSES, PAYMENT_METHOD_LABELS,
  INDUSTRIES, SPOTLIGHT_PACKAGE, STORY_QUESTIONS,
} from '@/types/spotlight'
import { CONTRIBUTOR_REGIONS } from '@/types/contributor'

interface FileField {
  url: string | null
  uploading: boolean
}

const PAYMENT_VISIBLE_STATUSES: SpotlightApplication['status'][] = [
  'approved', 'awaiting_payment', 'payment_submitted', 'paid', 'in_production', 'published',
]
const PAYMENT_EDITABLE_STATUSES: SpotlightApplication['status'][] = ['approved', 'awaiting_payment']

export function SpotlightForm({ application }: { application: SpotlightApplication }) {
  const [app, setApp] = useState(application)
  const [form, setForm] = useState({
    business_name: application.business_name,
    contact_name: application.contact_name,
    email: application.email,
    phone: application.phone ?? '',
    website: application.website ?? '',
    industry: application.industry ?? '',
    region: application.region ?? '',
    role: application.role ?? '',
    social_link: application.social_link ?? '',
    promo: application.promo ?? '',
  })
  const [answers, setAnswers] = useState<Partial<Record<StoryQuestionKey, string>>>(
    application.story_answers ?? {}
  )
  const [founderPhoto, setFounderPhoto] = useState<FileField>({ url: application.founder_photo_url, uploading: false })
  const [startupLogo, setStartupLogo] = useState<FileField>({ url: application.startup_logo_url, uploading: false })
  const [productPhoto, setProductPhoto] = useState<FileField>({ url: application.product_photo_url, uploading: false })
  const [payment, setPayment] = useState({
    payment_method: (application.payment_method ?? '') as PaymentMethod | '',
    payment_reference: application.payment_reference ?? '',
  })
  const [proofUrl, setProofUrl] = useState(application.payment_proof_url)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [payingLoading, setPayingLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }))
  const setAnswer = (key: StoryQuestionKey, val: string) => setAnswers((a) => ({ ...a, [key]: val }))
  const locked = !EDITABLE_STATUSES.includes(app.status)

  function currentAssetFields() {
    return {
      ...form,
      story_answers: answers,
      founder_photo_url: founderPhoto.url,
      startup_logo_url: startupLogo.url,
      product_photo_url: productPhoto.url,
    }
  }

  async function saveRow(updates: Partial<SpotlightApplication>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('spotlight_applications')
      .update(updates)
      .eq('id', app.id)
      .select('*')
      .single()
    if (error) {
      toast.error(error.message)
      return null
    }
    setApp(data as SpotlightApplication)
    return data
  }

  async function handleSaveDraft() {
    setSaving(true)
    const result = await saveRow(currentAssetFields())
    setSaving(false)
    if (result) toast.success('Draft saved.')
  }

  async function handleSubmitForReview() {
    const required: (keyof typeof form)[] = ['business_name', 'contact_name', 'email', 'role', 'industry', 'region']
    const missingFields = required.filter((k) => !form[k].trim())
    const missingStory = (['q1', 'q2', 'q3'] as StoryQuestionKey[]).filter((k) => !(answers[k] ?? '').trim())
    if (missingFields.length > 0 || missingStory.length > 0) {
      toast.error('Please fill out all required fields and the first 3 story questions before submitting.')
      return
    }
    if (!founderPhoto.url) {
      toast.error('Please upload a founder photo.')
      return
    }
    setSubmitting(true)
    const result = await saveRow({
      ...currentAssetFields(),
      status: 'submitted',
      submitted_at: app.submitted_at ?? new Date().toISOString(),
    })
    setSubmitting(false)
    if (result) {
      toast.success('Application submitted for review!')
      fetch('/api/spotlight/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id }),
      }).catch(() => {})
    }
  }

  async function handleSaveChanges() {
    setSaving(true)
    const result = await saveRow(currentAssetFields())
    setSaving(false)
    if (result) toast.success('Changes saved.')
  }

  async function handleUploadAsset(file: File, kind: 'founder' | 'logo' | 'product') {
    const setters = { founder: setFounderPhoto, logo: setStartupLogo, product: setProductPhoto }
    const setter = setters[kind]
    setter({ url: null, uploading: true })
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `spotlight/${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('submission-assets').upload(path, file, { upsert: false })
    if (error) {
      toast.error('Upload failed. Please try again.')
      setter({ url: null, uploading: false })
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('submission-assets').getPublicUrl(path)
    setter({ url: publicUrl, uploading: false })
  }

  async function handleUploadProof(file: File) {
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Session expired. Please log in again.')
      setUploading(false)
      return
    }
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('payment-proofs').upload(path, file, { upsert: false })
    if (error) {
      toast.error('Upload failed. Please try again.')
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(path)
    setProofUrl(publicUrl)
    setUploading(false)
  }

  async function handleSubmitPayment() {
    if (!payment.payment_method || !payment.payment_reference.trim() || !proofUrl) {
      toast.error('Please select a payment method, enter a reference number, and upload proof of payment.')
      return
    }
    setPayingLoading(true)
    const result = await saveRow({
      payment_method: payment.payment_method,
      payment_reference: payment.payment_reference.trim(),
      payment_proof_url: proofUrl,
      status: 'payment_submitted',
      payment_submitted_at: new Date().toISOString(),
    })
    setPayingLoading(false)
    if (result) toast.success('Payment submitted! We\'ll confirm receipt shortly.')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <h1 className="text-2xl font-black text-zinc-900">Get Featured Application</h1>
          <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status]}`}>
            {STATUS_LABELS[app.status]}
          </span>
        </div>
        <p className="text-sm text-zinc-500 mb-8">
          {locked
            ? 'Your application is locked while we produce your feature.'
            : 'Fill in your details below. You can save your progress and come back anytime before paying.'}
        </p>

        {app.status === 'rejected' && app.editor_notes && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-sm font-bold text-red-700 mb-1">Application not approved</p>
            <p className="text-sm text-red-600">{app.editor_notes}</p>
          </div>
        )}

        {app.status === 'published' && app.published_url && (
          <div className="rounded-xl border border-[#00a855]/20 bg-[#00a855]/5 p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#00a855]" />
              <p className="text-sm font-bold text-zinc-900">Your story is live!</p>
            </div>
            <a href={app.published_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00a855] hover:underline">
              View Story <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* About You / Business Info — mirrors /founder-story's "About You" section */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 mb-5">
          <p className="text-sm font-black text-zinc-900 mb-5">About You</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required value={form.contact_name} onChange={(v) => set('contact_name', v)} disabled={locked} />
              <Field label="Email" type="email" required value={form.email} onChange={(v) => set('email', v)} disabled={locked} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Startup / Business Name" required value={form.business_name} onChange={(v) => set('business_name', v)} disabled={locked} />
              <Field label="Your Role" required placeholder="e.g. Co-founder & CEO" value={form.role} onChange={(v) => set('role', v)} disabled={locked} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="LinkedIn / Facebook Profile" type="url" value={form.social_link} onChange={(v) => set('social_link', v)} disabled={locked} />
              <Field label="Website" type="url" value={form.website} onChange={(v) => set('website', v)} disabled={locked} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Industry" required value={form.industry} onChange={(v) => set('industry', v)} options={INDUSTRIES} disabled={locked} />
              <SelectField label="Region" required value={form.region} onChange={(v) => set('region', v)} options={CONTRIBUTOR_REGIONS.map((r) => r.label)} disabled={locked} />
            </div>
            <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => set('phone', v)} disabled={locked} />
          </div>
        </div>

        {/* Your Story — same questions as /founder-story; first 3 required */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 mb-5">
          <p className="text-sm font-black text-zinc-900 mb-1">Your Story</p>
          <p className="text-xs text-zinc-400 mb-5">Answer as many as you can. Questions 1–3 are required.</p>
          <div className="space-y-5">
            {STORY_QUESTIONS.map((q, i) => (
              <TextareaField
                key={q.key}
                label={`${i + 1}. ${q.label}`}
                required={i < 3}
                value={answers[q.key] ?? ''}
                onChange={(v) => setAnswer(q.key, v)}
                maxLength={1000}
                disabled={locked}
              />
            ))}
          </div>
        </div>

        {/* Photos & Assets — mirrors /founder-story's "Photos & Assets" section */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 mb-5">
          <p className="text-sm font-black text-zinc-900 mb-5">Photos &amp; Assets</p>
          <div className="space-y-5">
            <AssetUpload
              label="Founder Photo"
              hint="A clear headshot or portrait. Used on your story page."
              required
              field={founderPhoto}
              disabled={locked}
              onUpload={(f) => handleUploadAsset(f, 'founder')}
              onClear={() => setFounderPhoto({ url: null, uploading: false })}
            />
            <AssetUpload
              label="Startup Logo"
              hint="Your company logo. PNG with transparent background preferred."
              field={startupLogo}
              disabled={locked}
              onUpload={(f) => handleUploadAsset(f, 'logo')}
              onClear={() => setStartupLogo({ url: null, uploading: false })}
            />
            <AssetUpload
              label="Product Photo / Screenshot (optional)"
              hint="A photo of your product, app screenshot, or team at work."
              field={productPhoto}
              disabled={locked}
              onUpload={(f) => handleUploadAsset(f, 'product')}
              onClear={() => setProductPhoto({ url: null, uploading: false })}
            />
          </div>
        </div>

        {/* Promo — mirrors /founder-story's "Anything to Promote?" section */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 mb-5">
          <p className="text-sm font-black text-zinc-900 mb-5">Anything to Promote?</p>
          <TextareaField
            label="Is there anything you'd like to promote or share with the community?"
            value={form.promo}
            onChange={(v) => set('promo', v)}
            maxLength={500}
            disabled={locked}
          />
        </div>

        {/* Save / submit actions */}
        {!locked && (
          <div className="flex items-center justify-end gap-3 mb-5">
            {app.status === 'draft' ? (
              <>
                <button onClick={handleSaveDraft} disabled={saving || submitting} className="px-5 py-2.5 rounded-lg border border-zinc-300 text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Draft'}
                </button>
                <button onClick={handleSubmitForReview} disabled={saving || submitting} className="px-5 py-2.5 rounded-lg bg-[#0a3a22] text-white text-sm font-bold hover:bg-[#042212] disabled:opacity-60 transition-colors">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit for Review'}
                </button>
              </>
            ) : (
              <button onClick={handleSaveChanges} disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#0a3a22] text-white text-sm font-bold hover:bg-[#042212] disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </button>
            )}
          </div>
        )}

        {(app.status === 'submitted' || app.status === 'under_review') && (
          <p className="text-xs text-zinc-400 text-center mb-5">
            Your application is being reviewed. You can keep editing — we&apos;ll see your latest version.
          </p>
        )}

        {/* Payment */}
        {PAYMENT_VISIBLE_STATUSES.includes(app.status) && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-black text-zinc-900">Payment</p>
              <p className="text-sm font-black text-zinc-900">₱{(app.amount_php ?? SPOTLIGHT_PACKAGE.amount_php).toLocaleString()}</p>
            </div>
            <p className="text-xs text-zinc-500 mb-5">{SPOTLIGHT_PACKAGE.label} package</p>

            {PAYMENT_EDITABLE_STATUSES.includes(app.status) ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 rounded-lg p-3">
                  Send ₱{(app.amount_php ?? SPOTLIGHT_PACKAGE.amount_php).toLocaleString()} via your chosen method below, then enter your reference number and upload a screenshot of the transaction. Our team will confirm receipt and update your status.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Payment Method <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPayment((p) => ({ ...p, payment_method: value }))}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-bold transition-colors ${
                          payment.payment_method === value ? 'border-[#00cc6a] bg-[#00cc6a]/10 text-zinc-900' : 'border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Reference Number" required value={payment.payment_reference} onChange={(v) => setPayment((p) => ({ ...p, payment_reference: v }))} />
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Proof of Payment <span className="text-red-400">*</span></label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadProof(e.target.files[0])} />
                  {proofUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={proofUrl} alt="Payment proof" className="w-full max-w-xs rounded-lg border border-zinc-200" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full rounded-lg border-2 border-dashed border-zinc-300 py-8 flex flex-col items-center gap-2 text-zinc-400 hover:border-zinc-400 transition-colors disabled:opacity-60"
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                      <span className="text-xs font-semibold">{uploading ? 'Uploading…' : 'Upload screenshot'}</span>
                    </button>
                  )}
                  {proofUrl && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-zinc-500 hover:underline mt-2">
                      Replace screenshot
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSubmitPayment}
                  disabled={payingLoading}
                  className="w-full px-5 py-3 rounded-lg bg-[#00cc6a] text-black text-sm font-bold hover:bg-[#00b85e] disabled:opacity-60 transition-colors"
                >
                  {payingLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Submit Payment for Verification'}
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {app.status === 'payment_submitted' ? (
                    <Loader2 className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#00a855]" />
                  )}
                  <span className="font-semibold text-zinc-700">
                    {app.status === 'payment_submitted' ? 'Awaiting confirmation' : 'Payment confirmed'}
                  </span>
                </div>
                {app.payment_method && (
                  <p className="text-xs text-zinc-500">
                    {PAYMENT_METHOD_LABELS[app.payment_method]} · Ref: {app.payment_reference}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {locked && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 justify-center mt-6">
            <Lock className="h-3 w-3" /> Editing is locked while your feature is in production.
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required, disabled, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; disabled?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors"
      />
    </div>
  )
}

function AssetUpload({
  label, hint, required, disabled, field, onUpload, onClear,
}: {
  label: string
  hint?: string
  required?: boolean
  disabled?: boolean
  field: FileField
  onUpload: (file: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {hint && <p className="text-xs text-zinc-400 mb-2">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onUpload(f)
          e.target.value = ''
        }}
      />

      {field.url ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
          <ImageIcon className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium truncate flex-1">Uploaded</span>
          {!disabled && (
            <button type="button" onClick={onClear} className="text-zinc-400 hover:text-red-500 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || field.uploading}
          className="w-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 hover:border-[#00cc6a] transition-colors px-4 py-6 text-center disabled:opacity-60"
        >
          {field.uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </div>
          ) : (
            <>
              <Upload className="h-5 w-5 text-zinc-300 mx-auto mb-1.5" />
              <p className="text-sm text-zinc-500">Click to upload</p>
              <p className="text-xs text-zinc-400 mt-0.5">JPG, PNG, WEBP — max 5 MB</p>
            </>
          )}
        </button>
      )}
    </div>
  )
}

function SelectField({
  label, value, onChange, options, required, disabled,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TextareaField({
  label, value, onChange, maxLength, required, disabled,
}: { label: string; value: string; onChange: (v: string) => void; maxLength: number; required?: boolean; disabled?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-zinc-700">{label} {required && <span className="text-red-400">*</span>}</label>
        <span className="text-xs text-zinc-400">{value.length}/{maxLength}</span>
      </div>
      <textarea
        required={required}
        disabled={disabled}
        rows={3}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors resize-none"
      />
    </div>
  )
}

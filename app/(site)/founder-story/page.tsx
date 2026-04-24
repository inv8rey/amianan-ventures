'use client'

import { useState, useRef } from 'react'
import { ArrowRight, Loader2, CheckCircle2, Upload, X, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Story questions ────────────────────────────────────────────
const QUESTIONS = [
  { key: 'q1', label: 'How did the idea for your startup begin?' },
  { key: 'q2', label: 'What problem are you trying to solve?' },
  { key: 'q3', label: 'What does your startup actually do?' },
  { key: 'q4', label: 'What have you built or done so far?' },
  { key: 'q5', label: 'What has been the biggest challenge in building your startup?' },
  { key: 'q6', label: 'What keeps you motivated to continue building this startup?' },
  { key: 'q7', label: 'What are you working toward in the next 6 to 12 months?' },
  { key: 'q8', label: 'What advice would you give someone starting their first startup in the region?' },
] as const

type QuestionKey = typeof QUESTIONS[number]['key']

// ── File upload helper ─────────────────────────────────────────
interface FileField {
  file: File | null
  url: string | null
  uploading: boolean
  error: string | null
}

function emptyFile(): FileField {
  return { file: null, url: null, uploading: false, error: null }
}

function FileUpload({
  label,
  hint,
  required,
  accept,
  field,
  onChange,
}: {
  label: string
  hint?: string
  required?: boolean
  accept?: string
  field: FileField
  onChange: (f: FileField) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    onChange({ file, url: null, uploading: true, error: null })
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `founder-story/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('submission-assets').upload(path, file, { upsert: false })
    if (error) {
      onChange({ file, url: null, uploading: false, error: 'Upload failed. Try again.' })
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('submission-assets').getPublicUrl(path)
    onChange({ file, url: publicUrl, uploading: false, error: null })
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label}{required && ' *'}
      </label>
      {hint && <p className="text-xs text-zinc-400 mb-2">{hint}</p>}

      {field.url ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
          <ImageIcon className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium truncate flex-1">{field.file?.name}</span>
          <button
            type="button"
            onClick={() => onChange(emptyFile())}
            className="text-zinc-400 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 hover:border-amber-400 transition-colors px-4 py-6 text-center"
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
        </div>
      )}

      {field.error && (
        <p className="text-xs text-red-600 mt-1">{field.error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept ?? 'image/*'}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ── Input / Textarea helpers ───────────────────────────────────
const inputCls = 'w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors'
const textareaCls = `${inputCls} resize-none`

// ── Page ──────────────────────────────────────────────────────
export default function FounderStoryPage() {
  const [info, setInfo] = useState({
    name: '',
    email: '',
    startup_name: '',
    role: '',
    social_link: '',
    website: '',
  })
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.key, ''])) as Record<QuestionKey, string>
  )
  const [promo, setPromo] = useState('')
  const [founderPhoto, setFounderPhoto] = useState<FileField>(emptyFile())
  const [startupLogo, setStartupLogo] = useState<FileField>(emptyFile())
  const [productPhoto, setProductPhoto] = useState<FileField>(emptyFile())

  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const setInfo_ = (k: keyof typeof info, v: string) => setInfo((f) => ({ ...f, [k]: v }))
  const setAnswer = (k: QuestionKey, v: string) => setAnswers((a) => ({ ...a, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Require at least the first 3 questions answered
    const required: QuestionKey[] = ['q1', 'q2', 'q3']
    for (const key of required) {
      if (!answers[key].trim()) {
        setErrorMsg(`Please answer question ${required.indexOf(key) + 1}.`)
        setState('error')
        return
      }
    }
    // Founder photo required
    if (!founderPhoto.url) {
      setErrorMsg('Please upload a founder photo.')
      setState('error')
      return
    }

    setState('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.from('form_submissions').insert({
      type: 'founder-story',
      name: info.name,
      email: info.email,
      organization: info.startup_name,
      message: QUESTIONS.map((q, i) =>
        `${i + 1}. ${q.label}\n${answers[q.key] || '(not answered)'}`
      ).join('\n\n'),
      extra_data: {
        role: info.role,
        social_link: info.social_link,
        website: info.website,
        founder_photo_url: founderPhoto.url,
        startup_logo_url: startupLogo.url,
        product_photo_url: productPhoto.url,
        promo: promo,
        answers,
      },
    })

    if (error) {
      setErrorMsg('Submission failed. Please try again or email us at amiananventures@gmail.com')
      setState('error')
      return
    }
    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <CheckCircle2 className="h-14 w-14 text-[#d97706] mx-auto mb-5" />
        <h1 className="text-3xl font-black text-zinc-900 mb-3">Story Received!</h1>
        <p className="text-zinc-500 leading-relaxed max-w-md mx-auto mb-6">
          Thank you, <strong>{info.name}</strong>! We&apos;ll review your submission and reach out at <strong>{info.email}</strong> within a week.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-[#d97706] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#b45309] transition-colors uppercase tracking-wide"
        >
          Back to Home
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#d97706] mb-2">Founder Stories</p>
        <h1 className="text-4xl font-black text-zinc-900 mb-3 leading-tight">Share Your Innovation Story</h1>
        <p className="text-zinc-500 leading-relaxed max-w-lg">
          Are you a founder or innovator building something meaningful in Northern Luzon? Tell us your story — we&apos;ll amplify it to the entire Amianan community.
        </p>
      </div>

      {/* What to expect */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-5 mb-10">
        <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3">What happens next</p>
        <ol className="space-y-1.5 text-sm text-zinc-600 list-decimal list-inside">
          <li>Submit the form below</li>
          <li>Our team reviews it within a week and contacts you</li>
          <li>We may follow up for a brief interview or clarifications</li>
          <li>Your story gets published on Amianan Ventures</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ── Section 1: About You ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-5">
            About You
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Full Name *</label>
                <input required type="text" value={info.name} onChange={(e) => setInfo_('name', e.target.value)} placeholder="Your full name" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email *</label>
                <input required type="email" value={info.email} onChange={(e) => setInfo_('email', e.target.value)} placeholder="you@email.com" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Startup Name *</label>
                <input required type="text" value={info.startup_name} onChange={(e) => setInfo_('startup_name', e.target.value)} placeholder="Your startup or company" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Your Role *</label>
                <input required type="text" value={info.role} onChange={(e) => setInfo_('role', e.target.value)} placeholder="e.g. Co-founder & CEO" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">LinkedIn / Facebook Profile</label>
                <input type="url" value={info.social_link} onChange={(e) => setInfo_('social_link', e.target.value)} placeholder="https://linkedin.com/in/…" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Website</label>
                <input type="url" value={info.website} onChange={(e) => setInfo_('website', e.target.value)} placeholder="https://yourstartup.com" className={inputCls} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Story Questions ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-5">
            Your Story
          </h2>
          <p className="text-xs text-zinc-400 mb-5">Answer as many as you can. Questions 1–3 are required.</p>
          <div className="space-y-6">
            {QUESTIONS.map((q, i) => (
              <div key={q.key}>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  {i + 1}. {q.label}
                  {i < 3 && <span className="text-red-400 ml-1">*</span>}
                </label>
                <textarea
                  rows={4}
                  value={answers[q.key]}
                  onChange={(e) => setAnswer(q.key, e.target.value)}
                  placeholder="Share your thoughts…"
                  className={textareaCls}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Assets ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-5">
            Photos &amp; Assets
          </h2>
          <div className="space-y-5">
            <FileUpload
              label="Founder Photo"
              hint="A clear headshot or portrait. Used on your story page."
              required
              field={founderPhoto}
              onChange={setFounderPhoto}
            />
            <FileUpload
              label="Startup Logo"
              hint="Your company logo. PNG with transparent background preferred."
              field={startupLogo}
              onChange={setStartupLogo}
            />
            <FileUpload
              label="Product Photo / Screenshot (optional)"
              hint="A photo of your product, app screenshot, or team at work."
              field={productPhoto}
              onChange={setProductPhoto}
            />
          </div>
        </section>

        {/* ── Section 4: Promo ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-5">
            Anything to Promote?
          </h2>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Is there anything you&apos;d like to promote or share with the community?
            </label>
            <textarea
              rows={3}
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="e.g. We're hiring, launching soon, looking for investors, running a workshop…"
              className={textareaCls}
            />
          </div>
        </section>

        {/* Error */}
        {state === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center gap-2 bg-[#d97706] text-white px-7 py-3 rounded font-bold text-sm hover:bg-[#b45309] transition-colors disabled:opacity-60 uppercase tracking-wide"
        >
          {state === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Submit My Story <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  )
}

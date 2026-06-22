'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Upload, X, ImageIcon, Rocket, Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { STORY_SETS } from '@/types/spotlight'

// ── Story tracks ────────────────────────────────────────────────
type Track = 'founder' | 'innovation'

// Same canonical question bank used on the /spotlight Get Featured
// application form, so the two entry points never drift apart.
const FOUNDER_QUESTIONS = STORY_SETS['founding-rate']

const INNOVATION_QUESTIONS = [
  { key: 'q1', label: 'What is your role in the innovation or business ecosystem?', placeholder: 'Share your thoughts…', required: true },
  { key: 'q2', label: 'How did you get involved in this work?', placeholder: 'Share your thoughts…', required: true },
  { key: 'q3', label: 'What does your day-to-day work focus on?', placeholder: 'Share your thoughts…', required: true },
  { key: 'q4', label: "What's a project, program, or initiative you're proud of?", placeholder: 'Share your thoughts…', required: false },
  { key: 'q5', label: 'What has been the biggest challenge in this work?', placeholder: 'Share your thoughts…', required: false },
  { key: 'q6', label: 'What keeps you motivated to keep doing this work?', placeholder: 'Share your thoughts…', required: false },
  { key: 'q7', label: 'What are you working toward in the next 6 to 12 months?', placeholder: 'Share your thoughts…', required: false },
  { key: 'q8', label: 'What advice would you give to someone starting out in this space?', placeholder: 'Share your thoughts…', required: false },
  { key: 'q9', label: "What's an insight you've gained from working in the innovation or business ecosystem?", placeholder: 'Share your thoughts…', required: false },
] as const

const ALL_QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11'] as const
type QuestionKey = typeof ALL_QUESTION_KEYS[number]

const TRACK_COPY = {
  founder: {
    eyebrow: 'Founder Stories',
    title: 'Share Your Founder Story',
    subtitle: 'Are you a founder or innovator building a startup in Northern Luzon? Tell us your story — we’ll amplify it to the entire Amianan community.',
    orgLabel: 'Startup Name',
    orgPlaceholder: 'Your startup or company',
    photoLabel: 'Founder Photo',
    photoHint: 'A clear headshot or portrait. Used on your story page.',
    logoLabel: 'Startup Logo',
    logoHint: 'Your company logo. PNG with transparent background preferred.',
    workPhotoLabel: 'Product Photo / Screenshot (optional)',
    workPhotoHint: 'A photo of your product, app screenshot, or team at work.',
    questions: FOUNDER_QUESTIONS,
  },
  innovation: {
    eyebrow: 'Innovation Stories',
    title: 'Share Your Innovation Story',
    subtitle: 'Are you working in innovation, business support, or the startup ecosystem — even if you’re not a founder? Tell us your story — we’ll amplify it to the entire Amianan community.',
    orgLabel: 'Organization',
    orgPlaceholder: 'Your organization, program, or company',
    photoLabel: 'Your Photo',
    photoHint: 'A clear headshot or portrait. Used on your story page.',
    logoLabel: 'Organization Logo (optional)',
    logoHint: 'Your organization’s logo. PNG with transparent background preferred.',
    workPhotoLabel: 'Work / Project Photo (optional)',
    workPhotoHint: 'A photo of your work, a program in action, or your team.',
    questions: INNOVATION_QUESTIONS,
  },
} as const

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

// ── Track selection screen ─────────────────────────────────────
function TrackSelector({ onSelect }: { onSelect: (track: Track) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#d97706] mb-2">Share Your Story</p>
        <h1 className="text-4xl font-black text-zinc-900 mb-3 leading-tight">Which story fits you best?</h1>
        <p className="text-zinc-500 leading-relaxed max-w-lg">
          Northern Luzon&apos;s innovation ecosystem is built by founders and by the people supporting them. Pick whichever path matches your story.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect('founder')}
          className="group text-left rounded-xl border-2 border-zinc-200 hover:border-[#d97706] p-6 transition-colors"
        >
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <Rocket className="h-5 w-5 text-[#d97706]" />
          </div>
          <p className="text-base font-black text-zinc-900 mb-1.5">Founder / Startup Story</p>
          <p className="text-sm text-zinc-500 leading-relaxed">
            You&apos;re building a startup or company. Share how it started, what it does, and where it&apos;s going.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect('innovation')}
          className="group text-left rounded-xl border-2 border-zinc-200 hover:border-[#d97706] p-6 transition-colors"
        >
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <Lightbulb className="h-5 w-5 text-[#d97706]" />
          </div>
          <p className="text-base font-black text-zinc-900 mb-1.5">Innovation Story</p>
          <p className="text-sm text-zinc-500 leading-relaxed">
            You&apos;re not a founder, but you work in innovation, business support, or the startup ecosystem. Share your perspective.
          </p>
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function FounderStoryPage() {
  const [track, setTrack] = useState<Track | null>(null)

  const [info, setInfo] = useState({
    name: '',
    email: '',
    org: '',
    role: '',
    social_link: '',
    website: '',
  })
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>(
    Object.fromEntries(ALL_QUESTION_KEYS.map((k) => [k, ''])) as Record<QuestionKey, string>
  )
  const [founderPhoto, setFounderPhoto] = useState<FileField>(emptyFile())
  const [startupLogo, setStartupLogo] = useState<FileField>(emptyFile())
  const [productPhoto, setProductPhoto] = useState<FileField>(emptyFile())

  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const setInfo_ = (k: keyof typeof info, v: string) => setInfo((f) => ({ ...f, [k]: v }))
  const setAnswer = (k: QuestionKey, v: string) => setAnswers((a) => ({ ...a, [k]: v }))

  if (!track) {
    return <TrackSelector onSelect={setTrack} />
  }

  const copy = TRACK_COPY[track]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const requiredQuestions = copy.questions.filter((q) => q.required)
    for (const q of requiredQuestions) {
      if (!answers[q.key as QuestionKey].trim()) {
        setErrorMsg(`Please answer: ${q.label}`)
        setState('error')
        return
      }
    }
    // Photo required
    if (!founderPhoto.url) {
      setErrorMsg(`Please upload a photo.`)
      setState('error')
      return
    }

    setState('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.from('form_submissions').insert({
      type: track === 'founder' ? 'founder-story' : 'innovation-story',
      name: info.name,
      email: info.email,
      organization: info.org,
      message: copy.questions.map((q, i) =>
        `${i + 1}. ${q.label}\n${answers[q.key] || '(not answered)'}`
      ).join('\n\n'),
      extra_data: {
        track,
        role: info.role,
        social_link: info.social_link,
        website: info.website,
        founder_photo_url: founderPhoto.url,
        startup_logo_url: startupLogo.url,
        product_photo_url: productPhoto.url,
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
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#d97706] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#b45309] transition-colors uppercase tracking-wide"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setTrack(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors mb-4 uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Change story type
        </button>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#d97706] mb-2">{copy.eyebrow}</p>
        <h1 className="text-4xl font-black text-zinc-900 mb-3 leading-tight">{copy.title}</h1>
        <p className="text-zinc-500 leading-relaxed max-w-lg">{copy.subtitle}</p>
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
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{copy.orgLabel} *</label>
                <input required type="text" value={info.org} onChange={(e) => setInfo_('org', e.target.value)} placeholder={copy.orgPlaceholder} className={inputCls} />
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
                <input type="url" value={info.website} onChange={(e) => setInfo_('website', e.target.value)} placeholder="https://example.com" className={inputCls} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Story Questions ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 mb-5">
            Your Story
          </h2>
          <p className="text-xs text-zinc-400 mb-5">Answer as many as you can. Required questions are marked with an asterisk.</p>
          <div className="space-y-6">
            {copy.questions.map((q, i) => (
              <div key={q.key}>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  {i + 1}. {q.label}
                  {q.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <textarea
                  rows={4}
                  value={answers[q.key as QuestionKey]}
                  onChange={(e) => setAnswer(q.key as QuestionKey, e.target.value)}
                  placeholder={q.placeholder}
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
              label={copy.photoLabel}
              hint={copy.photoHint}
              required
              field={founderPhoto}
              onChange={setFounderPhoto}
            />
            <FileUpload
              label={copy.logoLabel}
              hint={copy.logoHint}
              field={startupLogo}
              onChange={setStartupLogo}
            />
            <FileUpload
              label={copy.workPhotoLabel}
              hint={copy.workPhotoHint}
              field={productPhoto}
              onChange={setProductPhoto}
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

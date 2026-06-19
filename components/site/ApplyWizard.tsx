'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Check, Loader2, CheckCircle2, Clock, Lock,
  FileSearch, CreditCard, PenSquare, Send,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const INDUSTRIES = [
  'AgriTech', 'EdTech', 'HealthTech', 'FinTech', 'E-Commerce',
  'Tourism & Hospitality', 'Creative Industries', 'GovTech',
  'Climate / GreenTech', 'Social Enterprise', 'Other',
]

const REGIONS = ['Cordillera', 'Cagayan Valley', 'Ilocos Region', 'Pangasinan', 'National']

const BENEFITS = [
  'Professional Story Feature',
  'Increased Visibility',
  'Startup Directory Listing',
  'Content Assets You Can Reuse',
]

const REVIEW_STEPS = [
  { icon: FileSearch, title: 'Application Review', desc: 'Applications reviewed within 1–3 business days.' },
  { icon: CreditCard, title: 'Approval',           desc: 'If approved, we’ll send payment instructions.' },
  { icon: PenSquare,  title: 'Story Production',   desc: 'We’ll interview you and create your story and content assets.' },
  { icon: Send,       title: 'Publication',        desc: 'Your story will be published and promoted.' },
]

const NEXT_STEPS = [
  'Application Review', 'Approval Notification', 'Payment Instructions', 'Story Production', 'Publication',
]

interface FormState {
  business_name: string
  industry: string
  region: string
  website: string
  contact_name: string
  email: string
  phone: string
  what_you_do: string
  problem: string
  impact: string
  why_feature: string
}

const EMPTY_FORM: FormState = {
  business_name: '', industry: '', region: '', website: '',
  contact_name: '', email: '', phone: '',
  what_you_do: '', problem: '', impact: '', why_feature: '',
}

interface ScreenProps {
  form: FormState
  set: (key: keyof FormState, val: string) => void
  onNext: () => void
  onBack: () => void
}

export function ApplyWizard() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const set = (key: keyof FormState, val: string) => setForm((f) => ({ ...f, [key]: val }))
  const next = () => setStep((s) => Math.min(5, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  async function handleSubmit() {
    setLoading(true)
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.from('form_submissions').insert({
      type: 'spotlight',
      name: form.contact_name,
      email: form.email,
      organization: form.business_name,
      message: form.why_feature,
      extra_data: {
        industry: form.industry,
        region: form.region,
        website: form.website,
        phone: form.phone,
        what_you_do: form.what_you_do,
        problem: form.problem,
        impact: form.impact,
      },
    })

    setLoading(false)
    if (error) {
      setErrorMsg('Submission failed. Please try again or email us directly at amiananventures@gmail.com.')
      return
    }
    setStep(5)
  }

  return (
    <div className="min-h-screen bg-white">
      {step > 1 && <Stepper step={step} />}
      {step === 1 && <WelcomeScreen onStart={next} />}
      {step === 2 && <BusinessInfoScreen form={form} set={set} onNext={next} onBack={back} />}
      {step === 3 && <StoryScreen form={form} set={set} onNext={next} onBack={back} />}
      {step === 4 && (
        <ReviewScreen onSubmit={handleSubmit} onBack={back} loading={loading} error={errorMsg} />
      )}
      {step === 5 && <SuccessScreen name={form.contact_name} />}
    </div>
  )
}

// ── Progress stepper ──────────────────────────────────────────────
function Stepper({ step }: { step: number }) {
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-center gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex items-center gap-2 sm:gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                n < step ? 'bg-[#0a3a22] text-white' : n === step ? 'bg-[#00cc6a] text-black' : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {n < step ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            {n < 5 && <div className={`w-6 sm:w-14 h-px ${n < step ? 'bg-[#0a3a22]' : 'bg-zinc-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Screen 1: Welcome ─────────────────────────────────────────────
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16">
        <div className="max-w-md mx-auto lg:mx-0 w-full">
          <Link href="/get-featured" className="inline-flex items-center gap-2 mb-10 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-4">Get Featured</p>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 leading-[1.05] mb-5">
            Let&apos;s Tell<br />Your Story.
          </h1>
          <p className="text-base text-zinc-500 leading-relaxed mb-8">
            Share what you&apos;re building and why it matters. We&apos;ll review your application and guide you through the rest.
          </p>

          <div className="space-y-3 mb-10">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-[#00a855]" />
                </div>
                <span className="text-sm font-semibold text-zinc-700">{b}</span>
              </div>
            ))}
          </div>

          {/* Process visualization */}
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            {['Apply', 'Review', 'Get Featured'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">{label}</span>
                {i < 2 && <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />}
              </div>
            ))}
          </div>

          <button
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#0a3a22] text-white font-bold text-base hover:bg-[#042212] transition-colors w-full sm:w-auto"
          >
            Start Application <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-xs text-zinc-400 mt-4 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Takes less than 5 minutes
          </p>
        </div>
      </div>

      {/* Right: image */}
      <div className="relative hidden lg:block">
        <Image src="/get-featured-hero.png" alt="Founders across Northern Luzon" fill priority className="object-cover object-center" sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/50">
          <p className="text-sm font-semibold text-zinc-800 leading-relaxed italic">
            &ldquo;Amianan Ventures helped us share our story and connect with the right people.&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Screen 2: Business Information ────────────────────────────────
function BusinessInfoScreen({ form, set, onNext, onBack }: ScreenProps) {
  const [error, setError] = useState('')

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (!form.business_name || !form.industry || !form.region || !form.contact_name || !form.email) {
      setError('Please fill out all required fields.')
      return
    }
    setError('')
    onNext()
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 sm:py-16">
      <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-3">Step 2 of 5</p>
      <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight mb-3">Tell us about your business.</h2>
      <p className="text-base text-zinc-500 mb-10">Basic information to help us get to know you.</p>

      <form onSubmit={handleNext} className="space-y-5">
        <Field label="Business / Startup Name" required value={form.business_name} onChange={(v) => set('business_name', v)} placeholder="e.g. Vidad Food Processing" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SelectField label="Industry" required value={form.industry} onChange={(v) => set('industry', v)} options={INDUSTRIES} placeholder="Select industry…" />
          <SelectField label="Region" required value={form.region} onChange={(v) => set('region', v)} options={REGIONS} placeholder="Select region…" />
        </div>

        <Field label="Website / Facebook Page" value={form.website} onChange={(v) => set('website', v)} placeholder="facebook.com/yourbusiness" />

        <Field label="Founder / Contact Person" required value={form.contact_name} onChange={(v) => set('contact_name', v)} placeholder="Juan Dela Cruz" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Email Address" type="email" required value={form.email} onChange={(v) => set('email', v)} placeholder="you@example.com" />
          <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => set('phone', v)} placeholder="09XX XXX XXXX" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex items-center justify-between pt-4">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button type="submit" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0a3a22] text-white font-bold text-sm hover:bg-[#042212] transition-colors">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Screen 3: Your Story ──────────────────────────────────────────
function StoryScreen({ form, set, onNext, onBack }: ScreenProps) {
  const [error, setError] = useState('')

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (!form.what_you_do || !form.problem || !form.impact || !form.why_feature) {
      setError('Please answer all questions.')
      return
    }
    setError('')
    onNext()
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 sm:py-16">
      <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-3">Step 3 of 5</p>
      <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight mb-3">What makes your story worth telling?</h2>
      <p className="text-base text-zinc-500 mb-10">We&apos;d love to learn more about your journey, impact, and vision.</p>

      <form onSubmit={handleNext} className="space-y-6">
        <TextareaField label="What does your business do?" value={form.what_you_do} onChange={(v) => set('what_you_do', v)} maxLength={500} placeholder="Describe your product or service…" />
        <TextareaField label="What problem are you solving?" value={form.problem} onChange={(v) => set('problem', v)} maxLength={500} placeholder="What gap or need does your business address?" />
        <TextareaField label="What impact are you creating?" value={form.impact} onChange={(v) => set('impact', v)} maxLength={500} placeholder="Who benefits, and how?" />
        <TextareaField label="Why should we feature your story?" value={form.why_feature} onChange={(v) => set('why_feature', v)} maxLength={500} placeholder="What makes your journey inspiring or worth sharing?" />

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex items-center justify-between pt-4">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button type="submit" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0a3a22] text-white font-bold text-sm hover:bg-[#042212] transition-colors">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Screen 4: Review Process ───────────────────────────────────────
function ReviewScreen({ onSubmit, onBack, loading, error }: { onSubmit: () => void; onBack: () => void; loading: boolean; error: string }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
      <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-3 text-center">Step 4 of 5</p>
      <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight mb-3 text-center">Here&apos;s what happens next.</h2>
      <p className="text-base text-zinc-500 mb-12 text-center">Our simple and transparent process.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {REVIEW_STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="w-10 h-10 rounded-full bg-[#0a3a22] flex items-center justify-center mb-4">
              <s.icon className="h-4 w-4 text-[#00cc6a]" />
            </div>
            <p className="text-xs font-black text-zinc-300 mb-1">0{i + 1}</p>
            <p className="text-sm font-bold text-zinc-900 mb-1.5">{s.title}</p>
            <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2.5 rounded-xl bg-[#00a855]/8 px-5 py-4 text-center mb-10 flex-wrap">
        <Lock className="h-4 w-4 text-[#00a855] shrink-0" />
        <p className="text-sm text-zinc-700">Payment is requested only after your application has been reviewed and approved.</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 text-center mb-6 max-w-md mx-auto">{error}</p>}

      <div className="flex items-center justify-between max-w-md mx-auto">
        <button onClick={onBack} disabled={loading} className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00cc6a] text-black font-bold text-base hover:bg-[#00b85e] disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Application <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  )
}

// ── Screen 5: Success ──────────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 sm:py-28 text-center">
      <div className="w-20 h-20 rounded-full bg-[#00a855]/10 flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="h-10 w-10 text-[#00a855]" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3">Application Submitted.</h2>
      <p className="text-base text-zinc-600 mb-2">Thank you{name ? `, ${name}` : ''}, for sharing your story.</p>
      <p className="text-sm text-zinc-400 mb-10 max-w-md mx-auto leading-relaxed">
        Our team will review your application and get back to you within 1–3 business days.
      </p>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 mb-10 text-left">
        <p className="text-sm font-black text-zinc-900 mb-4">What happens next?</p>
        <div className="space-y-3">
          {NEXT_STEPS.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-[#00a855] shrink-0" />
              <span className="text-sm font-semibold text-zinc-700">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link href="/founder-stories" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-zinc-900 text-zinc-900 font-bold text-sm hover:bg-zinc-900 hover:text-white transition-colors">
          View Featured Stories
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0a3a22] text-white font-bold text-sm hover:bg-[#042212] transition-colors">
          Back to Homepage
        </Link>
      </div>
    </div>
  )
}

// ── Form field primitives ──────────────────────────────────────────
function Field({
  label, value, onChange, type = 'text', required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
      />
    </div>
  )
}

function SelectField({
  label, value, onChange, options, required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors bg-white"
      >
        <option value="">{placeholder ?? 'Select…'}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TextareaField({
  label, value, onChange, maxLength, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; maxLength: number; placeholder?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-zinc-700">{label} <span className="text-red-400">*</span></label>
        <span className="text-xs text-zinc-400">{value.length}/{maxLength}</span>
      </div>
      <textarea
        required
        rows={3}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors resize-none"
      />
    </div>
  )
}

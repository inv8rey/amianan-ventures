'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STAGES = ['Idea / Pre-MVP', 'MVP', 'Early Stage', 'Growth', 'Scaling']

const SECTORS = [
  'AgriTech', 'EdTech', 'HealthTech', 'FinTech', 'E-Commerce',
  'Tourism & Hospitality', 'Creative Industries', 'GovTech',
  'Climate / GreenTech', 'Social Enterprise', 'Other',
]

const LOCATIONS = [
  'Baguio City', 'Cordillera (non-Baguio)', 'Cagayan Valley',
  'Ilocos Region', 'Pangasinan', 'Other in Northern Luzon',
]

export default function SubmitStartupPage() {
  const [form, setForm] = useState({
    startup_name: '',
    founder_name: '',
    email: '',
    website: '',
    location: '',
    sector: '',
    stage: '',
    description: '',
  })
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.from('form_submissions').insert({
      type: 'startup',
      name: form.founder_name,
      email: form.email,
      organization: form.startup_name,
      message: form.description,
      extra_data: {
        website: form.website,
        location: form.location,
        sector: form.sector,
        stage: form.stage,
      },
    })

    if (error) {
      setErrorMsg('Submission failed. Please try again or email us directly.')
      setState('error')
      return
    }
    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <CheckCircle2 className="h-14 w-14 text-[#00cc6a] mx-auto mb-5" />
        <h1 className="text-3xl font-black text-zinc-900 mb-3">Startup Submitted!</h1>
        <p className="text-zinc-500 leading-relaxed max-w-md mx-auto">
          Thanks for submitting your startup. We&apos;ll review it and reach out to you at <strong>{form.email}</strong> within a few days.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00a855] mb-2">Submit</p>
        <h1 className="text-4xl font-black text-zinc-900 mb-3 leading-tight">Submit a Startup</h1>
        <p className="text-zinc-500 leading-relaxed max-w-lg">
          Add your startup to the Northern Luzon innovation ecosystem directory. We feature startups, early-stage ventures, and emerging businesses from Baguio, Cordillera, and surrounding regions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Startup info */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">About Your Startup</legend>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Startup / Organization Name *</label>
            <input
              required
              type="text"
              value={form.startup_name}
              onChange={(e) => set('startup_name', e.target.value)}
              placeholder="e.g. BaguioTech Solutions"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Location *</label>
              <select
                required
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors bg-white"
              >
                <option value="">Select region…</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Sector *</label>
              <select
                required
                value={form.sector}
                onChange={(e) => set('sector', e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors bg-white"
              >
                <option value="">Select sector…</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Stage *</label>
              <select
                required
                value={form.stage}
                onChange={(e) => set('stage', e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors bg-white"
              >
                <option value="">Select stage…</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Website (optional)</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">What does your startup do? *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Briefly describe your startup, the problem you solve, and who you serve…"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors resize-none"
            />
          </div>
        </fieldset>

        {/* Contact */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Your Contact</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Your Name *</label>
              <input
                required
                type="text"
                value={form.founder_name}
                onChange={(e) => set('founder_name', e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@startup.com"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
              />
            </div>
          </div>
        </fieldset>

        {state === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center gap-2 bg-[#00cc6a] text-black px-7 py-3 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors disabled:opacity-60 uppercase tracking-wide"
        >
          {state === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Submit Startup <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  )
}

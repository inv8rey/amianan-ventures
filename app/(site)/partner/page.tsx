'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PARTNERSHIP_TYPES = [
  'Content Partnership (articles, features)',
  'Event Sponsorship',
  'Featured Listing / Homepage Placement',
  'Program or Initiative Coverage',
  'Community Partnership',
  'Other',
]

export default function PartnerPage() {
  const [form, setForm] = useState({
    org_name: '',
    contact_name: '',
    email: '',
    website: '',
    partnership_type: '',
    message: '',
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
      type: 'partner',
      name: form.contact_name,
      email: form.email,
      organization: form.org_name,
      message: form.message,
      extra_data: {
        website: form.website,
        partnership_type: form.partnership_type,
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
        <h1 className="text-3xl font-black text-zinc-900 mb-3">Inquiry Received!</h1>
        <p className="text-zinc-500 leading-relaxed max-w-md mx-auto">
          Thanks for reaching out about a partnership. We&apos;ll get back to you at <strong>{form.email}</strong> within 2–3 business days.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00a855] mb-2">Partnerships</p>
        <h1 className="text-4xl font-black text-zinc-900 mb-3 leading-tight">Partner With Us</h1>
        <p className="text-zinc-500 leading-relaxed max-w-lg">
          Amianan Ventures reaches founders, innovators, investors, and ecosystem builders across Northern Luzon. Partner with us to amplify your programs, initiatives, or organization to the right audience.
        </p>
      </div>

      {/* Partnership types callout */}
      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-5 mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">What we offer</p>
        <ul className="space-y-1.5 text-sm text-zinc-600">
          {PARTNERSHIP_TYPES.slice(0, -1).map((t) => (
            <li key={t} className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#00cc6a] shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Organization</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Organization Name *</label>
              <input
                required
                type="text"
                value={form.org_name}
                onChange={(e) => set('org_name', e.target.value)}
                placeholder="Your organization"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
              />
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
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Partnership Interest *</label>
            <select
              required
              value={form.partnership_type}
              onChange={(e) => set('partnership_type', e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors bg-white"
            >
              <option value="">Select type of partnership…</option>
              {PARTNERSHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Tell us more *</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="Describe what you have in mind — your goals, audience, and how you'd like to collaborate…"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors resize-none"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Your Contact</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Your Name *</label>
              <input
                required
                type="text"
                value={form.contact_name}
                onChange={(e) => set('contact_name', e.target.value)}
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
                placeholder="you@org.com"
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
            <>Send Inquiry <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  )
}

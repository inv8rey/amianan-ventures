'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const REGIONS = ['Cordillera', 'Cagayan Valley', 'Ilocos Region', 'Pangasinan', 'National']

export function SpotlightApplicationForm() {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    region: '',
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
      type: 'spotlight',
      name: form.contact_name,
      email: form.email,
      organization: form.business_name,
      message: form.message,
      extra_data: {
        phone: form.phone,
        website: form.website,
        region: form.region,
      },
    })

    if (error) {
      setErrorMsg('Submission failed. Please try again or email us directly at amiananventures@gmail.com.')
      setState('error')
      return
    }
    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#00cc6a] mx-auto mb-4" />
        <h3 className="text-xl font-black text-zinc-900 mb-2">Application Received!</h3>
        <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Thanks for applying, <strong>{form.contact_name || 'founder'}</strong>. We&apos;ll reach out at{' '}
          <strong>{form.email}</strong> within 2–3 business days to schedule your intake conversation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Business / Startup Name *</label>
          <input
            required
            type="text"
            value={form.business_name}
            onChange={(e) => set('business_name', e.target.value)}
            placeholder="e.g. Vidad Food Processing"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Your Name *</label>
          <input
            required
            type="text"
            value={form.contact_name}
            onChange={(e) => set('contact_name', e.target.value)}
            placeholder="Founder / contact person"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="09XX XXX XXXX"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Website / Social Media</label>
          <input
            type="text"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="facebook.com/yourbusiness"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Region *</label>
          <select
            required
            value={form.region}
            onChange={(e) => set('region', e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors bg-white"
          >
            <option value="">Select region…</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Tell us about your business *</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder="What do you do, who do you serve, and what makes your story worth telling?"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors resize-none"
        />
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex items-center gap-2 bg-[#00cc6a] text-black px-7 py-3.5 rounded-lg font-bold text-sm hover:bg-[#00b85e] transition-colors disabled:opacity-60"
      >
        {state === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>Submit Application <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </form>
  )
}

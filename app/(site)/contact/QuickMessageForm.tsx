'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function QuickMessageForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (key: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.from('form_submissions').insert({
      type: 'partner',
      name: form.name,
      email: form.email,
      message: form.message,
      extra_data: { form_source: 'contact_quick_message' },
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
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-[#00cc6a] mx-auto mb-3" />
        <p className="font-black text-zinc-900 mb-1">Message Sent!</p>
        <p className="text-sm text-zinc-500">
          We&apos;ll get back to you at <strong>{form.email}</strong> within 2–3 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Name *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Your full name"
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
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Message *</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder="Tell us what you have in mind…"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors resize-none"
        />
      </div>

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
          <>Send Message <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </form>
  )
}

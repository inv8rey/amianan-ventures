'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function FounderStoryPage() {
  const [form, setForm] = useState({
    founder_name: '',
    startup_company: '',
    email: '',
    social_link: '',
    story: '',
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
      type: 'founder-story',
      name: form.founder_name,
      email: form.email,
      organization: form.startup_company,
      message: form.story,
      extra_data: {
        social_link: form.social_link,
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
        <CheckCircle2 className="h-14 w-14 text-[#d97706] mx-auto mb-5" />
        <h1 className="text-3xl font-black text-zinc-900 mb-3">Story Received!</h1>
        <p className="text-zinc-500 leading-relaxed max-w-md mx-auto">
          Thank you for sharing your story, <strong>{form.founder_name}</strong>. Our team will review it and get back to you at <strong>{form.email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#d97706] mb-2">Founder Stories</p>
        <h1 className="text-4xl font-black text-zinc-900 mb-3 leading-tight">Share Your Innovation Story</h1>
        <p className="text-zinc-500 leading-relaxed max-w-lg">
          Are you a founder, innovator, or changemaker building something meaningful in Northern Luzon? We want to amplify your story and inspire others in the region.
        </p>
      </div>

      {/* What to expect */}
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-5 mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3">What happens next</p>
        <ol className="space-y-2 text-sm text-zinc-600 list-decimal list-inside">
          <li>Submit your story and background below</li>
          <li>Our team reviews and follows up within a week</li>
          <li>We&apos;ll schedule a brief interview or written Q&A</li>
          <li>Your story gets published on Amianan Ventures</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">About You</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Your Name *</label>
              <input
                required
                type="text"
                value={form.founder_name}
                onChange={(e) => set('founder_name', e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Startup / Company *</label>
              <input
                required
                type="text"
                value={form.startup_company}
                onChange={(e) => set('startup_company', e.target.value)}
                placeholder="Where you work or founded"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors"
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
                placeholder="you@email.com"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">LinkedIn / Social (optional)</label>
              <input
                type="url"
                value={form.social_link}
                onChange={(e) => set('social_link', e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Your Story</legend>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Tell us about your journey *
            </label>
            <textarea
              required
              rows={7}
              value={form.story}
              onChange={(e) => set('story', e.target.value)}
              placeholder="Share your story — what inspired you to start, the challenges you faced, your milestones, and what you're building for the region. There's no minimum length — just be genuine."
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors resize-none"
            />
          </div>
        </fieldset>

        {state === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center gap-2 bg-[#d97706] text-white px-7 py-3 rounded font-bold text-sm hover:bg-[#b45309] transition-colors disabled:opacity-60 uppercase tracking-wide"
        >
          {state === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Share My Story <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  )
}

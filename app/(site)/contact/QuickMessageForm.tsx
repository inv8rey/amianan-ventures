'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { TOPICS, type Topic } from './topics'


const PLACEHOLDER: Record<Topic, string> = {
  question: 'What would you like to know?',
  story: 'Who or what should we write about?',
  opportunity: 'Name of the program, who runs it, the deadline, and a link if you have one.',
  partnership: 'Tell us about your organization and what you have in mind.',
  ambassador: 'Where are you based, and how are you involved in your local startup scene?',
}

const field =
  'w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-[#131314]'

export function QuickMessageForm({ initialTopic = 'question' }: { initialTopic?: Topic }) {
  const [topic, setTopic] = useState<Topic>(initialTopic)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const set = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    const { error } = await createClient().from('form_submissions').insert({
      type: 'partner',
      name: form.name,
      email: form.email,
      message: form.message,
      extra_data: { form_source: 'contact_quick_message', topic },
    })
    setState(error ? 'error' : 'success')
  }

  if (state === 'success') {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#65a30d]" aria-hidden />
        <p className="font-semibold text-zinc-900">Message sent.</p>
        <p className="mt-1 text-sm text-zinc-600">
          We&apos;ll reply to <strong>{form.email}</strong> within 2–3 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-zinc-800">I&apos;m reaching out about</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <label
              key={t.value}
              className={cn(
                'cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#131314]/40',
                topic === t.value ? 'border-[#131314] bg-[#131314] text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:border-[#131314]'
              )}
            >
              <input
                type="radio"
                name="topic"
                value={t.value}
                checked={topic === t.value}
                onChange={() => setTopic(t.value)}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cm-name" className="mb-1.5 block text-sm font-semibold text-zinc-800">Name</label>
          <input id="cm-name" required type="text" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="cm-email" className="mb-1.5 block text-sm font-semibold text-zinc-800">Email</label>
          <input id="cm-email" required type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="cm-message" className="mb-1.5 block text-sm font-semibold text-zinc-800">Message</label>
        <textarea
          id="cm-message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder={PLACEHOLDER[topic]}
          className={cn(field, 'resize-none')}
        />
      </div>

      {state === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Your message didn&apos;t go through. Please try again, or email us at amiananventures@gmail.com.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#befc65] px-6 text-sm font-semibold text-[#131314] transition-colors hover:bg-[#d0ff8a] disabled:opacity-60"
      >
        {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Sending" /> : <>Send message <ArrowRight className="h-4 w-4" aria-hidden /></>}
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function NewsletterSignup({ source = 'homepage' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase(), source })

    if (error) {
      if (error.code === '23505') {
        // Unique violation — already subscribed
        setState('success')
      } else {
        setErrorMsg('Something went wrong. Please try again.')
        setState('error')
      }
      return
    }

    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-3 text-[#00cc6a]">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold">You&apos;re in! We&apos;ll keep you updated.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 rounded px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-[#00cc6a] transition-colors"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex items-center justify-center gap-2 bg-[#00cc6a] text-black px-5 py-2.5 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors disabled:opacity-60 whitespace-nowrap uppercase tracking-wide"
      >
        {state === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Subscribe'
        )}
      </button>
      {state === 'error' && (
        <p className="text-xs text-red-400 mt-1 sm:col-span-2">{errorMsg}</p>
      )}
    </form>
  )
}

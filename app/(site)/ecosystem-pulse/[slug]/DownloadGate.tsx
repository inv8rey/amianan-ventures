'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

export function DownloadGate({ reportId, reportTitle }: { reportId: string; reportTitle: string }) {
  const [name, setName]         = useState('')
  const [org, setOrg]           = useState('')
  const [email, setEmail]       = useState('')
  const [status, setStatus]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/ecosystem-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, name, organization: org, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setStatus('done')
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border-2 border-[#00cc6a] bg-[#00cc6a]/5 p-8 text-center">
        <CheckCircle className="h-10 w-10 text-[#00a855] mx-auto mb-3" />
        <h3 className="text-lg font-black text-zinc-900 mb-1">Check your inbox</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
          We've sent the download link for <strong>{reportTitle}</strong> to <strong>{email}</strong>.
          <br />If it doesn't arrive within a few minutes, check your spam folder.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-zinc-900 bg-white overflow-hidden shadow-lg">
      {/* Card header band */}
      <div className="bg-zinc-900 px-6 py-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Get the full report</h3>
        <p className="text-[11px] text-white/50 mt-0.5">Free · Instant email delivery</p>
      </div>

      <div className="p-6">
      <p className="text-xs text-zinc-500 mb-5">
        Enter your details and we'll send the download link straight to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">Full name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Maria Santos"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">Organization</label>
            <input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="MMSU, DTI, startup name…"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">Email address *</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="you@example.com"
          />
        </div>

        {status === 'error' && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
          ) : (
            <>Send me the report <ArrowRight className="h-4 w-4" /></>
          )}
        </button>

        <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
          No spam. Your details help us understand who reads our research.
          You may receive occasional updates from Amianan Ventures.
        </p>
      </form>
      </div>
    </div>
  )
}

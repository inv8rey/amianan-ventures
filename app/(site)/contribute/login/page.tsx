'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ContributorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Check contributor profile exists — if not, this might be an admin account
    const { data: profile } = await supabase
      .from('contributor_profiles')
      .select('id')
      .eq('id', data.user.id)
      .single()

    // Hard navigation, not router.push — the client-side Router Cache keys
    // by route, not by session, so a previously cached /dashboard or
    // /spotlight RSC payload from a *different* signed-in account in this
    // same tab could otherwise be served to whoever logs in next.
    if (!profile) {
      // Admin account — redirect to admin
      window.location.href = '/admin'
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <PenLine className="h-4 w-4 text-[#00cc6a]" />
          </div>
          <span className="text-sm font-bold text-zinc-900">Contributor Portal</span>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-8">
          <h1 className="text-xl font-black text-zinc-900 mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-500 mb-6">Sign in to your contributor account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/contribute/signup" className="text-[#00a855] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-4">
          <Link href="/contribute" className="hover:underline">← Back to contributor info</Link>
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Loader2, PenLine, Users, FileText, Rocket, TrendingUp,
  Mail, Lock, Eye, EyeOff, ShieldCheck, Leaf, LogIn,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { DecorativeSkyline } from '@/components/site/DecorativeSkyline'

const FEATURES = [
  { icon: Users, title: 'Community', desc: 'Connect with founders and partners' },
  { icon: FileText, title: 'Stories', desc: 'Share updates that inspire and inform' },
  { icon: Rocket, title: 'Opportunities', desc: 'Discover programs, events, and resources' },
  { icon: TrendingUp, title: 'Growth', desc: 'Help strengthen the innovation ecosystem' },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Secure & trusted' },
  { icon: Users, label: 'Community-driven' },
  { icon: Leaf, label: 'Built for impact' },
]

export default function ContributorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
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
    <div className="bg-[#042212] flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">

        {/* ── Left: marketing panel ── */}
        <div className="relative overflow-hidden px-6 sm:px-10 lg:px-16 py-14 lg:py-20 min-h-[420px] lg:min-h-0 flex flex-col">
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
            <span className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold uppercase tracking-wider mb-8">
              <Users className="h-3.5 w-3.5 text-[#00cc6a]" /> Contributor Portal
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
              Welcome back! Let&apos;s keep building{' '}
              <span className="text-[#00cc6a]">Northern Luzon</span> together.
            </h1>
            <p className="text-zinc-300 leading-relaxed mb-10 max-w-sm">
              Sign in to continue sharing ideas, stories, and opportunities that drive innovation and impact across our region.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <div className="w-9 h-9 rounded-full bg-[#00cc6a]/10 flex items-center justify-center mb-2.5">
                    <f.icon className="h-4 w-4 text-[#00cc6a]" />
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">{f.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <DecorativeSkyline />
        </div>

        {/* ── Right: form card ── */}
        <div className="flex items-center justify-center px-4 sm:px-8 py-12 lg:py-20">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-11 shadow-2xl">
            <div className="flex items-start gap-4 pb-6 mb-6 border-b border-zinc-100">
              <div className="w-12 h-12 rounded-xl bg-[#00a855]/10 flex items-center justify-center shrink-0">
                <PenLine className="h-5 w-5 text-[#00a855]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 leading-tight">Welcome back</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Sign in to your contributor account</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-9 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-[#00a855] focus:ring-[#00a855]"
                  />
                  Remember me
                </label>
                <Link href="/contribute/forgot-password" className="text-sm font-semibold text-[#00a855] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#042212] text-white text-sm font-bold hover:bg-[#06331c] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Sign In
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/contribute/signup" className="text-[#00a855] font-semibold hover:underline">
                Sign up
              </Link>
            </p>

            <p className="text-center text-xs text-zinc-400 mt-5 pt-5 border-t border-zinc-100">
              <Link href="/contribute" className="hover:underline">← Back to contributor info</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom trust strip ── */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4">
          {TRUST_BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
              <b.icon className="h-4 w-4 text-[#00cc6a]" />
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2, PenLine, Users, BarChart3, Star, User, Briefcase,
  Mail, Lock, Eye, EyeOff, ShieldCheck, UserPlus, Leaf,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ROLE_LABELS, type ContributorRole } from '@/types/contributor'

const FEATURES = [
  { icon: PenLine, label: 'Share your story and opportunities' },
  { icon: Users, label: 'Connect with founders and partners' },
  { icon: BarChart3, label: 'Grow the Northern Luzon ecosystem' },
  { icon: Star, label: 'Get recognized for your contributions' },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Secure & trusted' },
  { icon: Users, label: 'Community-driven' },
  { icon: Leaf, label: 'Built for impact' },
]

function DecorativeSkyline() {
  return (
    <svg
      viewBox="0 0 600 220"
      className="absolute bottom-0 left-0 w-full h-auto pointer-events-none opacity-90"
      preserveAspectRatio="xMidYMax slice"
    >
      <path d="M0 220 L60 130 L110 170 L170 90 L230 160 L290 110 L340 170 L400 70 L460 150 L520 120 L600 220 Z" fill="none" stroke="#00cc6a" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="40" y="160" width="18" height="60" fill="#00cc6a" opacity="0.12" />
      <rect x="65" y="180" width="14" height="40" fill="#00cc6a" opacity="0.12" />
      <rect x="86" y="150" width="20" height="70" fill="#00cc6a" opacity="0.12" />
      <rect x="113" y="190" width="12" height="30" fill="#00cc6a" opacity="0.12" />
      <rect x="500" y="170" width="16" height="50" fill="#00cc6a" opacity="0.12" />
      <rect x="522" y="150" width="20" height="70" fill="#00cc6a" opacity="0.12" />
      <rect x="548" y="185" width="14" height="35" fill="#00cc6a" opacity="0.12" />
      <line x1="0" y1="210" x2="600" y2="210" stroke="#00cc6a" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="0" y1="218" x2="600" y2="218" stroke="#00cc6a" strokeOpacity="0.6" strokeWidth="2" />
    </svg>
  )
}

export default function ContributorSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    fullName: '',
    role: '' as ContributorRole | '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!form.displayName.trim()) {
      toast.error('Display name is required')
      return
    }

    setLoading(true)

    const supabase = createClient()

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          display_name: form.displayName.trim(),
          full_name: form.fullName.trim() || null,
          contributor_role: form.role || null,
        },
      },
    })

    if (authError) {
      toast.error(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      toast.error('Signup failed. Please try again.')
      setLoading(false)
      return
    }
    // Supabase returns a stub user (empty identities, no real auth.users row)
    // when the email is already registered — anti-enumeration behavior.
    if (authData.user.identities?.length === 0) {
      toast.error('This email is already registered. Please log in instead.')
      setLoading(false)
      return
    }

    // 2. Create the profile row ourselves (service-role API route) —
    // do not depend on a DB trigger to do this.
    const res = await fetch('/api/contributor/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: authData.user.id,
        displayName: form.displayName.trim(),
        fullName: form.fullName.trim() || null,
        role: form.role || null,
      }),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Could not finish setting up your account.' }))
      toast.error(error ?? 'Could not finish setting up your account.')
      setLoading(false)
      return
    }

    toast.success('Account created! Welcome to the contributor portal.')
    router.push('/dashboard')
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
              Join a community building the future of{' '}
              <span className="text-[#00cc6a]">Northern Luzon.</span>
            </h1>
            <p className="text-zinc-300 leading-relaxed mb-8 max-w-sm">
              Create your account to share stories, discover opportunities, and connect with founders, innovators, and ecosystem partners.
            </p>
            <div className="divide-y divide-white/10">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-3 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#00cc6a]/10 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-[#00cc6a]" />
                  </div>
                  <span className="text-sm font-semibold text-white">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <DecorativeSkyline />
        </div>

        {/* ── Right: form card ── */}
        <div className="flex items-center justify-center px-4 sm:px-8 py-12 lg:py-20">
          <div className="w-full max-w-xl bg-white rounded-2xl p-7 sm:p-10 shadow-2xl">
            <div className="flex items-start gap-3.5 pb-5 mb-5 border-b border-zinc-100">
              <div className="w-11 h-11 rounded-xl bg-[#00a855]/10 flex items-center justify-center shrink-0">
                <PenLine className="h-5 w-5 text-[#00a855]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 leading-tight">Create your account</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Join the Amianan Innovation Ventures contributor community.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => set('displayName', e.target.value)}
                      required
                      placeholder="How readers see you"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  I am a…
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <select
                    value={form.role}
                    onChange={(e) => set('role', e.target.value)}
                    className="w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-9 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  >
                    <option value="">Select your role (optional)</option>
                    {(Object.entries(ROLE_LABELS) as [ContributorRole, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      required
                      placeholder="Min. 8 characters"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-9 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
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
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      required
                      placeholder="Repeat password"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-9 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#00a855]/8 border border-[#00a855]/15 p-3.5">
                <div className="w-8 h-8 rounded-full bg-[#00a855]/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-[#00a855]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Your privacy matters.</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                    We&apos;ll never share your information. It will only be used to improve the ecosystem and connect builders across Northern Luzon.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#042212] text-white text-sm font-bold hover:bg-[#06331c] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Account
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-5">
              Already have an account?{' '}
              <Link href="/contribute/login" className="text-[#00a855] font-semibold hover:underline">
                Sign in
              </Link>
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

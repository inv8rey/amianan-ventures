'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ROLE_LABELS, type ContributorRole } from '@/types/contributor'

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
    // All profile fields are passed as user_metadata so the DB trigger
    // (handle_new_contributor_profile) can create the profile row atomically.
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

    // Profile is created by the DB trigger on auth.users INSERT —
    // no separate insert needed here.

    toast.success('Account created! Welcome to the contributor portal.')
    router.push('/dashboard')
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
          <h1 className="text-xl font-black text-zinc-900 mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500 mb-6">Join the Amianan Innovation Ventures contributor community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => set('displayName', e.target.value)}
                  required
                  placeholder="How readers see you"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                I am a…
              </label>
              <select
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              >
                <option value="">Select your role (optional)</option>
                {(Object.entries(ROLE_LABELS) as [ContributorRole, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  placeholder="Min. 8 chars"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Confirm
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  required
                  placeholder="Repeat"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-5">
            Already have an account?{' '}
            <Link href="/contribute/login" className="text-[#00a855] font-semibold hover:underline">
              Sign in
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

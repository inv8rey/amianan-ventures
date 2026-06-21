'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [checking, setChecking] = useState(true)
  const [validSession, setValidSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // The reset-password link from the email establishes a recovery session
    // via the URL — Supabase's browser client picks it up automatically on
    // load, so we just need to wait for it and check the result.
    supabase.auth.getSession().then(({ data }) => {
      setValidSession(!!data.session)
      setChecking(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Password updated! You can now sign in.')
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <KeyRound className="h-4 w-4 text-[#00cc6a]" />
          </div>
          <span className="text-sm font-bold text-zinc-900">Contributor Portal</span>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-8">
          {checking ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#00a855]/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-5 w-5 text-[#00a855]" />
              </div>
              <h1 className="text-lg font-black text-zinc-900 mb-1.5">Password updated</h1>
              <p className="text-sm text-zinc-500 leading-relaxed mb-5">
                Your password has been reset successfully.
              </p>
              <Link
                href="/contribute/login"
                className="inline-flex w-full items-center justify-center py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
              >
                Continue to Sign In
              </Link>
            </div>
          ) : !validSession ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              </div>
              <h1 className="text-lg font-black text-zinc-900 mb-1.5">Link expired or invalid</h1>
              <p className="text-sm text-zinc-500 leading-relaxed mb-5">
                This password reset link is no longer valid. Request a new one to continue.
              </p>
              <Link
                href="/contribute/forgot-password"
                className="inline-flex w-full items-center justify-center py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black text-zinc-900 mb-1">Set a new password</h1>
              <p className="text-sm text-zinc-500 mb-6">Choose a new password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat password"
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

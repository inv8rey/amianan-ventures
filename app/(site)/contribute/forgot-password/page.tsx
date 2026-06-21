'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, KeyRound, Loader2, Mail, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/contribute/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    // Supabase returns success even for unregistered emails (anti-enumeration) —
    // show the same generic confirmation either way.
    setSent(true)
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
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#00a855]/10 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="h-5 w-5 text-[#00a855]" />
              </div>
              <h1 className="text-lg font-black text-zinc-900 mb-1.5">Check your email</h1>
              <p className="text-sm text-zinc-500 leading-relaxed">
                If an account exists for <span className="font-semibold text-zinc-700">{email}</span>, we&apos;ve sent a link to reset your password.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black text-zinc-900 mb-1">Forgot password?</h1>
              <p className="text-sm text-zinc-500 mb-6">Enter your email and we&apos;ll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
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
                  Send Reset Link
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-zinc-500 mt-6 pt-5 border-t border-zinc-100 flex items-center justify-center gap-1.5">
            <ArrowLeft className="h-3 w-3" />
            <Link href="/contribute/login" className="font-semibold text-zinc-700 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

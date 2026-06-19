'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const BENEFITS = [
  'Professional Story Feature',
  'Increased Visibility',
  'Startup Directory Listing',
  'Content Assets You Can Reuse',
]

export function ApplyWizard() {
  const router = useRouter()
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }))

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

    setLoading(true)

    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          display_name: form.contactName.trim(),
          organization: form.businessName.trim(),
          contributor_role: 'founder',
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

    const res = await fetch('/api/spotlight/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: authData.user.id,
        businessName: form.businessName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
      }),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Something went wrong.' }))
      toast.error(error ?? 'Could not start your application. Please try again.')
      setLoading(false)
      return
    }

    toast.success('Account created! Let’s build your feature.')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left: signup form */}
        <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16">
          <div className="max-w-md mx-auto lg:mx-0 w-full">
            <Link href="/get-featured" className="inline-flex items-center gap-2 mb-10 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>

            <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-4">Get Featured</p>
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 leading-[1.05] mb-5">
              Let&apos;s Tell<br />Your Story.
            </h1>
            <p className="text-base text-zinc-500 leading-relaxed mb-8">
              Create your account to start your application. You can save your progress and come back anytime before paying.
            </p>

            <div className="space-y-3 mb-10">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-[#00a855]" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-700">{b}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Business / Startup Name" required value={form.businessName} onChange={(v) => set('businessName', v)} placeholder="e.g. Vidad Food Processing" />
              <Field label="Your Name" required value={form.contactName} onChange={(v) => set('contactName', v)} placeholder="Founder / contact person" />
              <Field label="Email Address" type="email" required value={form.email} onChange={(v) => set('email', v)} placeholder="you@example.com" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Password" type="password" required value={form.password} onChange={(v) => set('password', v)} placeholder="Min. 8 chars" />
                <Field label="Confirm" type="password" required value={form.confirmPassword} onChange={(v) => set('confirmPassword', v)} placeholder="Repeat" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#0a3a22] text-white font-bold text-base hover:bg-[#042212] disabled:opacity-60 transition-colors w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account & Start <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-400 mt-5">
              Already have an account?{' '}
              <Link href="/contribute/login" className="text-[#00a855] font-bold hover:underline">Log in</Link>
            </p>
          </div>
        </div>

        {/* Right: image */}
        <div className="relative hidden lg:block">
          <Image src="/get-featured-hero.png" alt="Founders across Northern Luzon" fill priority className="object-cover object-center" sizes="50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-white/50">
            <p className="text-sm font-semibold text-zinc-800 leading-relaxed italic">
              &ldquo;Amianan Ventures helped us share our story and connect with the right people.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] transition-colors"
      />
    </div>
  )
}

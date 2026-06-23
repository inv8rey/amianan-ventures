'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Download, Mail, FileText, Lock, Loader2, X, CheckCircle2,
  Sparkles, BarChart3, ClipboardList, ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { FounderResource } from '@/types/resources'
import type { Article } from '@/types'

const COMING_SOON_TEASERS = [
  'Customer Discovery Interview Guide',
  'Startup Validation Checklist',
  'Pitch Deck Template',
  'One-Page Business Plan',
  'Financial Projection Template',
  'Investor Readiness Checklist',
]

const STORAGE_KEY = 'av_resource_email'

export function ResourceHub({ resources, articles }: { resources: FounderResource[]; articles: Article[] }) {
  const [savedEmail, setSavedEmail] = useState<string | null>(
    () => (typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null)
  )
  const [pending, setPending] = useState<FounderResource | null>(null)

  const published = useMemo(() => resources.filter((r) => r.status === 'published'), [resources])
  const featured = useMemo(() => {
    const f = published.filter((r) => r.featured)
    return (f.length > 0 ? f : published).slice(0, 2)
  }, [published])

  const byCategory = useMemo(() => {
    const map = new Map<string, FounderResource[]>()
    for (const r of published) {
      const list = map.get(r.category) ?? []
      list.push(r)
      map.set(r.category, list)
    }
    return Array.from(map.entries())
  }, [published])

  const totalDownloads = useMemo(
    () => resources.reduce((sum, r) => sum + r.download_count, 0),
    [resources]
  )

  async function startDownload(resource: FounderResource) {
    if (savedEmail) {
      await doDownload(resource, savedEmail)
    } else {
      setPending(resource)
    }
  }

  async function doDownload(resource: FounderResource, email: string) {
    try {
      const res = await fetch('/api/resources/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource.id, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Download failed')

      window.localStorage.setItem(STORAGE_KEY, email)
      setSavedEmail(email)
      window.open(data.file_url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed')
    }
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="border-b border-zinc-200 bg-gradient-to-br from-emerald-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 text-zinc-900">
              Founder Resource Hub
            </h1>
            <p className="text-zinc-500 text-base leading-relaxed mb-7 max-w-lg">
              Practical templates and tools used by founders, innovators, and entrepreneurs across Northern Luzon.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#resources"
                className="inline-flex items-center gap-2 bg-[#00cc6a] text-black px-5 py-2.5 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors uppercase tracking-wide"
              >
                Browse Resources <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#subscribe"
                className="inline-flex items-center gap-2 border-2 border-zinc-900 text-zinc-900 px-5 py-2.5 rounded font-bold text-sm hover:bg-zinc-50 transition-colors uppercase tracking-wide"
              >
                <Mail className="h-4 w-4" /> Subscribe for Updates
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          {/* Main column */}
          <div id="resources" className="space-y-12">
            {/* Featured Resources */}
            {featured.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-zinc-900 mb-4">Featured Resources</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {featured.map((r) => (
                    <ResourceCard key={r.id} resource={r} onDownload={startDownload} />
                  ))}
                </div>
              </section>
            )}

            {/* Resource Categories */}
            <section>
              <h2 className="text-xl font-black text-zinc-900 mb-4">Resource Categories</h2>
              {byCategory.length === 0 ? (
                <p className="text-sm text-zinc-400">No resources published yet — check back soon.</p>
              ) : (
                <div className="space-y-5">
                  {byCategory.map(([category, items]) => (
                    <div key={category} className="rounded-xl border border-zinc-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-zinc-900">{category}</h3>
                        <span className="text-xs text-zinc-400">{items.length} Resource{items.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {items.map((r) => (
                          <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-800 truncate">{r.title}</p>
                                {r.description && (
                                  <p className="text-xs text-zinc-400 truncate">{r.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => startDownload(r)}
                              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                            >
                              <Download className="h-3 w-3" /> Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coming Soon */}
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-900">Coming Soon</h3>
                  <span className="text-xs text-amber-600 font-semibold">More to come</span>
                </div>
                <p className="text-xs text-zinc-500 mb-3">More helpful templates and tools are on the way.</p>
                <div className="space-y-2">
                  {COMING_SOON_TEASERS.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-zinc-600">
                      <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recommended Reading */}
            {articles.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-zinc-900">Recommended Reading</h2>
                  <Link href="/news" className="text-sm font-semibold text-[#00a855] hover:underline">View all articles →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {articles.map((a) => (
                    <Link key={a.id} href={`/${a.category}/${a.slug}`} className="group">
                      <div className="aspect-video rounded-lg bg-zinc-100 overflow-hidden mb-3">
                        {a.cover_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#00a855]">{a.category}</span>
                      <h3 className="text-sm font-bold text-zinc-900 mt-1 leading-snug group-hover:underline">{a.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{a.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div id="subscribe" className="rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-[#00a855]" />
                <h3 className="text-sm font-bold text-zinc-900">Stay Updated</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Get curated resources, opportunities, and ecosystem updates.</p>
              <SidebarSubscribe />
            </div>

            <div className="rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#00a855]" />
                <h3 className="text-sm font-bold text-zinc-900">Why These Resources?</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We create practical, easy-to-use resources to help founders turn ideas into impact — built for Northern Luzon, kept simple, and updated regularly.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-[#00a855]" />
                <h3 className="text-sm font-bold text-zinc-900">Resource Usage</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900">{totalDownloads}</p>
              <p className="text-xs text-zinc-400 mt-1">Downloads by founders and innovators in Northern Luzon.</p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="h-4 w-4 text-[#00a855]" />
                <h3 className="text-sm font-bold text-zinc-900">Need a Custom Resource?</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Can&apos;t find what you need? Let us know what would help you most.</p>
              <a
                href="mailto:amiananventures@gmail.com?subject=Resource%20Request"
                className="inline-flex items-center justify-center gap-2 border-2 border-zinc-900 text-zinc-900 px-4 py-2 rounded font-bold text-xs hover:bg-zinc-50 transition-colors w-full"
              >
                Request a Resource <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {pending && (
        <EmailGateModal
          resource={pending}
          onClose={() => setPending(null)}
          onSubmit={async (email) => {
            await doDownload(pending, email)
            setPending(null)
          }}
        />
      )}
    </div>
  )
}

function ResourceCard({ resource, onDownload }: { resource: FounderResource; onDownload: (r: FounderResource) => void }) {
  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50 to-zinc-50 flex items-center justify-center">
        <FileText className="h-10 w-10 text-zinc-300" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00a855] bg-[#00a855]/10 px-2 py-0.5 rounded-full w-fit mb-2">
          {resource.format}
        </span>
        <h3 className="text-base font-bold text-zinc-900 mb-1">{resource.title}</h3>
        {resource.description && (
          <p className="text-xs text-zinc-500 leading-relaxed mb-4 flex-1">{resource.description}</p>
        )}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-xs text-zinc-400">{resource.format}{resource.editable ? ' · Editable' : ''}</span>
          <button
            onClick={() => onDownload(resource)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>
    </div>
  )
}

function SidebarSubscribe() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    const supabase = createClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase(), source: 'resources_page' })

    if (error && error.code !== '23505') {
      setState('error')
      return
    }
    setState('success')
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 text-[#00a855]">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold">You&apos;re subscribed!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-[#00a855] transition-colors"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#00a855] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#009449] transition-colors disabled:opacity-60"
      >
        {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
      </button>
      {state === 'error' && <p className="text-xs text-red-500">Something went wrong. Please try again.</p>}
      <p className="text-[10px] text-zinc-400">No spam. Unsubscribe anytime.</p>
    </form>
  )
}

function EmailGateModal({
  resource, onClose, onSubmit,
}: { resource: FounderResource; onClose: () => void; onSubmit: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    await onSubmit(email.trim())
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700">
          <X className="h-5 w-5" />
        </button>
        <Download className="h-8 w-8 text-[#00a855] mb-3" />
        <h3 className="text-lg font-black text-zinc-900 mb-1">Get &quot;{resource.title}&quot;</h3>
        <p className="text-sm text-zinc-500 mb-4">Enter your email to download this resource. We&apos;ll also send you occasional founder resources and updates.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#00a855] transition-colors"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-700 transition-colors disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {submitting ? 'Preparing…' : 'Download'}
          </button>
        </form>
      </div>
    </div>
  )
}

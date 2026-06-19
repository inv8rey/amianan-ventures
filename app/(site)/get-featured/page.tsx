import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, Eye, Users, FileText, Image as ImageIcon,
  Quote, Layers, BadgeCheck, Award, Globe, Lock, MapPin, CheckCircle2,
  ClipboardList, CalendarCheck, FileSearch, Send, Mail,
} from 'lucide-react'
import { SpotlightApplicationForm } from '@/components/site/SpotlightApplicationForm'

export const metadata: Metadata = {
  title: 'Get Featured — Amianan Startup Spotlight',
  description: 'A professionally written feature story, six branded content assets, and a permanent listing in Northern Luzon\'s growing innovation directory.',
}

const heroStats = [
  { icon: BookOpen, value: '140+',    label: 'Stories Published', sub: 'Real founders. Real stories.' },
  { icon: Eye,       value: '100,000+', label: 'Content Views',    sub: 'Stories read across Northern Luzon.' },
  { icon: Users,     value: null,      label: 'Founders Across Northern Luzon', sub: 'Building a stronger innovation ecosystem.' },
]

const audience = [
  'Founders', 'Entrepreneurs', 'MSMEs', 'Agripreneurs',
  'Social Enterprises', 'Local Brands', 'Innovators', 'Creative Businesses',
]

const assets = [
  { icon: FileText,    title: 'Feature Story', desc: 'A professionally written article published on Amianan Ventures with a permanent URL you can link to in pitches, grant applications, and customer conversations.' },
  { icon: ImageIcon,   title: 'Homepage Spotlight Banner', desc: '2 weeks of prime placement where every visitor lands first.' },
  { icon: Layers,      title: 'Sidebar Banner Across All Articles', desc: '2 weeks of consistent presence alongside every published article on the platform.' },
  { icon: Quote,       title: 'Founder Quote Card', desc: 'A professionally designed graphic featuring your photo and a key quote — yours to download and repost anytime.' },
  { icon: Layers,      title: 'Social Media Carousel', desc: 'A 5–6 slide designed carousel telling your story, posted on Facebook and yours to repost to your own community.' },
  { icon: BookOpen,    title: 'Startup Directory Listing', desc: 'A permanent, searchable entry in the Northern Luzon Startup Directory that does not expire.' },
  { icon: BadgeCheck,  title: 'Featured Startup Badge', desc: 'A digital badge for your website, social bios, pitch decks, and grant applications.' },
]

const reasons = [
  { icon: Globe, title: 'A story you can use everywhere', desc: 'The published article is a permanent, linkable record of your business. Attach it to DOST and DTI grant applications, investor presentations, and customer conversations.' },
  { icon: Lock,  title: 'Content you own', desc: 'The carousel, quote card, and badge are yours — not locked to Amianan\'s platform. Post them on your own channels and reuse them across your marketing anytime.' },
  { icon: Award, title: 'A permanent place in Northern Luzon\'s innovation story', desc: 'The startup directory is the region\'s growing public record of founders and businesses. Being listed early means being part of the foundation.' },
]

const steps = [
  { step: '01', icon: Send,          title: 'Submit your application', desc: 'Fill out the form below with your business details and story.' },
  { step: '02', icon: CalendarCheck, title: 'Intake conversation', desc: 'Amianan schedules a 30-minute conversation to learn your story.' },
  { step: '03', icon: FileSearch,    title: 'Draft & review', desc: 'Your feature is drafted and shared with you for review before publication.' },
  { step: '04', icon: ClipboardList, title: 'Published', desc: 'Your story goes live within 7 to 14 days from submission.' },
  { step: '05', icon: CheckCircle2,  title: 'Assets delivered', desc: 'All content assets delivered within 3 days of publication.' },
]

export default function GetFeaturedPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[640px] lg:min-h-[88vh] flex items-end overflow-hidden">
        <Image
          src="/get-featured-hero.png"
          alt="Founders and agripreneurs building across Northern Luzon"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-28 pb-0">
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] mb-5">
              <span className="text-zinc-900">Share Your Story.</span><br />
              <span className="text-[#00a855]">Build Your Reputation.</span>
            </h1>
            <div className="w-14 h-1 bg-[#00cc6a] rounded-full mb-6" />
            <p className="text-lg text-zinc-600 leading-relaxed mb-8 max-w-lg">
              Join the founders, startups, MSMEs, innovators, and businesses shaping
              the future of <span className="text-[#00a855] font-semibold">Northern Luzon.</span>
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="#apply"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#0a3a22] text-white font-bold text-sm hover:bg-[#042212] transition-colors"
              >
                Apply for a Feature <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/news"
                className="inline-flex items-center px-6 py-3.5 rounded-lg border-2 border-zinc-900 text-zinc-900 font-bold text-sm hover:bg-zinc-900 hover:text-white transition-colors"
              >
                View Featured Stories
              </Link>
            </div>
          </div>

          {/* Stat bar — overlaps bottom of hero */}
          <div className="relative mt-14 translate-y-8 bg-white rounded-2xl shadow-xl border border-zinc-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
            {heroStats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-[#00a855]" />
                </div>
                <div>
                  {s.value && <p className="text-2xl font-black text-zinc-900 leading-none mb-0.5">{s.value}</p>}
                  <p className={`font-bold text-zinc-900 ${s.value ? 'text-sm' : 'text-base leading-tight'}`}>{s.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer for overlapping stat bar */}
      <div className="h-12 sm:h-8" />

      {/* ── Who this is for ───────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Who this is for</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-8 max-w-2xl mx-auto leading-tight">
          Founders and businesses building something real in Northern Luzon
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {audience.map((a) => (
            <span key={a} className="px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-700">
              {a}
            </span>
          ))}
        </div>
      </section>

      {/* ── What you get ──────────────────────────────────────── */}
      <section className="bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-2">Seven content assets</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3">What You Get</h2>
          <p className="text-sm text-zinc-500 max-w-xl mb-10 leading-relaxed">
            Everything is designed to be reused, reshared, and owned by you — long after the feature period ends.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {assets.map((a, i) => (
              <div key={a.title} className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-[#00a855]/20 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00a855]/8 flex items-center justify-center shrink-0">
                    <a.icon className="h-4 w-4 text-[#00a855]" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-300">0{i + 1}</span>
                </div>
                <p className="text-sm font-bold text-zinc-900 mb-1.5">{a.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why founders get featured ─────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Why it matters</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-10">Why Founders Get Featured</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div key={r.title}>
              <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center mb-4">
                <r.icon className="h-5 w-5 text-[#00cc6a]" />
              </div>
              <p className="text-sm font-bold text-zinc-900 mb-2">{r.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Founding rate ─────────────────────────────────────── */}
      <section className="bg-[#042212] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5" />
          <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full border border-white/5" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-3">Founding rate</p>
          <p className="text-6xl sm:text-7xl font-black text-white mb-3">₱1,999</p>
          <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed mb-1">
            Available to the first 10 founders and businesses in this founding batch.
          </p>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed mb-8">
            After the founding batch closes, the rate increases.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 max-w-md mx-auto text-left">
            <p className="text-xs text-white/50 leading-relaxed">
              This is not a media placement or advertising slot. It is a content asset package
              built around your story. You are not paying for our audience — you are paying for
              a professionally produced story and seven assets that work for your business
              long after the feature period ends.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Simple process</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-12">How It Works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute h-px bg-zinc-200"
                  style={{ top: '18px', left: 'calc(100% + 4px)', right: '-100%', width: 'calc(100% - 8px)' }}
                />
              )}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full border border-[#00a855]/30 bg-[#00a855]/8 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-[#00a855]">{s.step}</span>
                </div>
                <div className="flex-1 h-px bg-zinc-100 lg:hidden" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center mb-4">
                <s.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-bold text-zinc-900 mb-1.5">{s.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Apply form ─────────────────────────────────────────── */}
      <section id="apply" className="bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-2">Apply now</p>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3">Apply for a Feature</h2>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
              Tell us about your business. We&apos;ll schedule a 30-minute intake conversation
              and walk you through the rest.
            </p>
          </div>
          <SpotlightApplicationForm />
        </div>
      </section>

      {/* ── Questions footer ──────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
        <p className="text-sm text-zinc-500 mb-2">Questions?</p>
        <a
          href="mailto:amiananventures@gmail.com"
          className="inline-flex items-center gap-2 text-base font-bold text-zinc-900 hover:text-[#00a855] transition-colors"
        >
          <Mail className="h-4 w-4" /> amiananventures@gmail.com
        </a>
        <p className="text-xs text-zinc-400 mt-6 flex items-center justify-center gap-1.5">
          <MapPin className="h-3 w-3" /> Amianan Ventures is Northern Luzon&apos;s platform for founders, innovators, and ecosystem builders.
        </p>
        <p className="text-xs text-zinc-400 mt-1 italic">Built from the Mountains.</p>
      </section>

    </div>
  )
}

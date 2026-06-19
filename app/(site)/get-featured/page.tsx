import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, Eye, Users, FileText, Image as ImageIcon,
  Quote, Layers, BadgeCheck, Award, Globe, Lock, MapPin,
  Mail, FileEdit, Monitor, Images, IdCard, FileBadge2, Gift, ShieldCheck,
  MailCheck, Smartphone, Rocket, QrCode, ChevronRight, Clock, Landmark, CreditCard,
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

const included = [
  { icon: FileEdit,    title: 'Startup Story Feature', desc: 'Professionally written story published on Amianan Ventures.' },
  { icon: Monitor,     title: 'Homepage Featured Placement', desc: 'Featured on the Amianan Ventures homepage for 2 weeks.' },
  { icon: Images,      title: 'Social Media Carousel', desc: 'Branded carousel post (5–6 slides) showcasing your story.' },
  { icon: Quote,       title: 'Founder Quote Card', desc: 'Professional quote graphic featuring your insights.' },
  { icon: IdCard,      title: 'Startup Directory Listing', desc: 'Permanent profile in the Northern Luzon Startup Directory.' },
  { icon: Award,       title: 'Featured Startup Badge', desc: 'Recognition asset for your website and social media.' },
  { icon: FileBadge2,  title: 'Digital Feature Certificate', desc: 'Official recognition as an Amianan Ventures featured startup.' },
]

const steps = [
  {
    icon: FileEdit,
    title: 'Submit Your Application',
    desc: 'Fill out the short application form and tell us your story.',
    time: 'Takes 3–5 minutes',
  },
  {
    icon: MailCheck,
    title: 'Get Reviewed',
    desc: 'Our team reviews your application. If accepted, we’ll send you an approval message.',
    time: 'Within 24 hours',
  },
  {
    icon: Smartphone,
    title: 'Complete Payment',
    desc: 'Once approved, complete payment using any of our secure payment options.',
    time: 'Instant',
  },
  {
    icon: Rocket,
    title: 'We Create & Feature Your Story',
    desc: 'Our team produces your feature and publishes it on Amianan Ventures.',
    time: '7–14 business days',
  },
]

const paymentMethods = [
  { name: 'GCash',     color: '#007DFE' },
  { name: 'Maya',      color: '#00C26E' },
  { name: 'BDO',       color: '#003DA5' },
  { name: 'BPI',       color: '#C8102E' },
  { name: 'UnionBank', color: '#F47920' },
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
          <div className="absolute -right-32 top-1/3 w-96 h-96 rounded-full border border-white/5" />
          <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full border border-white/5" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#00a855]/20 border border-[#00a855]/40 text-[#00cc6a] text-xs font-black uppercase tracking-widest mb-6">
              Startup Spotlight Package
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-black text-white leading-tight max-w-3xl mx-auto mb-4">
              Everything you need to build credibility, increase visibility, and showcase your story.
            </h2>
            <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto">
              A complete content asset package built around your story.
            </p>
          </div>

          {/* Two-column pricing card */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] rounded-2xl overflow-hidden border border-white/10">

            {/* Left: price */}
            <div className="bg-[#06301c] p-8 sm:p-10 flex flex-col">
              <span className="inline-flex self-start items-center px-3.5 py-1.5 rounded-full bg-[#00cc6a] text-black text-[11px] font-black uppercase tracking-widest mb-6">
                Founding Rate
              </span>
              <p className="text-5xl sm:text-6xl font-black text-white mb-1">₱1,999</p>
              <p className="text-base font-bold text-[#00cc6a] mb-5">Founding Rate</p>
              <div className="w-12 h-px bg-white/15 mb-5" />
              <p className="text-sm text-white/60 leading-relaxed mb-3">
                Available to the first 10 founders and businesses in this founding batch.
              </p>
              <p className="text-sm text-white/40 leading-relaxed mb-8">
                After the founding batch closes, the rate increases.
              </p>
              <a
                href="#apply"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#00cc6a] text-black font-bold text-sm hover:bg-[#00b85e] transition-colors mb-3"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </a>
              <p className="flex items-center gap-1.5 text-xs text-white/40">
                <Lock className="h-3 w-3" /> Limited slots only
              </p>
            </div>

            {/* Right: what's included */}
            <div className="bg-zinc-50 p-8 sm:p-10">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#00a855]/15 flex items-center justify-center shrink-0">
                  <Gift className="h-4 w-4 text-[#00a855]" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">What&apos;s Included</h3>
              </div>
              <div className="divide-y divide-zinc-200">
                {included.map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-[#00a855]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#06301c]/60 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {heroStats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-6">
                <div className="w-11 h-11 rounded-full border border-[#00a855]/30 bg-[#00a855]/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-[#00cc6a]" />
                </div>
                <div>
                  {s.value ? (
                    <>
                      <p className="text-xl font-black text-white leading-none mb-0.5">{s.value}</p>
                      <p className="text-sm font-bold text-white">{s.label}</p>
                    </>
                  ) : (
                    <p className="text-base font-bold text-white leading-tight">
                      Founders Across <span className="text-[#00cc6a]">Northern Luzon</span>
                    </p>
                  )}
                  <p className="text-xs text-white/40 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-center gap-2 mt-8 text-sm text-white/50 text-center">
            <ShieldCheck className="h-4 w-4 text-[#00a855] shrink-0" />
            This is not advertising. This is your story, professionally told and yours to own.
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-[#00a855] mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-4 leading-tight">
            Simple. Transparent. Founder-First.
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
            We&apos;ve made the process simple so you can focus on what you do best—building and growing your business.
          </p>
        </div>

        {/* Step row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {steps.map((s, i) => (
            <div key={s.title} className="relative flex flex-col">
              {/* Chevron connector */}
              {i < steps.length - 1 && (
                <ChevronRight className="hidden lg:block absolute h-5 w-5 text-zinc-300" style={{ top: '34px', right: '-26px' }} />
              )}

              {/* Numbered icon */}
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0a3a22] flex items-center justify-center z-10 ring-4 ring-white">
                  <span className="text-[11px] font-black text-white">{i + 1}</span>
                </div>
                <div className="w-20 h-20 rounded-full bg-[#00a855]/10 flex items-center justify-center">
                  <s.icon className="h-8 w-8 text-[#0a3a22]" />
                </div>
              </div>

              <p className="text-base font-black text-zinc-900 mb-2 text-center">{s.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed text-center max-w-[220px] mx-auto mb-5">{s.desc}</p>

              {/* Step visual */}
              <div className="mt-auto mb-4">
                {i === 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">Application Form</p>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-zinc-100 rounded w-1/2" />
                      <div className="h-6 bg-zinc-50 border border-zinc-100 rounded" />
                      <div className="h-1.5 bg-zinc-100 rounded w-1/3 mt-2" />
                      <div className="h-6 bg-zinc-50 border border-zinc-100 rounded" />
                    </div>
                    <div className="mt-2.5 h-7 rounded bg-[#00cc6a] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-black">Submit Application</span>
                    </div>
                  </div>
                )}
                {i === 1 && (
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
                      <MailCheck className="h-5 w-5 text-[#00a855]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900">You&apos;re approved!</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Complete payment to get started.</p>
                    </div>
                  </div>
                )}
                {i === 2 && (
                  <div className="rounded-xl bg-[#06301c] border border-white/10 p-3.5">
                    <p className="text-[10px] font-black text-[#00cc6a] uppercase tracking-wider text-center mb-2.5">Payment Options</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-white/5 rounded-lg p-2 flex items-center justify-center">
                        <span className="text-[11px] font-black" style={{ color: '#4FA8FF' }}>GCash</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center gap-0.5">
                        <QrCode className="h-4 w-4 text-white/60" />
                        <span className="text-[8px] text-white/40">Scan to Pay</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 flex items-center justify-center">
                        <span className="text-[11px] font-black text-[#00cc6a]">maya</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center gap-0.5">
                        <Landmark className="h-3.5 w-3.5 text-white/60" />
                        <span className="text-[8px] text-white/40">BDO · BPI · UB</span>
                      </div>
                    </div>
                  </div>
                )}
                {i === 3 && (
                  <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="h-5 bg-zinc-100 flex items-center gap-1 px-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                    </div>
                    <div className="p-3">
                      <span className="inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00a855]/10 text-[#00a855] mb-1.5">
                        Featured Story
                      </span>
                      <p className="text-[11px] font-bold text-zinc-900 leading-snug">Building Solutions. Creating Impact.</p>
                      <div className="mt-2 h-10 rounded bg-gradient-to-br from-zinc-100 to-zinc-200" />
                    </div>
                  </div>
                )}
              </div>

              {/* Timing pill */}
              <span className="inline-flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full bg-[#00a855]/8 text-[#0a3a22] text-xs font-semibold">
                <Clock className="h-3 w-3" /> {s.time}
              </span>
            </div>
          ))}
        </div>

        {/* Trust + payment options bar */}
        <div className="mt-16 rounded-2xl border border-zinc-200 bg-zinc-50 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          {/* Secure & Trusted */}
          <div className="flex items-start gap-4 p-7">
            <div className="w-12 h-12 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6 text-[#00a855]" />
            </div>
            <div>
              <p className="text-base font-black text-zinc-900 mb-1">Secure & Trusted</p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Payment is only requested after your application has been reviewed and approved by the Amianan Ventures team.
              </p>
            </div>
          </div>

          {/* Payment options */}
          <div className="p-7">
            <p className="text-base font-black text-zinc-900 mb-4">Secure Payment Options</p>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              {paymentMethods.map((m) => (
                <span key={m.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white">
                  {(m.name === 'BDO' || m.name === 'BPI' || m.name === 'UnionBank') && (
                    <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                  <span className="text-sm font-black" style={{ color: m.color }}>{m.name}</span>
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-400">More options coming soon.</p>
          </div>
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

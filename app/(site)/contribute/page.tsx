import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  PenLine, Eye, CheckCircle, ArrowRight, BookOpen,
  Lightbulb, Mic2, Building2, FlaskConical,
  Users, MapPin, FileText, TrendingUp,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contribute — Write for Amianan Ventures',
  description: 'Share your story, insights, and expertise with the Northern Luzon innovation ecosystem.',
}

const contentTypes = [
  { icon: Mic2,         label: 'Founder Story',        desc: 'Your personal journey building a startup or MSME' },
  { icon: Lightbulb,    label: 'Opinion / Essay',       desc: 'Your perspective on an ecosystem issue or trend' },
  { icon: BookOpen,     label: 'Program Recap',         desc: 'A recap of an event, program, or initiative you ran or attended' },
  { icon: Building2,    label: 'Ecosystem Spotlight',   desc: 'Highlighting an organization, community, or initiative' },
  { icon: FlaskConical, label: 'Field Notes',           desc: 'Research observations or thesis findings relevant to the region' },
]

const steps = [
  { step: '01', icon: PenLine,      title: 'Create an account',  desc: 'Sign up with your email and build a contributor profile — your byline, role, and bio.' },
  { step: '02', icon: BookOpen,     title: 'Submit your piece',  desc: 'Fill out the submission form with your headline, summary, and draft (or a Google Docs link).' },
  { step: '03', icon: Eye,          title: 'Editorial review',   desc: "Our editor reviews every submission. You'll hear back within 5–7 days with approval or feedback." },
  { step: '04', icon: CheckCircle,  title: 'Published!',         desc: 'Approved pieces go live on amiananventures.org with your byline and are shared across our channels.' },
]

const stats = [
  { icon: FileText,    value: '50+',   label: 'Stories Published' },
  { icon: Users,       value: '60+',   label: 'Contributors' },
  { icon: MapPin,      value: '4',     label: 'Regions Covered' },
  { icon: TrendingUp,  value: '15K+',  label: 'Monthly Readers' },
]

// Sample article cards shown in the hero — decorative / aspirational
const heroCards = [
  {
    type: 'Founder Story',
    typeColor: 'text-[#00a855] bg-[#00a855]/10',
    headline: 'Building traceability for Benguet coffee farmers',
    author: 'Jessa R.',
    read: '6 min read',
    img: null,
  },
  {
    type: 'Ecosystem Report',
    typeColor: 'text-violet-600 bg-violet-500/10',
    headline: 'State of AI adoption among SMEs in Northern Luzon',
    author: 'Amianan Ventures',
    read: '8 min read',
    img: null,
  },
  {
    type: 'Program Recap',
    typeColor: 'text-orange-600 bg-orange-500/10',
    headline: 'What founders learned at Cordillera Startup Week 2024',
    author: 'Miguel D.',
    read: '6 min read',
    img: null,
  },
]

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] lg:min-h-[92vh] flex items-center overflow-hidden">

        {/* Background image */}
        <Image
          src="/contribute-hero.jpg"
          alt="Northern Luzon mountains"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Gradient overlay — heavier on left for text legibility, fades right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Left: text ── */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-7">
                <PenLine className="h-3.5 w-3.5 text-[#00cc6a]" />
                Contributor Portal
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] mb-5">
                Help document<br />
                the future of<br />
                <span className="text-[#00cc6a]">Northern Luzon<br />startups.</span>
              </h1>

              {/* Subtext */}
              <p className="text-base text-white/70 max-w-md leading-relaxed mb-8">
                Share stories, insights, and ideas that spotlight founders, programs,
                and innovations across Cordillera, Cagayan Valley, Ilocos, and Pangasinan.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3 flex-wrap mb-10">
                <Link
                  href="/contribute/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#042212] text-white font-bold text-sm hover:bg-black transition-colors border border-white/10"
                >
                  Start Contributing <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contribute/login"
                  className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white font-bold text-sm hover:bg-white/10 hover:border-white/60 transition-colors"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col items-start gap-1.5 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <s.icon className="h-4 w-4 text-[#00cc6a]" />
                    <span className="text-xl font-black text-white leading-none">{s.value}</span>
                    <span className="text-[10px] text-white/60 leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: floating article cards ── */}
            <div className="hidden lg:flex flex-col gap-3 items-end">
              {heroCards.map((card, i) => (
                <div
                  key={card.headline}
                  className={`w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 transition-transform ${
                    i === 0 ? 'translate-x-0' : i === 1 ? '-translate-x-4' : '-translate-x-8'
                  }`}
                >
                  <div className="flex gap-3 p-4">
                    {/* Thumbnail placeholder */}
                    <div className="shrink-0 w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${card.typeColor} mb-1.5 inline-block`}>
                        {card.type}
                      </span>
                      <p className="text-xs font-bold text-zinc-900 leading-snug line-clamp-2 mb-1.5">
                        {card.headline}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        By {card.author} · {card.read}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Region tags */}
              <div className="flex flex-wrap gap-2 mt-2 justify-end">
                {['Cordillera', 'Cagayan Valley', 'Ilocos Region', 'Pangasinan'].map((r) => (
                  <span key={r} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-[11px] font-semibold text-white">
                    <MapPin className="h-2.5 w-2.5 text-[#00cc6a]" /> {r}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Content types ─────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">What you can submit</p>
        <h2 className="text-2xl font-black text-zinc-900 mb-8">Five types of content we publish</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentTypes.map((type) => (
            <div key={type.label} className="flex gap-3 p-5 rounded-xl border border-zinc-100 bg-zinc-50 hover:border-[#00a855]/30 hover:bg-[#00a855]/5 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-[#00a855]/10 flex items-center justify-center shrink-0 group-hover:bg-[#00a855]/20 transition-colors">
                <type.icon className="h-4 w-4 text-[#00a855]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 mb-0.5">{type.label}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{type.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="bg-[#042212] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5" />
          <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full border border-white/5" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-2">Simple process</p>
          <h2 className="text-2xl font-black text-white mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-full w-full h-px bg-white/10 -translate-x-4" />
                )}
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-xs font-black text-[#00cc6a]">{s.step}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <s.icon className="h-4.5 w-4.5 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-1.5">{s.title}</p>
                <p className="text-xs text-white/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00cc6a]/10 text-[#00a855] text-xs font-semibold uppercase tracking-wider mb-5">
          <PenLine className="h-3.5 w-3.5" /> Free to join
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-4 leading-tight">
          Ready to share your story?
        </h2>
        <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">
          Create a free account in under a minute. Your first submission could reach thousands of
          founders, investors, and ecosystem builders across Northern Luzon.
        </p>
        <Link
          href="/contribute/signup"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors"
        >
          Create Contributor Account <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-zinc-400 mt-4">
          Already have an account?{' '}
          <Link href="/contribute/login" className="text-[#00a855] hover:underline">
            Sign in
          </Link>
        </p>
      </section>

    </div>
  )
}

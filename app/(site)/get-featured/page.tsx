import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, Eye, Users, Check,
  FileEdit, Monitor, Quote, IdCard, Share2,
  ShieldCheck, Sparkles, Layers,
  Star, ThumbsUp, MessageCircle, Send,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { PACKAGES } from '@/types/spotlight'
import { FaqAccordion } from '@/components/site/FaqAccordion'

interface SpotlightExample {
  name: string
  logo_url: string | null
  slug: string
}

// Pulls real published Founder Stories articles and matches each one to its
// directory listing (by name appearing in the article) so every card links to
// an actual story — no fabricated business names or dead-end cards.
async function getSpotlightExamples(): Promise<SpotlightExample[]> {
  try {
    const supabase = createServiceClient()
    const [{ data: articles }, { data: dirs }] = await Promise.all([
      supabase
        .from('articles')
        .select('title, slug, excerpt')
        .eq('category', 'founder-stories')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(30),
      supabase
        .from('directory')
        .select('name, logo_url')
        .eq('status', 'published')
        .not('logo_url', 'is', null),
    ])
    if (!articles || !dirs) return []

    const examples: SpotlightExample[] = []
    for (const a of articles) {
      const haystack = `${a.title} ${a.excerpt} ${a.slug}`.toLowerCase()
      const match = dirs.find((d) => haystack.includes(d.name.toLowerCase()))
      if (match) {
        examples.push({ name: match.name, logo_url: match.logo_url, slug: a.slug })
        if (examples.length === 4) break
      }
    }
    return examples
  } catch {
    return []
  }
}

export const metadata: Metadata = {
  title: 'Partner With Amianan Ventures',
  description: 'Promote your organization, share your story, and connect with founders, startups, innovators, and ecosystem stakeholders across Northern Luzon.',
}

const heroStats = [
  { value: '150+', label: 'Stories Published' },
  { value: '100,000+', label: 'Content Views' },
  { value: null, label: 'Growing Ecosystem Community' },
]

const startupIncludes = [
  'Featured Article',
  'Homepage Feature (2 Weeks)',
  'Article Banner Placement',
  'Founder Quote Card',
  'Featured Startup Listing',
  'Newsletter Inclusion',
]

const partnerIncludes = [
  'Homepage Banner Placement',
  'Article Banner Placement',
  'Announcement Bar Placement',
  'Directory Spotlight',
  'Featured Article',
  'Social Media Feature',
]

const receiveCards = [
  { icon: FileEdit, title: 'Featured Article', desc: 'A professionally written and published feature on Amianan Ventures.' },
  { icon: Monitor, title: 'Homepage Feature', desc: 'Prominent placement on the homepage for two weeks, seen by every visitor.' },
  { icon: Layers, title: 'Article Banner Placement', desc: 'Your brand placed inside relevant articles read across the ecosystem.' },
  { icon: Quote, title: 'Founder Quote Card', desc: 'A branded quote graphic featuring your story, ready to share anywhere.' },
  { icon: IdCard, title: 'Directory Spotlight', desc: 'A standout profile in the Northern Luzon ecosystem directory.' },
  { icon: Share2, title: 'Social Media Feature', desc: 'Your story or organization shared across Amianan Ventures\' channels.' },
]

const whyCards = [
  { icon: ShieldCheck, title: 'Build Credibility', desc: 'Professionally showcase your work and impact.' },
  { icon: Eye, title: 'Increase Visibility', desc: 'Reach founders, innovators, and ecosystem stakeholders.' },
  { icon: Users, title: 'Strengthen Community Presence', desc: 'Become part of Northern Luzon\'s growing innovation ecosystem.' },
  { icon: Sparkles, title: 'Create Lasting Assets', desc: 'Receive content and placements you can continue using beyond the campaign.' },
]

const faqs = [
  {
    q: 'Who can apply?',
    a: 'Founders, startups, MSMEs, businesses, universities, government agencies, programs, and any organization building or supporting Northern Luzon\'s innovation ecosystem.',
  },
  {
    q: 'Can universities and government agencies participate?',
    a: 'Yes — the Ecosystem Visibility Package is built for organizations and programs, including academic institutions and government units, not just startups.',
  },
  {
    q: 'How long does the process take?',
    a: 'Applications are typically reviewed within 1–3 business days. Once approved and payment is confirmed, production and publishing usually takes 7–14 business days.',
  },
  {
    q: 'Can I promote an event or program?',
    a: 'Yes — the Ecosystem Visibility Package is well suited for events, programs, and initiatives, not just ongoing organizations.',
  },
  {
    q: 'Do I need to provide content or photos?',
    a: 'No — our team interviews you and produces the written feature and content assets. You\'re welcome to share existing photos or brand assets if you have them.',
  },
  {
    q: 'Can I renew my placement?',
    a: 'Yes — once your placement period ends, you can reapply for another round at the then-current rate.',
  },
]

export default async function GetFeaturedPage() {
  const spotlightExamples = await getSpotlightExamples()

  return (
    <div className="min-h-screen bg-white">

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative overflow-hidden border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#00a855] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a855]" />
                Partner With Amianan Ventures
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-zinc-900 leading-[1.08] mb-5">
                Reach Northern Luzon&apos;s<br />
                <span className="text-[#00a855]">Innovation Community</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-500 leading-relaxed max-w-lg mb-8">
                Promote your organization, share your story, and connect with founders, startups, innovators, businesses, universities, and ecosystem stakeholders across Northern Luzon.
              </p>
              <div className="flex items-center gap-3 flex-wrap mb-10">
                <Link
                  href="/get-featured/apply"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#042212] text-white font-bold text-sm hover:bg-[#06331c] transition-colors"
                >
                  Get Featured <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/partner"
                  className="inline-flex items-center px-6 py-3.5 rounded-lg border-2 border-zinc-900 text-zinc-900 font-bold text-sm hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  Become A Partner
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8 flex-wrap">
                {heroStats.map((s) => (
                  <div key={s.label}>
                    {s.value && <p className="text-2xl font-black text-zinc-900 leading-none mb-1">{s.value}</p>}
                    <p className={`font-bold text-zinc-500 ${s.value ? 'text-xs' : 'text-sm text-zinc-700'}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: hero visual */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/get-featured-hero.png"
                  alt="Founders, business owners, and ecosystem builders across Northern Luzon"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#042212]/40 via-transparent to-transparent" />
              </div>
              {/* Floating credibility chip */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-zinc-100 px-5 py-4 flex items-center gap-3 max-w-[220px]">
                <div className="w-10 h-10 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0">
                  <Star className="h-4 w-4 text-[#00a855]" />
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-900 leading-tight">Built for credibility</p>
                  <p className="text-[11px] text-zinc-400">Not a marketplace.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust card */}
          <div className="mt-16 rounded-2xl bg-zinc-50 border border-zinc-200 p-6 sm:p-7 flex items-center gap-4">
            <ShieldCheck className="h-6 w-6 text-[#00a855] shrink-0" />
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Helping organizations, founders, and ecosystem builders share their stories, build credibility, and increase visibility across Northern Luzon.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════ CHOOSE YOUR PATH ════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight mb-4">
            Choose The Option That Fits You
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
            Whether you&apos;re building a startup or promoting an organization, we have a package designed for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CARD 1 — Startups */}
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
            <div className="p-7 sm:p-8 flex-1 flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00a855] mb-3">For Founders & Startups</span>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Startup Spotlight Package</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                Share your story and build your reputation through a professionally published feature.
              </p>

              <div className="flex items-baseline gap-2.5 mb-6">
                <p className="text-4xl font-black text-zinc-900">₱{PACKAGES['founding-rate'].amount_php}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00a855] bg-[#00a855]/10 px-2.5 py-1 rounded-full">
                  Founding Rate
                </span>
              </div>

              <div className="space-y-2.5 mb-8">
                {startupIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#00a855] shrink-0" />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/get-featured/apply?package=founding-rate"
                className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#042212] text-white font-bold text-sm hover:bg-[#06331c] transition-colors"
              >
                Share Your Story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* CARD 2 — Organizations */}
          <div className="rounded-2xl border-2 border-[#042212] bg-white overflow-hidden flex flex-col relative">
            <span className="absolute top-5 right-5 text-[10px] font-black uppercase tracking-widest text-white bg-[#042212] px-2.5 py-1 rounded-full">
              For Organizations
            </span>
            <div className="p-7 sm:p-8 flex-1 flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00a855] mb-3">For Organizations & Programs</span>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Ecosystem Visibility Package</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                Promote your organization and connect with Northern Luzon&apos;s innovation community.
              </p>

              <div className="flex items-baseline gap-2.5 mb-6">
                <p className="text-4xl font-black text-zinc-900">₱{PACKAGES['ecosystem-visibility'].amount_php}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00a855] bg-[#00a855]/10 px-2.5 py-1 rounded-full">
                  Founding Rate
                </span>
              </div>

              <div className="space-y-2.5 mb-8">
                {partnerIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#00a855] shrink-0" />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/get-featured/apply?package=ecosystem-visibility"
                className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#00a855] text-black font-bold text-sm hover:bg-[#00b85e] transition-colors"
              >
                Become An Ecosystem Partner <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ WHAT YOU RECEIVE ════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight">See What You&apos;ll Receive</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {receiveCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="w-10 h-10 rounded-full bg-[#00a855]/10 flex items-center justify-center mb-4">
                <card.icon className="h-4.5 w-4.5 text-[#00a855]" />
              </div>
              <p className="text-sm font-black text-zinc-900 mb-1.5">{card.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">{card.desc}</p>

              {/* Mini mockup preview, varies per card */}
              {card.title === 'Featured Article' && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="h-2 bg-zinc-200 rounded w-4/5 mb-1.5" />
                  <div className="h-2 bg-zinc-200 rounded w-3/5 mb-2" />
                  <div className="aspect-video rounded bg-gradient-to-br from-zinc-200 to-zinc-300" />
                </div>
              )}
              {card.title === 'Homepage Feature' && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 rounded-sm bg-[#042212]" />
                    <div className="h-1.5 bg-zinc-300 rounded w-10" />
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="aspect-square rounded bg-gradient-to-br from-[#00a855]/30 to-[#00a855]/10 ring-2 ring-[#00a855]" />
                    <div className="aspect-square rounded bg-zinc-200" />
                    <div className="aspect-square rounded bg-zinc-200" />
                  </div>
                </div>
              )}
              {card.title === 'Article Banner Placement' && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-1.5">
                  <div className="h-1.5 bg-zinc-200 rounded w-full" />
                  <div className="h-1.5 bg-zinc-200 rounded w-5/6" />
                  <div className="h-8 rounded bg-gradient-to-br from-[#0a3a22] to-[#042212] flex items-center justify-center">
                    <span className="text-[6px] font-black text-white uppercase">Your Brand Here</span>
                  </div>
                  <div className="h-1.5 bg-zinc-200 rounded w-3/4" />
                </div>
              )}
              {card.title === 'Founder Quote Card' && (
                <div className="rounded-lg bg-[#042212] p-4">
                  <Quote className="h-4 w-4 text-[#00cc6a] mb-2" />
                  <div className="h-1.5 bg-white/30 rounded w-full mb-1" />
                  <div className="h-1.5 bg-white/30 rounded w-3/4 mb-2.5" />
                  <div className="h-1.5 bg-white/50 rounded w-1/3" />
                </div>
              )}
              {card.title === 'Directory Spotlight' && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 shrink-0" />
                  <div className="flex-1">
                    <div className="h-1.5 bg-zinc-300 rounded w-3/4 mb-1" />
                    <span className="inline-block text-[6px] font-black uppercase px-1 py-0.5 rounded bg-[#00a855]/15 text-[#00a855]">Featured</span>
                  </div>
                </div>
              )}
              {card.title === 'Social Media Feature' && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded-full bg-zinc-300" />
                    <div className="h-1.5 bg-zinc-300 rounded w-12" />
                  </div>
                  <div className="aspect-square rounded bg-gradient-to-br from-zinc-200 to-zinc-300 mb-1.5" />
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-2.5 w-2.5 text-zinc-300" />
                    <MessageCircle className="h-2.5 w-2.5 text-zinc-300" />
                    <Send className="h-2.5 w-2.5 text-zinc-300" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ WHY PARTNER ════════════════════ */}
      <section className="bg-[#042212] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-32 top-1/4 w-96 h-96 rounded-full border border-white/5" />
          <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full border border-white/5" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Why Organizations Choose Amianan Ventures
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="w-10 h-10 rounded-full bg-[#00a855]/15 flex items-center justify-center mb-4">
                  <card.icon className="h-4.5 w-4.5 text-[#00cc6a]" />
                </div>
                <p className="text-sm font-black text-white mb-1.5">{card.title}</p>
                <p className="text-xs text-white/50 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ STORIES FROM FOUNDERS LIKE YOU ════════════════════ */}
      {spotlightExamples.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1 h-4 bg-[#00cc6a] rounded-full shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-800">Stories From Founders Like You</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {spotlightExamples.map((ex) => (
              <Link key={ex.name} href={`/founder-stories/${ex.slug}`} className="group flex flex-col gap-3">
                <div className="relative aspect-square rounded-xl bg-zinc-50 border border-zinc-200 overflow-hidden flex items-center justify-center group-hover:border-[#00a855]/40 transition-colors">
                  {ex.logo_url ? (
                    <Image src={ex.logo_url} alt={ex.name} fill className="object-contain p-4" sizes="160px" unoptimized />
                  ) : (
                    <span className="text-2xl font-black text-zinc-300">{ex.name.charAt(0)}</span>
                  )}
                </div>
                <p className="text-sm font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#00a855] transition-colors">{ex.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════ FAQ ════════════════════ */}
      <section className="bg-zinc-50 border-t border-zinc-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight">Frequently Asked Questions</h2>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* ════════════════════ FINAL CTA ════════════════════ */}
      <section className="bg-[#042212] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5" />
          <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full border border-white/5" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 max-w-2xl mx-auto">
            Ready To Share Your Story Or Promote Your Organization?
          </h2>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto leading-relaxed mb-12">
            Join the founders, businesses, universities, programs, and ecosystem partners helping shape Northern Luzon&apos;s future.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto text-left">
            <Link
              href="/get-featured/apply?package=founding-rate"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#00a855]/40 transition-colors"
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-2">Startups &amp; Founders</p>
              <p className="text-base font-black text-white mb-4">Startup Spotlight Package</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#00cc6a] transition-colors">
                Share Your Story <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/get-featured/apply?package=ecosystem-visibility"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#00a855]/40 transition-colors"
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#00cc6a] mb-2">Organizations &amp; Programs</p>
              <p className="text-base font-black text-white mb-4">Ecosystem Visibility Package</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#00cc6a] transition-colors">
                Become An Ecosystem Partner <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

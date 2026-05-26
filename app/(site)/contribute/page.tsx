import type { Metadata } from 'next'
import Link from 'next/link'
import { PenLine, Eye, CheckCircle, ArrowRight, BookOpen, Lightbulb, Mic2, Building2, FlaskConical } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contribute — Write for Amianan Ventures',
  description: 'Share your story, insights, and expertise with the Northern Luzon innovation ecosystem. Submit founder stories, opinion pieces, and program recaps.',
}

const contentTypes = [
  { icon: Mic2, label: 'Founder Story', desc: 'Your personal journey building a startup or MSME' },
  { icon: Lightbulb, label: 'Opinion / Essay', desc: 'Your perspective on an ecosystem issue or trend' },
  { icon: BookOpen, label: 'Program Recap', desc: 'A recap of an event, program, or initiative you ran or attended' },
  { icon: Building2, label: 'Ecosystem Spotlight', desc: 'Highlighting an organization, community, or initiative' },
  { icon: FlaskConical, label: 'Field Notes', desc: 'Research observations or thesis findings relevant to the region' },
]

const steps = [
  { step: '01', icon: PenLine, title: 'Create an account', desc: 'Sign up with your email and build a contributor profile — your byline, role, and bio.' },
  { step: '02', icon: BookOpen, title: 'Submit your piece', desc: 'Fill out the submission form with your headline, summary, and draft content (or a Google Docs link).' },
  { step: '03', icon: Eye, title: 'Editorial review', desc: 'Our editor reviews every submission. You\'ll hear back within 5–7 days — with approval, revision notes, or feedback.' },
  { step: '04', icon: CheckCircle, title: 'Published!', desc: 'Approved pieces are published on amiananventures.org with your byline and shared across our channels.' },
]

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00cc6a]/10 text-[#00a855] text-xs font-semibold uppercase tracking-wider mb-6">
            <PenLine className="h-3.5 w-3.5" /> Contributor Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 leading-tight mb-5 tracking-tight">
            Your voice belongs<br className="hidden sm:block" /> in this ecosystem.
          </h1>
          <p className="text-lg text-zinc-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Amianan Innovation Ventures publishes stories from founders, TBI staff, students, and
            ecosystem builders across Northern Luzon. Share your experience with the community.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/contribute/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white font-semibold text-sm hover:bg-zinc-800 transition-colors"
            >
              Start Contributing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contribute/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-zinc-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Content types */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">What you can submit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentTypes.map((type) => (
            <div key={type.label} className="flex gap-3 p-4 rounded-xl border border-zinc-100 bg-zinc-50">
              <type.icon className="h-5 w-5 text-[#00a855] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-900">{type.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{type.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-zinc-50 border-y border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xs font-black text-[#00cc6a]">{s.step}</span>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>
                <s.icon className="h-6 w-6 text-zinc-700 mb-3" />
                <p className="text-sm font-bold text-zinc-900 mb-1.5">{s.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-black text-zinc-900 mb-3">Ready to share your story?</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
          Create a free account in under a minute. Your first submission could reach thousands of founders, investors, and ecosystem builders across Northern Luzon.
        </p>
        <Link
          href="/contribute/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white font-semibold text-sm hover:bg-zinc-800 transition-colors"
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

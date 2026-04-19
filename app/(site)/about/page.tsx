import type { Metadata } from 'next'
import { ArrowRight, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'Amianan Ventures is an innovation platform strengthening the Northern Luzon startup ecosystem through media, programs, and community.',
}

const VALUES = [
  {
    title: 'Builders First',
    desc: 'Everything we do exists to help founders build real companies. The ecosystem only gets stronger when founders succeed.',
  },
  {
    title: 'Learning Together',
    desc: 'Progress comes through experimenting and sharing knowledge openly. We learn by doing and take others along.',
  },
  {
    title: 'Openness',
    desc: 'Opportunities and information should be accessible to anyone building in Northern Luzon — not just those already in the room.',
  },
  {
    title: 'Ambition',
    desc: 'We support founders who are building ventures that matter beyond the region. Northern Luzon can produce globally competitive companies.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div className="bg-[#042212] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-3">About</p>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5 text-white">
            Strengthening the<br />
            <span className="text-[#00cc6a]">Northern Luzon</span> Innovation Ecosystem
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
            Amianan Ventures is an innovation platform connecting founders, startups, universities, and ecosystem partners across Baguio, the Cordillera, and Northern Luzon.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        {/* ── Story ── */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-3">Our Story</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 mb-4 leading-tight">
                Northern Luzon has growing innovation potential — but the ecosystem remains fragmented.
              </h2>
            </div>
            <div>
              <p className="text-zinc-600 leading-relaxed mb-4">
                We started by mapping opportunities across Baguio and the Cordillera region to help founders navigate unclear paths from idea to venture. Too many builders didn't know what programs existed, what funding was available, or who else was building.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Amianan Ventures was built to fix the information gap — and to make the ecosystem more visible, connected, and accessible for everyone in it.
              </p>
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-xl bg-[#042212] text-white p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-3">Mission</p>
            <p className="text-lg font-black leading-snug">
              To strengthen the Northern Luzon innovation ecosystem by improving information flow, helping founders discover programs and funding, and fostering collaboration among builders.
            </p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Vision</p>
            <p className="text-lg font-black text-zinc-900 leading-snug">
              A Northern Luzon where every founder has the support, knowledge, and opportunities to build globally competitive ventures.
            </p>
          </div>
        </section>

        {/* ── What we do ── */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-3">What We Do</p>
          <h2 className="text-2xl font-black text-zinc-900 mb-6 leading-tight max-w-xl">
            Media, discovery tools, and programs — all in one platform.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Ecosystem Media',
                desc: 'News, founder stories, and updates covering the people and organizations building across Northern Luzon.',
              },
              {
                title: 'Ecosystem Directory',
                desc: 'An open, community-updated directory of startups, incubators, universities, and government agencies in the region.',
              },
              {
                title: 'Founder Programs',
                desc: 'Supporting founders through programs designed to accelerate early-stage ventures in Northern Luzon.',
              },
              {
                title: 'Research & Insights',
                desc: 'Data-driven insights on the regional innovation landscape to help stakeholders make better decisions.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-zinc-200 p-5 hover:border-black transition-colors">
                <h3 className="font-black text-zinc-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Values ── */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-3">Core Values</p>
          <h2 className="text-2xl font-black text-zinc-900 mb-6 leading-tight">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4 p-5 rounded-lg border border-zinc-200">
                <div className="w-1.5 shrink-0 rounded-full bg-[#00cc6a] mt-1" />
                <div>
                  <h3 className="font-black text-zinc-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-xl bg-zinc-50 border border-zinc-200 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-black text-zinc-900 mb-1">Have a story or startup to share?</h2>
            <p className="text-sm text-zinc-500">We're always looking to connect with founders, innovators, and ecosystem builders.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <a
                href="mailto:amiananventures@gmail.com"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-black transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                amiananventures@gmail.com
              </a>
              <a
                href="https://www.facebook.com/amiananventures"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-black transition-colors"
              >
                <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                Facebook
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="https://airtable.com/appYUrRsmwImGgG3C/pagjZcduZUZQd759K/form"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#042212] text-white px-5 py-2.5 rounded font-bold text-sm hover:bg-black transition-colors uppercase tracking-wide"
            >
              Share your story <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://airtable.com/appYUrRsmwImGgG3C/pagsOvlAtunXtZ5Og/form"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-700 px-5 py-2.5 rounded font-bold text-sm hover:border-black hover:text-black transition-colors uppercase tracking-wide"
            >
              List a startup <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'
import { QuickMessageForm } from './QuickMessageForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Amianan Ventures — program design, facilitation, ecosystem research, and advisory for institutions across Northern Luzon.',
}

const SERVICES = [
  {
    title: 'Program Design',
    description:
      'Co-design innovation programs, startup challenges, and entrepreneurship curricula tailored for the Northern Luzon context.',
  },
  {
    title: 'Facilitation',
    description:
      'Lead workshops, bootcamps, hackathons, and panel sessions with regional startup communities and student innovators.',
  },
  {
    title: 'Ecosystem Research',
    description:
      'Map and analyze the Northern Luzon startup landscape, identify gaps, and produce data-driven reports for institutions.',
  },
  {
    title: 'Advisory',
    description:
      'Strategic guidance for university innovation offices, LGUs, and agencies looking to build or scale startup programs.',
  },
  {
    title: 'Content & Media',
    description:
      "Amplify your institution's programs through editorial features, founder spotlights, and ecosystem stories on our platform.",
  },
  {
    title: 'Community Convening',
    description:
      'Connect your institution with founders, investors, and innovation partners across Cordillera, Cagayan Valley, Ilocos, and Pangasinan.',
  },
]

const LINKS = [
  {
    label: 'Submit a Startup',
    description: 'Add your startup or organization to the Northern Luzon ecosystem directory.',
    href: '/submit-startup',
    cta: 'Submit a startup',
  },
  {
    label: 'Partner With Us',
    description: 'Interested in content partnerships, event sponsorships, or featured placements?',
    href: '/partner',
    cta: 'Send a partnership inquiry',
  },
  {
    label: 'Share Your Founder Story',
    description: "Are you a founder building in the north? We want to feature your innovation story.",
    href: '/founder-story',
    cta: 'Share your story',
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-2">Contact</p>
        <h1 className="text-4xl font-black text-zinc-900 mb-3 leading-tight">Get in Touch</h1>
        <p className="text-zinc-500 leading-relaxed max-w-xl">
          Whether you have a story to share, a startup to list, a partnership inquiry, or want to explore how we work with institutions — reach out below.
        </p>
      </div>

      {/* Contact info */}
      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-6 mb-12">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Direct Contact</p>
        <div className="flex flex-col sm:flex-row gap-5">
          <a
            href="mailto:amiananventures@gmail.com"
            className="flex items-center gap-3 text-sm font-semibold text-zinc-700 hover:text-black transition-colors"
          >
            <Mail className="h-4 w-4 text-[#00cc6a] shrink-0" />
            amiananventures@gmail.com
          </a>
          <a
            href="https://www.facebook.com/amiananventures"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm font-semibold text-zinc-700 hover:text-black transition-colors"
          >
            <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            facebook.com/amiananventures
          </a>
        </div>
      </div>

      {/* For Institutions */}
      <div className="mb-14">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-2">For Institutions</p>
        <h2 className="text-2xl font-black text-zinc-900 mb-2 leading-tight">What We Offer</h2>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-xl mb-8">
          We work with universities, government agencies, LGUs, and development organizations to strengthen the innovation ecosystem across Northern Luzon.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00cc6a] mb-3" />
              <p className="font-black text-zinc-900 mb-1.5 text-sm">{s.title}</p>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Message */}
      <div className="mb-14">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-2">Quick Message</p>
        <h2 className="text-2xl font-black text-zinc-900 mb-2 leading-tight">Send Us a Message</h2>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mb-8">
          Have a quick question or want to start a conversation? Fill out the form and we&apos;ll get back to you within 2–3 business days.
        </p>
        <QuickMessageForm />
      </div>

      {/* Other ways to connect */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Other Ways to Connect</p>
        <div className="space-y-4">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center justify-between gap-6 rounded-xl border border-zinc-200 bg-white p-6 hover:border-black hover:shadow-md transition-all"
            >
              <div>
                <p className="font-black text-zinc-900 mb-1">{item.label}</p>
                <p className="text-sm text-zinc-500">{item.description}</p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-zinc-700 group-hover:text-black transition-colors">
                {item.cta} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

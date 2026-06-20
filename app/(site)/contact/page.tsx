import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ArrowRight, MapPin } from 'lucide-react'
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
    href: '/share-your-story',
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

      {/* Ambassador Program */}
      <div className="mb-14">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00cc6a] mb-2">Join the Team</p>
        <h2 className="text-2xl font-black text-zinc-900 mb-2 leading-tight">Regional Ambassador Program</h2>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-xl mb-8">
          We&apos;re building a network of on-the-ground ambassadors who know their regions, their founders, and their communities. If you&apos;re embedded in the Northern Luzon innovation scene and want to help grow it — we want to hear from you.
        </p>

        {/* What ambassadors do */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">What You&apos;ll Do</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {[
              'Scout and surface local startup stories worth telling',
              'Cover events, programs, and ecosystem milestones in your region',
              'Connect Amianan Ventures with founders, schools, and organizations',
              'Contribute regional news and insights to our platform',
              'Help map and verify ecosystem directory listings',
              'Represent Amianan Ventures at local events and forums',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-600">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00cc6a] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Open regions */}
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Open Regions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              region: 'Cordillera',
              areas: 'Baguio City, Benguet, Ifugao, Mountain Province, Abra, Apayao, Kalinga',
              color: 'border-emerald-200 bg-emerald-50',
              dot: 'bg-emerald-400',
              badge: 'text-emerald-700 bg-emerald-100',
            },
            {
              region: 'Ilocos Region',
              areas: 'Ilocos Norte, Ilocos Sur, La Union, Pangasinan',
              color: 'border-blue-200 bg-blue-50',
              dot: 'bg-blue-400',
              badge: 'text-blue-700 bg-blue-100',
            },
            {
              region: 'Cagayan Valley',
              areas: 'Cagayan, Isabela, Nueva Vizcaya, Quirino, Batanes',
              color: 'border-amber-200 bg-amber-50',
              dot: 'bg-amber-400',
              badge: 'text-amber-700 bg-amber-100',
            },
          ].map((r) => (
            <div key={r.region} className={`rounded-xl border p-5 ${r.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-zinc-500 shrink-0" />
                <p className="font-black text-zinc-900 text-sm">{r.region}</p>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${r.badge}`}>
                  Open
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{r.areas}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-black text-white mb-1">Ready to represent your region?</p>
            <p className="text-sm text-zinc-400">Send us a message below — tell us your region, your background, and why you want to be part of this.</p>
          </div>
          <a
            href="#quick-message"
            className="shrink-0 inline-flex items-center gap-2 bg-[#00cc6a] text-black px-6 py-2.5 rounded font-bold text-sm hover:bg-[#00b85e] transition-colors uppercase tracking-wide whitespace-nowrap"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Quick Message */}
      <div id="quick-message" className="mb-14">
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

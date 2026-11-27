import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Handshake, Mail, PenLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MAIN_SITE_URL } from '@/lib/site'
import { QuickMessageForm } from './QuickMessageForm'
import { TOPICS, type Topic } from './topics'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions, story ideas, or an opportunity to list? Get in touch with the Amianan Ventures team.',
}

const WAYS: { title: string; desc: string; href: string; Icon: LucideIcon }[] = [
  { title: 'Share your story', desc: 'Building something? We’d love to feature it.', href: '/share-your-story', Icon: PenLine },
  { title: 'Partner with us', desc: 'Sponsorships, features, and content partnerships.', href: '/partner', Icon: Handshake },
]

const link = 'font-semibold text-[#131314] decoration-[#befc65] decoration-2 underline-offset-4 hover:underline'

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { topic } = await searchParams
  const initialTopic = TOPICS.some((t) => t.value === topic) ? (topic as Topic) : undefined

  return (
    <div className="bg-[#f7f7f1]">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* Intro */}
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#131314]">
              <span className="h-3.5 w-1 rounded-full bg-[#befc65]" aria-hidden />
              Contact
            </p>
            <h1 className="mt-2 font-editorial text-[2.75rem] font-bold leading-none text-[#131314] sm:text-[3.4rem]">
              Get in touch.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600 sm:text-[17px]">
              Have a question, a story idea, or an opportunity to list? Send us a note. We reply within 2–3 business days.
            </p>

            <ul className="mt-7 space-y-3 text-sm">
              <li>
                <a href="mailto:amiananventures@gmail.com" className={`inline-flex items-center gap-3 ${link}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#131314] text-[#befc65]">
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  amiananventures@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/amiananventures"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 ${link}`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#131314] text-[#befc65]">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </span>
                  facebook.com/amiananventures
                </a>
              </li>
            </ul>

            <p className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
              Want help building a product?{' '}
              <a href={`${MAIN_SITE_URL}/contact/`} className={`inline-flex items-center gap-0.5 ${link}`}>
                Talk to our studio <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </p>
          </div>

          {/* Form */}
          <section
            id="message"
            aria-label="Send us a message"
            className="scroll-mt-32 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-7"
          >
            <QuickMessageForm initialTopic={initialTopic} />
          </section>
        </div>

        {/* Other ways */}
        <section aria-labelledby="ways-heading" className="mt-14 border-t border-zinc-300/70 pt-8">
          <h2 id="ways-heading" className="font-editorial text-[1.6rem] font-bold leading-none text-[#131314]">
            Other ways to get involved
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {WAYS.map(({ title, desc, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400"
              >
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#131314]" strokeWidth={1.6} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[#131314]">{title}</span>
                  <span className="mt-0.5 block text-sm text-zinc-600">{desc}</span>
                </span>
                <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[#65a30d] transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

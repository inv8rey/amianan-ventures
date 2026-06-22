import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Star, Check, Eye, ShieldCheck, Users,
  ListChecks, FileEdit, BadgeCheck, Sparkles, Mail,
} from 'lucide-react'
import { PACKAGES, type PackageId } from '@/types/spotlight'
import type { SpotlightApplication } from '@/types/spotlight'

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

const reachBullets = [
  { icon: Eye, label: 'Reach a wider audience' },
  { icon: ShieldCheck, label: 'Build credibility and trust' },
  { icon: Users, label: 'Connect with the right people' },
]

const howItWorks = [
  { title: 'Choose a package', desc: 'Pick the feature option that best fits your goals.' },
  { title: 'Submit your details', desc: 'Tell us more about you or your organization and your story.' },
  { title: 'Review & confirmation', desc: "We'll review your request and confirm your feature." },
  { title: 'Get featured', desc: 'Your story goes live and reaches our growing community.' },
]

const whatYoullGet = [
  { icon: Users, label: 'Reach a targeted audience', desc: 'Founders, investors, customers, and ecosystem builders.' },
  { icon: BadgeCheck, label: 'Build credibility', desc: 'Position your brand as a trusted voice in the ecosystem.' },
  { icon: Sparkles, label: 'Generate opportunities', desc: 'Open doors to new partnerships, collaborations, and growth.' },
]

export function FeaturePackages({ spotlight }: { spotlight: SpotlightApplication | null }) {
  const hasApplication = !!spotlight

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-2 mb-4 text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>

      <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
        Get Featured <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
      </h1>
      <p className="text-sm text-zinc-500 mt-1 mb-6">
        Amplify your story and reach more people in the Northern Luzon innovation ecosystem.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          {/* Hero banner */}
          <div className="relative rounded-2xl overflow-hidden bg-[#042212]">
            <div className="absolute inset-0">
              <Image
                src="/get-featured-hero.png"
                alt="Founders and ecosystem builders across Northern Luzon"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#042212] via-[#042212]/85 to-[#042212]/20" />
            </div>
            <div className="relative z-10 p-7 sm:p-9 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                More visibility. More connections. More impact.
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                Our feature packages are designed to help founders, organizations, and innovators share their story with a wider audience and unlock new opportunities.
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                {reachBullets.map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <b.icon className="h-3.5 w-3.5 text-[#00cc6a] shrink-0" />
                    <span className="text-xs font-semibold text-white">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Choose Your Feature Package */}
          <div>
            <p className="text-sm font-black text-zinc-900">Choose Your Feature Package</p>
            <p className="text-xs text-zinc-400 mt-0.5 mb-4">Pick the option that best fits your goals.</p>

            {hasApplication && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 mb-4">
                <ListChecks className="h-4 w-4 text-zinc-400 shrink-0" />
                <p className="text-xs text-zinc-600">
                  You already have an application in progress — select either package below to view or continue it.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PackageCard
                id="founding-rate"
                label="For Founders & Startups"
                name="Startup Spotlight Package"
                desc="Share your story and build your reputation through a professionally published feature."
                includes={startupIncludes}
                matched={spotlight?.package === 'founding-rate'}
                hasApplication={hasApplication}
              />
              <PackageCard
                id="ecosystem-visibility"
                label="For Organizations & Programs"
                name="Ecosystem Visibility Package"
                desc="Promote your organization and connect with Northern Luzon's innovation community."
                includes={partnerIncludes}
                matched={spotlight?.package === 'ecosystem-visibility'}
                hasApplication={hasApplication}
                highlighted
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-black text-zinc-900 mb-4">How It Works</p>
            <div className="space-y-4">
              {howItWorks.map((step, i) => (
                <div key={step.title} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00a855]/10 flex items-center justify-center shrink-0 text-[11px] font-black text-[#00a855]">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{step.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-black text-zinc-900 mb-4">What You&apos;ll Get</p>
            <div className="space-y-3.5">
              {whatYoullGet.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="h-3.5 w-3.5 text-[#00a855] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{item.label}</p>
                    <p className="text-xs text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-black text-zinc-900 mb-1">Need help deciding?</p>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              We&apos;re here to help you choose the best option for your goals.
            </p>
            <a
              href="mailto:amiananventures@gmail.com"
              className="inline-flex items-center justify-center gap-2 border border-zinc-300 text-zinc-700 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-50 transition-colors w-full"
            >
              <Mail className="h-3.5 w-3.5" /> Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Secure & Transparent footer banner */}
      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-[#00a855]/20 bg-[#00a855]/5 p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[#00a855] shrink-0" />
          <div>
            <p className="text-sm font-bold text-zinc-900">Secure &amp; Transparent</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your payment is secure. We&apos;re transparent about our process and committed to showcasing stories that create real impact.
            </p>
          </div>
        </div>
        <Link
          href="/share-your-story"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors shrink-0"
        >
          <FileEdit className="h-3.5 w-3.5" /> View Content Guidelines
        </Link>
      </div>
    </div>
  )
}

function PackageCard({
  id, label, name, desc, includes, matched, hasApplication, highlighted,
}: {
  id: PackageId
  label: string
  name: string
  desc: string
  includes: string[]
  matched: boolean
  hasApplication: boolean
  highlighted?: boolean
}) {
  const pkg = PACKAGES[id]
  const cta = hasApplication ? (matched ? 'View Application' : 'View Your Application') : `Select ${id === 'founding-rate' ? 'Spotlight' : 'Ecosystem Partner'}`
  const href = hasApplication ? '/spotlight' : `/spotlight?package=${id}`

  return (
    <div className={`rounded-2xl border bg-white overflow-hidden flex flex-col ${highlighted ? 'border-2 border-[#042212] relative' : 'border-zinc-200'}`}>
      {highlighted && (
        <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest text-white bg-[#042212] px-2 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <div className="p-6 flex-1 flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#00a855] mb-2.5">{label}</span>
        <h3 className="text-lg font-black text-zinc-900 mb-1.5">{name}</h3>
        <p className="text-xs text-zinc-500 leading-relaxed mb-4">{desc}</p>

        <div className="flex items-baseline gap-2 mb-5">
          <p className="text-3xl font-black text-zinc-900">₱{pkg.amount_php.toLocaleString()}</p>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#00a855] bg-[#00a855]/10 px-2 py-0.5 rounded-full">
            {pkg.badge}
          </span>
        </div>

        <div className="space-y-2 mb-6">
          {includes.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-[#00a855] shrink-0" />
              <span className="text-xs text-zinc-700">{item}</span>
            </div>
          ))}
        </div>

        <Link
          href={href}
          className={`mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-bold text-sm transition-colors ${
            highlighted ? 'bg-[#042212] text-white hover:bg-[#06331c]' : 'border-2 border-[#042212] text-[#042212] hover:bg-zinc-50'
          }`}
        >
          {cta}
        </Link>
      </div>
    </div>
  )
}

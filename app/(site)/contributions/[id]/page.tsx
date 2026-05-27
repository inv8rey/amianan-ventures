import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, ExternalLink, Globe, MapPin } from 'lucide-react'
import {
  CONTENT_TYPE_LABELS,
  ROLE_LABELS,
  type ContentType,
  type ContributorRole,
} from '@/types/contributor'

export const dynamic = 'force-dynamic'

const TYPE_COLORS: Record<ContentType, string> = {
  founder_story:       'text-amber-700 bg-amber-50 border-amber-200',
  opinion_essay:       'text-violet-700 bg-violet-50 border-violet-200',
  program_recap:       'text-blue-700 bg-blue-50 border-blue-200',
  ecosystem_spotlight: 'text-[#00a855] bg-[#00a855]/8 border-[#00a855]/20',
  field_notes:         'text-teal-700 bg-teal-50 border-teal-200',
}

async function getContribution(id: string) {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('contributor_submissions')
      .select(`
        id, headline, summary, content_type, draft_type, draft_content, gdocs_url,
        region, sector, published_at, published_url,
        contributor_profiles (
          id, display_name, full_name, role, organization, region,
          bio, photo_url, linkedin_url, facebook_url, website_url
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const contribution = await getContribution(id)
  if (!contribution) return { title: 'Not Found' }

  const profile = Array.isArray(contribution.contributor_profiles)
    ? contribution.contributor_profiles[0]
    : contribution.contributor_profiles

  return {
    title: `${contribution.headline} — Amianan Ventures`,
    description: contribution.summary,
    authors: profile ? [{ name: profile.display_name }] : undefined,
    openGraph: {
      title: contribution.headline,
      description: contribution.summary,
      type: 'article',
    },
  }
}

export default async function ContributionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contribution = await getContribution(id)
  if (!contribution) notFound()

  const profile = Array.isArray(contribution.contributor_profiles)
    ? contribution.contributor_profiles[0] ?? null
    : contribution.contributor_profiles as {
        id: string
        display_name: string
        full_name: string | null
        role: string | null
        organization: string | null
        region: string | null
        bio: string | null
        photo_url: string | null
        linkedin_url: string | null
        facebook_url: string | null
        website_url: string | null
      } | null

  const contentType = contribution.content_type as ContentType
  const typeStyle = TYPE_COLORS[contentType] ?? 'text-zinc-600 bg-zinc-50 border-zinc-200'

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Amianan Ventures
        </Link>

        {/* ── Article header ── */}
        <div className="mb-8">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mb-4 ${typeStyle}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {CONTENT_TYPE_LABELS[contentType]}
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight tracking-tight mb-4">
            {contribution.headline}
          </h1>

          <p className="text-lg text-zinc-500 leading-relaxed mb-6">
            {contribution.summary}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            {contribution.published_at && (
              <span>{format(new Date(contribution.published_at), 'MMMM d, yyyy')}</span>
            )}
            {contribution.region && (
              <>
                <span className="text-zinc-200">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {contribution.region.replace(/-/g, ' ')}
                </span>
              </>
            )}
            {contribution.sector && (
              <>
                <span className="text-zinc-200">·</span>
                <span>{contribution.sector}</span>
              </>
            )}
          </div>
        </div>

        {/* ── Contributor byline ── */}
        {profile && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-zinc-100 bg-zinc-50 mb-10">
            {profile.photo_url ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-zinc-200">
                <Image src={profile.photo_url} alt={profile.display_name} fill className="object-cover" sizes="56px" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border-2 border-zinc-200">
                <span className="text-xl font-black text-white">{profile.display_name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-zinc-900">{profile.display_name}</p>
                {profile.role && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600 font-semibold">
                    {ROLE_LABELS[profile.role as ContributorRole] ?? profile.role}
                  </span>
                )}
              </div>
              {(profile.organization || profile.region) && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {[profile.organization, profile.region?.replace(/-/g, ' ')].filter(Boolean).join(' · ')}
                </p>
              )}
              {profile.bio && (
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{profile.bio}</p>
              )}
              {/* Social links */}
              <div className="flex items-center gap-3 mt-2">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> LinkedIn
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website
                  </a>
                )}
                {profile.id && (
                  <Link href={`/contributors/${profile.id}`}
                    className="text-[10px] font-semibold text-[#00a855] hover:underline transition-colors">
                    View profile →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Article body ── */}
        <div className="border-t border-zinc-100 pt-8">
          {contribution.draft_type === 'gdocs' && contribution.gdocs_url ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center">
              <p className="text-sm text-zinc-500 mb-4">
                This article is hosted on Google Docs.
              </p>
              <a
                href={contribution.gdocs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Read Full Article
              </a>
            </div>
          ) : contribution.draft_content ? (
            <div
              className="prose prose-zinc max-w-none
                prose-headings:font-black prose-headings:tracking-tight
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-zinc-700 prose-p:leading-relaxed
                prose-a:text-[#00a855] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-zinc-900 prose-strong:font-bold
                prose-blockquote:border-l-[#00a855] prose-blockquote:text-zinc-500
                prose-li:text-zinc-700"
              dangerouslySetInnerHTML={{ __html: contribution.draft_content }}
            />
          ) : (
            <p className="text-zinc-400 text-sm text-center py-8">No content available.</p>
          )}
        </div>

        {/* ── Footer CTA ── */}
        <div className="mt-16 pt-8 border-t border-zinc-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Community Contributions</p>
              <p className="text-sm font-bold text-zinc-900">Have a story to share?</p>
              <p className="text-xs text-zinc-500 mt-0.5">Founders, researchers, and builders — submit your perspective.</p>
            </div>
            <Link
              href="/contribute"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors"
            >
              Become a Contributor
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

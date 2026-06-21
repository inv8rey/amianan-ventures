import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import {
  ArrowLeft, Globe, MapPin, Briefcase, Calendar, Clock, ArrowRight,
} from 'lucide-react'
import { ROLE_LABELS, CONTENT_TYPE_LABELS, type ContributorRole, type ContentType } from '@/types/contributor'
import type { FeaturedListing } from '@/types'
import { FacebookIcon, LinkedinIcon } from '@/components/site/SocialIcons'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

function estimateReadTime(text: string | null) {
  if (!text) return null
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words < 50) return null
  return Math.max(1, Math.round(words / 200))
}

export default async function PublicContributorProfilePage({ params }: Props) {
  const { id } = await params

  let supabase: ReturnType<typeof createServiceClient>
  try {
    supabase = createServiceClient()
  } catch {
    notFound()
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('contributor_profiles')
    .select('id, display_name, full_name, role, organization, region, bio, photo_url, linkedin_url, facebook_url, website_url')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Fetch only published submissions for this contributor
  const { data: submissions } = await supabase
    .from('contributor_submissions')
    .select('id, headline, summary, content_type, sector, published_url, published_at, cover_image_url, draft_type, draft_content')
    .eq('contributor_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const publishedSubmissions = submissions ?? []

  // Don't show profile if contributor has no published articles
  if (publishedSubmissions.length === 0) notFound()

  // Areas of focus — derived from the real sectors/content types in their
  // own published work, not a fabricated tags field.
  const focusAreas = Array.from(new Set(
    publishedSubmissions
      .map((s) => s.sector || CONTENT_TYPE_LABELS[s.content_type as ContentType])
      .filter(Boolean)
  )).slice(0, 6) as string[]

  // Sidebar ad — prefer a listing matching the contributor's own
  // organization, otherwise fall back to whatever's currently published.
  const { data: listings } = await supabase
    .from('featured_listings')
    .select('*')
    .eq('status', 'published')
    .order('display_order', { ascending: true })

  const featuredListing = (listings as FeaturedListing[] | null)?.find((l) =>
    profile.organization && l.title.toLowerCase().includes(profile.organization.toLowerCase())
  ) ?? listings?.[0] ?? null

  const coverImage = publishedSubmissions.find((s) => s.cover_image_url)?.cover_image_url

  const regionLabel = profile.region
    ? profile.region
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : null

  const firstName = profile.display_name.split(' ')[0]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-200 mb-10">
        {coverImage && (
          <>
            <Image
              src={coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/85 to-transparent" />
          </>
        )}

        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5 p-6 sm:p-8 min-h-[200px]">
          {profile.photo_url ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-sm">
              <Image
                src={profile.photo_url}
                alt={profile.display_name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
              <span className="text-3xl font-black text-white">
                {profile.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">{profile.display_name}</h1>
            {profile.full_name && profile.full_name !== profile.display_name && (
              <p className="text-sm text-zinc-500 mt-0.5">{profile.full_name}</p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              {profile.role && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00a855] bg-[#00a855]/10 px-3 py-1.5 rounded-full">
                  <Briefcase className="h-3.5 w-3.5" />
                  {ROLE_LABELS[profile.role as ContributorRole]}
                </span>
              )}
              {profile.organization && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-white px-3 py-1.5 rounded-full border border-zinc-200">
                  {profile.organization}
                </span>
              )}
              {regionLabel && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-white px-3 py-1.5 rounded-full border border-zinc-200">
                  <MapPin className="h-3.5 w-3.5" /> {regionLabel}
                </span>
              )}
            </div>

            {/* Social links */}
            {(profile.linkedin_url || profile.facebook_url || profile.website_url) && (
              <div className="flex items-center gap-4 mt-3.5">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#0077b5] transition-colors"
                  >
                    <LinkedinIcon className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {profile.facebook_url && (
                  <a
                    href={profile.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#1877f2] transition-colors"
                  >
                    <FacebookIcon className="h-4 w-4" /> Facebook
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
              </div>
            )}

            {profile.bio && (
              <p className="text-sm text-zinc-600 leading-relaxed mt-4 max-w-2xl">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Articles */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-4 bg-[#00cc6a] rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-widest text-black">
              Articles by {firstName} ({publishedSubmissions.length})
            </h2>
          </div>

          <div className="space-y-4">
            {publishedSubmissions.map((sub) => {
              const readTime = estimateReadTime(sub.draft_type === 'text' ? sub.draft_content : null)
              return (
                <div key={sub.id} className="flex gap-4 p-4 rounded-xl border border-zinc-200 bg-white">
                  {sub.cover_image_url && (
                    <div className="relative w-32 sm:w-40 aspect-[4/3] rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={sub.cover_image_url}
                        alt={sub.headline}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a855] mb-1 block">
                      {CONTENT_TYPE_LABELS[sub.content_type as ContentType]}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 leading-snug mb-1.5">{sub.headline}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-2">{sub.summary}</p>
                    <div className="flex items-center justify-between gap-3 mt-auto pt-1">
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        {sub.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {format(new Date(sub.published_at), 'MMM d, yyyy')}
                          </span>
                        )}
                        {readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {readTime} min read
                          </span>
                        )}
                      </div>
                      {sub.published_url && (
                        <a
                          href={sub.published_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:underline"
                        >
                          Read article <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {featuredListing && (
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4 pt-4 mb-2">
                Featured Contribution
              </p>
              <a
                href={featuredListing.cta_url ? `/api/featured-listings/click?id=${featuredListing.id}` : '#'}
                target={featuredListing.cta_url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-end overflow-hidden min-h-[140px] mx-4 rounded-lg"
              >
                {featuredListing.image_url ? (
                  <>
                    <Image
                      src={featuredListing.image_url}
                      alt={featuredListing.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      sizes="280px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                )}
                <div className="relative p-3">
                  <p className="text-sm font-black text-white mb-0.5">{featuredListing.title}</p>
                  {featuredListing.tagline && (
                    <p className="text-[11px] text-white/70 leading-relaxed line-clamp-2">{featuredListing.tagline}</p>
                  )}
                </div>
              </a>
              <div className="p-4">
                <p className="text-sm font-bold text-zinc-900">{featuredListing.title}</p>
                {featuredListing.tagline && (
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{featuredListing.tagline}</p>
                )}
                {featuredListing.cta_url && (
                  <a
                    href={`/api/featured-listings/click?id=${featuredListing.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Learn more
                  </a>
                )}
              </div>
            </div>
          )}

          {focusAreas.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Areas of Focus</p>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area) => (
                  <span key={area} className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(profile.linkedin_url || profile.facebook_url || profile.website_url) && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Connect</p>
              <div className="space-y-2.5">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-[#0077b5] transition-colors"
                  >
                    <LinkedinIcon className="h-4 w-4" /> LinkedIn Profile
                  </a>
                )}
                {profile.facebook_url && (
                  <a
                    href={profile.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-[#1877f2] transition-colors"
                  >
                    <FacebookIcon className="h-4 w-4" /> Facebook Profile
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
                  >
                    <Globe className="h-4 w-4" /> Website / Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

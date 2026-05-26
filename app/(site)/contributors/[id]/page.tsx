import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { ArrowLeft, Globe, MapPin, Briefcase, ExternalLink, Link2 } from 'lucide-react'
import { ROLE_LABELS, CONTENT_TYPE_LABELS, type ContributorRole, type ContentType } from '@/types/contributor'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
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
    .select('id, headline, summary, content_type, published_url, published_at')
    .eq('contributor_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const publishedSubmissions = submissions ?? []

  // Don't show profile if contributor has no published articles
  if (publishedSubmissions.length === 0) notFound()

  const regionLabel = profile.region
    ? profile.region
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-5 mb-8">
        {profile.photo_url ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-zinc-200">
            <Image
              src={profile.photo_url}
              alt={profile.display_name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border-2 border-zinc-200">
            <span className="text-2xl font-black text-white">
              {profile.display_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-zinc-900 leading-tight">{profile.display_name}</h1>
          {profile.full_name && profile.full_name !== profile.display_name && (
            <p className="text-sm text-zinc-500">{profile.full_name}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {profile.role && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full">
                <Briefcase className="h-3 w-3" />
                {ROLE_LABELS[profile.role as ContributorRole]}
              </span>
            )}
            {profile.organization && (
              <span className="text-xs text-zinc-500 font-medium">{profile.organization}</span>
            )}
            {regionLabel && (
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" /> {regionLabel}
              </span>
            )}
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3 mt-3">
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-[#0077b5] transition-colors"
                title="LinkedIn"
              >
                <Link2 className="h-3.5 w-3.5" /> LinkedIn
              </a>
            )}
            {profile.facebook_url && (
              <a
                href={profile.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-[#1877f2] transition-colors"
                title="Facebook"
              >
                <Link2 className="h-3.5 w-3.5" /> Facebook
              </a>
            )}
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                title="Website"
              >
                <Globe className="h-3.5 w-3.5" /> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-8 pb-8 border-b border-zinc-200">
          <p className="text-sm text-zinc-600 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Published articles */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-4 bg-[#00cc6a] rounded-full" />
          <h2 className="text-xs font-black uppercase tracking-widest text-black">
            Published Articles ({publishedSubmissions.length})
          </h2>
        </div>

        <div className="space-y-4">
          {publishedSubmissions.map((sub) => (
            <div key={sub.id} className="p-4 rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a855] mb-1 block">
                    {CONTENT_TYPE_LABELS[sub.content_type as ContentType]}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 leading-snug mb-1">{sub.headline}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{sub.summary}</p>
                </div>
                {sub.published_url && (
                  <a
                    href={sub.published_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:underline"
                  >
                    Read <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

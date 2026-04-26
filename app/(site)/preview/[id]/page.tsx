import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Clock, User, Eye } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import type { Article } from '@/types'

// Never cache preview pages — always fresh
export const revalidate = 0
export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-500',
  scheduled: 'bg-amber-500',
  published: 'bg-emerald-500',
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Service client bypasses RLS — shows any article regardless of status
  let supabase
  try {
    supabase = createServiceClient()
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-500 font-medium">Preview unavailable — service key not configured.</p>
        <p className="text-sm text-zinc-400 mt-2">Ask the site admin to add SUPABASE_SERVICE_ROLE_KEY to Vercel.</p>
      </div>
    )
  }

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const article = data as Article

  const date = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : 'Not yet published'

  return (
    <>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-zinc-900 text-white px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="h-4 w-4 text-zinc-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">
            PREVIEW MODE — This article is not yet public
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wide ${STATUS_COLORS[article.status] ?? 'bg-zinc-500'}`}>
            {article.status}
          </span>
        </div>
        <Link
          href={`/admin/articles/${article.id}`}
          className="text-[11px] font-bold text-[#00cc6a] hover:underline whitespace-nowrap"
        >
          ← Back to Admin
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">

          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors mb-6 uppercase tracking-wider"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {article.category === 'founder-stories' ? 'Founder Stories' : 'News'}
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-black uppercase tracking-wider ${article.category === 'founder-stories' ? 'text-[#d97706]' : 'text-[#00cc6a]'}`}>
              {article.category === 'founder-stories' ? 'Founder Story' : 'News'}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight mb-4 text-zinc-900">
            {article.title}
          </h1>

          <p className="text-base text-zinc-500 leading-relaxed mb-5 font-medium">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pb-5 mb-6 border-b border-zinc-200">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-600">
              <User className="h-3.5 w-3.5" /> {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {date}
            </span>
            {article.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-medium">
                {tag}
              </span>
            ))}
          </div>

          {article.cover_image && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-zinc-100">
              <Image
                src={article.cover_image}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}

          <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </>
  )
}

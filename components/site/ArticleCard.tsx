import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Article, Location } from '@/types'

const categoryLabel: Record<string, string> = {
  news: 'News',
  'founder-stories': 'Founder Stories',
}

const locationLabel: Record<Location, string> = {
  cordillera: 'Cordillera',
  'cagayan-valley': 'Cagayan Valley',
  'ilocos-region': 'Ilocos Region',
  pangasinan: 'Pangasinan',
  national: 'National',
}

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'horizontal' | 'compact'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const href = `/${article.category}/${article.slug}`
  const date = article.published_at
    ? format(new Date(article.published_at), 'MMM d, yyyy')
    : ''

  if (variant === 'horizontal') {
    return (
      <Link
        href={href}
        className="group flex gap-3 p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all"
      >
        {article.cover_image && (
          <div className="relative shrink-0 w-24 h-16 rounded overflow-hidden bg-zinc-100">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="96px"
            />
          </div>
        )}
        <div className="flex flex-col justify-between min-w-0 flex-1">
          <div>
            {article.location && (
              <span className="text-[10px] font-bold text-[#00a855] uppercase tracking-wider mb-1 block">
                {locationLabel[article.location]}
              </span>
            )}
            <h3 className="text-xs font-semibold line-clamp-2 text-zinc-800 group-hover:text-[#00a855] transition-colors leading-snug">
              {article.title}
            </h3>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">{date}</p>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={href} className="group block">
        <p className="text-[10px] text-zinc-400 mb-1">{date}</p>
        <h3 className="text-sm font-semibold text-zinc-800 group-hover:text-[#00a855] transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
      </Link>
    )
  }

  // Default card
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="relative aspect-video bg-zinc-100 overflow-hidden">
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
            <span className="text-4xl text-zinc-300">◈</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            article.category === 'founder-stories' ? 'text-[#d97706]' : 'text-[#00a855]'
          }`}>
            {categoryLabel[article.category]}
          </span>
          {article.location && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                {locationLabel[article.location]}
              </span>
            </>
          )}
          <span className="ml-auto text-[10px] text-zinc-400">{date}</span>
        </div>
        <h3 className="text-sm font-bold line-clamp-2 text-zinc-900 group-hover:text-[#00a855] transition-colors leading-snug mb-2">
          {article.title}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">
          {article.excerpt}
        </p>
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

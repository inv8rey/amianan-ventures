import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import type { Article } from '@/types'

const categoryLabel: Record<string, string> = {
  news: 'News',
  'founder-stories': 'Founder Story',
}

export function FeaturedArticle({ article }: { article: Article }) {
  const href = `/${article.category}/${article.slug}`
  const date = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : ''

  return (
    <Link href={href} className="group relative block rounded-lg overflow-hidden">
      <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-zinc-800">
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            priority
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-70"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#00cc6a] text-black text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider">
            Featured
          </span>
          <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
            {categoryLabel[article.category]}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-white leading-tight mb-3 max-w-3xl group-hover:text-[#00cc6a] transition-colors">
          {article.title}
        </h2>
        <p className="text-sm text-white/60 line-clamp-2 max-w-2xl mb-4 hidden sm:block leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="font-semibold text-white/70">{article.author}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  )
}

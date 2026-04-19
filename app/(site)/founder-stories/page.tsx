import type { Metadata } from 'next'
import { ArticleCard } from '@/components/site/ArticleCard'
import { getPublishedArticles } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Founder Stories',
  description: 'Entrepreneur narratives and business journeys from Northern Luzon founders.',
}

export const revalidate = 60

export default async function FounderStoriesPage() {
  const articles = await getPublishedArticles(undefined, 'founder-stories')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-[#d97706] rounded-full" />
          <h1 className="font-display text-3xl font-normal">Founder Stories</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-4">
          Individual entrepreneur narratives and business journeys from across the region
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg">No founder stories published yet.</p>
          <p className="text-sm mt-1">Check back soon.</p>
        </div>
      )}
    </div>
  )
}

// Shared building blocks for the editorial listing pages (News, Founder Stories).
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Article, Location } from '@/types'

export const locationLabel: Record<Location, string> = {
  cordillera: 'Cordillera',
  'cagayan-valley': 'Cagayan Valley',
  'ilocos-region': 'Ilocos',
  pangasinan: 'Pangasinan',
  national: 'National',
}

export const articleHref = (a: Article) => `/${a.category}/${a.slug}`

/** How a listing labels its stories: the pill on large cards, plain text (or nothing) on small ones. */
export interface StoryLabel {
  /** Label for an article, e.g. "Founder Stories" or its first tag. */
  text: (a: Article) => string
  /** Classes for the pill on the large cards. */
  pill: string
  /** Colour of the thin divider before the date. */
  divider: string
  /** Small cards: show the label as plain bold text, or leave it out. */
  onSmall: 'text' | 'none'
}

function Meta({ article, label, small = false }: { article: Article; label: StoryLabel; small?: boolean }) {
  const showLabel = !small || label.onSmall === 'text'
  const parts: React.ReactNode[] = []
  if (showLabel) {
    parts.push(
      small ? (
        <span key="l" className="text-[#131314]">{label.text(article)}</span>
      ) : (
        <span key="l" className={cn('rounded px-1.5 py-0.5', label.pill)}>{label.text(article)}</span>
      )
    )
  }
  if (article.location) {
    parts.push(
      small && label.onSmall === 'text' ? (
        <span key="loc" className="text-zinc-500">{locationLabel[article.location]}</span>
      ) : (
        <span key="loc" className="rounded border border-zinc-300 px-1.5 py-0.5 text-zinc-600">{locationLabel[article.location]}</span>
      )
    )
  }
  if (article.published_at) {
    parts.push(
      <time key="d" dateTime={article.published_at} className="text-zinc-500">
        {format(new Date(article.published_at), 'MMM d, yyyy')}
      </time>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.06em]">
      {parts.map((p, i) => (
        <span key={i} className="contents">
          {i > 0 && <span className={cn('h-3 w-px', label.divider)} aria-hidden />}
          {p}
        </span>
      ))}
    </div>
  )
}

function ReadStory({ article, size = 'sm' }: { article: Article; size?: 'sm' | 'lg' }) {
  return (
    <Link
      href={articleHref(article)}
      className={cn(
        'inline-flex w-fit items-center gap-1.5 border-b-2 border-[#befc65] pb-0.5 font-semibold text-[#131314] transition-colors hover:border-[#131314]',
        size === 'lg' ? 'text-base' : 'text-sm'
      )}
      aria-label={`Read story: ${article.title}`}
    >
      Read story <ArrowRight className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden />
    </Link>
  )
}

function Cover({ article, sizes, priority = false, className }: { article: Article; sizes: string; priority?: boolean; className?: string }) {
  return (
    <Link href={articleHref(article)} tabIndex={-1} aria-hidden className={cn('relative block overflow-hidden bg-zinc-200', className)}>
      {article.cover_image && (
        <Image
          src={article.cover_image}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ objectPosition: article.cover_position ?? '50% 50%' }}
        />
      )}
    </Link>
  )
}

const card = 'group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
const titleLink = 'decoration-[#befc65] underline-offset-4 hover:underline'

export function LeadStory({ article, label }: { article: Article; label: StoryLabel }) {
  return (
    <article className={cn(card, 'grid md:grid-cols-[1.05fr_1fr]')}>
      <Cover article={article} priority sizes="(max-width: 768px) 100vw, 35vw" className="aspect-[16/10] md:aspect-auto md:min-h-[17rem]" />
      <div className="flex flex-col p-5 sm:p-7">
        <Meta article={article} label={label} />
        <h2 className="mt-4 font-editorial text-[1.7rem] font-bold leading-[1.1] text-[#131314] lg:text-[1.85rem]">
          <Link href={articleHref(article)} className={cn(titleLink, 'decoration-[3px]')}>{article.title}</Link>
        </h2>
        {article.excerpt && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-zinc-600">{article.excerpt}</p>}
        <div className="mt-auto pt-5"><ReadStory article={article} size="lg" /></div>
      </div>
    </article>
  )
}

export function SideStory({ article, label }: { article: Article; label: StoryLabel }) {
  return (
    <article className={cn(card, 'flex flex-col')}>
      <Cover article={article} sizes="(max-width: 1024px) 100vw, 30vw" className="aspect-[16/7]" />
      <div className="flex flex-1 flex-col p-5">
        <Meta article={article} label={label} />
        <h2 className="mt-2.5 font-editorial text-[1.35rem] font-bold leading-[1.12] text-[#131314]">
          <Link href={articleHref(article)} className={cn(titleLink, 'decoration-2')}>{article.title}</Link>
        </h2>
        {article.excerpt && <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-zinc-600">{article.excerpt}</p>}
        <div className="mt-auto pt-3"><ReadStory article={article} /></div>
      </div>
    </article>
  )
}

export function StoryCard({ article, label }: { article: Article; label: StoryLabel }) {
  return (
    <article className={cn(card, 'flex flex-col')}>
      <Cover article={article} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-5">
        <Meta article={article} label={label} small />
        <h3 className="mt-2.5 font-editorial text-[1.2rem] font-bold leading-[1.15] text-[#131314]">
          <Link href={articleHref(article)} className={cn(titleLink, 'decoration-2')}>{article.title}</Link>
        </h3>
        {article.excerpt && <p className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-zinc-600">{article.excerpt}</p>}
        <div className="mt-auto pt-4"><ReadStory article={article} /></div>
      </div>
    </article>
  )
}

/** Soft layered ridgeline behind a page header, fading into the page. */
export function Mountains() {
  return (
    <svg
      viewBox="0 0 800 260"
      preserveAspectRatio="xMaxYMin slice"
      className="pointer-events-none absolute right-0 top-0 hidden h-[17rem] w-[55%] text-[#5f7a52] md:block"
      aria-hidden
    >
      <defs>
        <linearGradient id="ridge-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f7f7f1" stopOpacity="1" />
          <stop offset="0.45" stopColor="#f7f7f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ridge-fade-down" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.55" stopColor="#f7f7f1" stopOpacity="0" />
          <stop offset="1" stopColor="#f7f7f1" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d="M0 200 L120 140 L210 170 L330 70 L430 130 L520 60 L620 120 L700 40 L800 90 L800 260 L0 260Z" fill="currentColor" opacity="0.18" />
      <path d="M0 230 L150 175 L260 205 L380 120 L470 170 L590 105 L690 160 L800 120 L800 260 L0 260Z" fill="currentColor" opacity="0.22" />
      <path d="M100 260 L230 210 L340 235 L470 175 L580 215 L700 180 L800 200 L800 260Z" fill="currentColor" opacity="0.18" />
      <rect width="800" height="260" fill="url(#ridge-fade)" />
      <rect width="800" height="260" fill="url(#ridge-fade-down)" />
    </svg>
  )
}

export function PageIntro({
  eyebrow,
  accent,
  title,
  children,
}: {
  eyebrow: string
  /** Tailwind classes for the eyebrow bar and text, e.g. "bg-[#c2410c]" / "text-[#c2410c]". */
  accent: { bar: string; text: string }
  title: string
  children: React.ReactNode
}) {
  return (
    <header className="max-w-3xl">
      <p className={cn('flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]', accent.text)}>
        <span className={cn('h-3.5 w-1 rounded-full', accent.bar)} aria-hidden />
        {eyebrow}
      </p>
      <h1 className="mt-2 font-editorial text-[2.5rem] font-bold leading-[1.02] text-[#131314] sm:text-[3.4rem]">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:text-[17px]">{children}</p>
    </header>
  )
}

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null
  // 1 … neighbours of the current page … last
  const nums = Array.from(new Set([1, page - 1, page, page + 1, pages]))
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b)
  const btn = 'flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold transition-colors'
  const plain = 'border border-zinc-300 bg-white text-zinc-700 hover:border-[#131314]'
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center gap-1.5">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} aria-label="Previous page" className={cn(btn, plain)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-zinc-400" aria-hidden>…</span>}
          <Link
            href={hrefFor(n)}
            aria-current={n === page ? 'page' : undefined}
            className={cn(btn, n === page ? 'bg-[#befc65] text-[#131314]' : plain)}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={hrefFor(page + 1)} aria-label="Next page" className={cn(btn, plain)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  )
}

/** Pages a list: returns the items for this page plus the clamped page number and page count. */
export function paginate<T>(items: T[], rawPage: string | undefined, perPage: number) {
  const pages = Math.max(1, Math.ceil(items.length / perPage))
  const page = Math.min(pages, Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1))
  return { page, pages, shown: items.slice((page - 1) * perPage, page * perPage) }
}

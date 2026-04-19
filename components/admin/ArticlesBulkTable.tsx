'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Pencil, Trash2, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bulkDeleteArticles } from '@/app/admin/articles/actions'
import { toast } from 'sonner'

interface Article {
  id: string
  title: string
  category: string
  status: string
  featured: boolean
  published_at: string | null
  created_at: string
}

type SortKey = 'title' | 'date'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-foreground" />
    : <ChevronDown className="h-3 w-3 text-foreground" />
}

export function ArticlesBulkTable({ articles }: { articles: Article[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'title' ? 'asc' : 'desc')
    }
  }

  const sorted = [...articles].sort((a, b) => {
    if (sortKey === 'title') {
      const cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    }
    // date
    const aDate = new Date(a.published_at ?? a.created_at).getTime()
    const bDate = new Date(b.published_at ?? b.created_at).getTime()
    return sortDir === 'asc' ? aDate - bDate : bDate - aDate
  })

  const allChecked = sorted.length > 0 && selected.size === sorted.length
  const someChecked = selected.size > 0 && selected.size < sorted.length

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sorted.map((a) => a.id)))
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleBulkDelete() {
    if (!confirm(`Permanently delete ${selected.size} article${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    const ids = Array.from(selected)
    startTransition(async () => {
      try {
        await bulkDeleteArticles(ids)
        setSelected(new Set())
        toast.success(`${ids.length} article${ids.length > 1 ? 's' : ''} deleted`)
      } catch {
        toast.error('Delete failed. Please try again.')
      }
    })
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-destructive/10 border-b border-border/40">
          <span className="text-xs font-medium text-destructive">
            {selected.size} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            Delete {selected.size}
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked }}
                  onChange={toggleAll}
                  className="rounded border-border cursor-pointer accent-primary"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <button
                  onClick={() => toggleSort('title')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Title <SortIcon col="title" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                <button
                  onClick={() => toggleSort('date')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Date <SortIcon col="date" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sorted.map((article) => (
              <tr
                key={article.id}
                className={`hover:bg-muted/20 transition-colors ${selected.has(article.id) ? 'bg-muted/30' : ''}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(article.id)}
                    onChange={() => toggle(article.id)}
                    className="rounded border-border cursor-pointer accent-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium line-clamp-1">{article.title}</p>
                    {article.featured && (
                      <span className="text-[10px] text-primary">★ Featured</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="capitalize text-muted-foreground">
                    {article.category.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {article.published_at
                    ? format(new Date(article.published_at), 'MMM d, yyyy')
                    : format(new Date(article.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    article.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : article.status === 'scheduled'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No articles yet.{' '}
                  <Link href="/admin/articles/new" className="text-primary hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

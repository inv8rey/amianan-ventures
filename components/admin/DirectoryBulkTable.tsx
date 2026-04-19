'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bulkDeleteDirectory } from '@/app/admin/directory/actions'
import { toast } from 'sonner'

const TYPE_LABELS: Record<string, string> = {
  startup: 'Startup',
  incubator: 'Incubator / TBI',
  government: 'Government',
  university: 'University / HEI',
  community: 'Community',
}

interface DirectoryRow {
  id: string
  name: string
  type: string
  sector: string | null
  city: string | null
  status: string
  featured: boolean
}

type SortKey = 'name' | 'type'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-foreground" />
    : <ChevronDown className="h-3 w-3 text-foreground" />
}

export function DirectoryBulkTable({ entries }: { entries: DirectoryRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...entries].sort((a, b) => {
    if (sortKey === 'type') {
      const cmp = a.type.localeCompare(b.type)
      return sortDir === 'asc' ? cmp : -cmp
    }
    // name (default)
    const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const allChecked = sorted.length > 0 && selected.size === sorted.length
  const someChecked = selected.size > 0 && selected.size < sorted.length

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sorted.map((e) => e.id)))
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
    if (!confirm(`Permanently delete ${selected.size} listing${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    const ids = Array.from(selected)
    startTransition(async () => {
      try {
        await bulkDeleteDirectory(ids)
        setSelected(new Set())
        toast.success(`${ids.length} listing${ids.length > 1 ? 's' : ''} deleted`)
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
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                <button
                  onClick={() => toggleSort('type')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Type <SortIcon col="type" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Sector</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">City</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sorted.map((entry) => (
              <tr
                key={entry.id}
                className={`hover:bg-muted/20 transition-colors ${selected.has(entry.id) ? 'bg-muted/30' : ''}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(entry.id)}
                    onChange={() => toggle(entry.id)}
                    className="rounded border-border cursor-pointer accent-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium line-clamp-1">{entry.name}</p>
                  {entry.featured && (
                    <span className="text-[10px] text-primary">★ Featured</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {entry.sector ?? '—'}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {entry.city ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    entry.status === 'published'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/directory/${entry.id}`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No listings yet.{' '}
                  <Link href="/admin/directory/new" className="text-primary hover:underline">
                    Add the first one
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

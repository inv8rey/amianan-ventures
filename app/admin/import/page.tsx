'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import {
  Upload, FileText, CheckCircle2, XCircle, AlertCircle,
  Loader2, RotateCcw, Newspaper, Building2,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  importArticles, importDirectory,
  type ImportRow, type ImportResult,
  type DirectoryImportRow, type DirectoryImportResult,
} from './actions'
import type { DirectoryType } from '@/types'

// ─── CSV column indices ────────────────────────────────────────
const COL = {
  SLUG: 0,
  TITLE: 1,
  EXCERPT: 5,
  CONTENT: 6,
  COVER_IMAGE: 7,
  LOGO: 9,
  ARTICLE_TYPE: 11,
  DATE: 12,
  WEBSITE: 13,
  LOCATION: 14,
  SECTOR: 15,
  STARTUP_NAME: 17,
  FEATURED: 19,
  DISCOVER_CATEGORY: 20,
}

// ─── Mappers ───────────────────────────────────────────────────
function mapArticleCategory(raw: string): 'news' | 'founder-stories' {
  const lower = (raw ?? '').toLowerCase().trim()
  if (lower.includes('founder')) return 'founder-stories'
  return 'news'
}

function mapDirectoryType(raw: string): DirectoryType {
  const lower = (raw ?? '').toLowerCase().trim()
  if (lower.includes('incubator') || lower.includes('tbi')) return 'incubator'
  if (lower.includes('lgu') || lower.includes('government')) return 'government'
  if (lower.includes('university') || lower.includes('hei') || lower.includes('college')) return 'university'
  if (lower.includes('community')) return 'community'
  return 'startup'
}

function isNAorEmpty(val: string) {
  const t = val.trim().toLowerCase()
  return t === '' || t === 'n/a' || t === 'na'
}

function parseRows(raw: string[][]): {
  articles: ImportRow[]
  directory: DirectoryImportRow[]
} {
  const articles: ImportRow[] = []
  const directory: DirectoryImportRow[] = []

  for (const row of raw) {
    const startupName = (row[COL.STARTUP_NAME] ?? '').trim()
    const isDirectory = startupName !== '' && !isNAorEmpty(startupName)

    if (isDirectory) {
      // Directory entry
      const sector = row[COL.SECTOR] ?? ''
      const city = row[COL.LOCATION] ?? ''
      const logo = row[COL.LOGO] ?? ''
      const website = row[COL.WEBSITE] ?? ''
      const discoverCat = row[COL.DISCOVER_CATEGORY] ?? ''

      directory.push({
        name: startupName,
        type: mapDirectoryType(discoverCat),
        sector: isNAorEmpty(sector) ? null : sector.trim(),
        city: isNAorEmpty(city) ? null : city.trim(),
        logo_url: logo.trim() || null,
        website: isNAorEmpty(website) ? null : website.trim(),
      })
    } else {
      // Article entry
      const slug = (row[COL.SLUG] ?? '').trim()
      const title = (row[COL.TITLE] ?? '').trim()
      if (!slug || !title) continue

      const rawDate = (row[COL.DATE] ?? '').trim()
      let published_at: string | null = null
      if (rawDate && !isNAorEmpty(rawDate)) {
        const d = new Date(rawDate)
        published_at = isNaN(d.getTime()) ? null : d.toISOString()
      }

      const coverRaw = (row[COL.COVER_IMAGE] ?? '').trim()

      articles.push({
        slug,
        title,
        excerpt: (row[COL.EXCERPT] ?? '').trim(),
        content: (row[COL.CONTENT] ?? '').trim(),
        cover_image: coverRaw || null,
        category: mapArticleCategory(row[COL.ARTICLE_TYPE] ?? ''),
        published_at,
        featured: (row[COL.FEATURED] ?? '').trim().toLowerCase() === 'true',
      })
    }
  }

  return { articles, directory }
}

// ─── Types ─────────────────────────────────────────────────────
type Stage = 'idle' | 'preview' | 'importing' | 'done'

interface ParsedData {
  articles: ImportRow[]
  directory: DirectoryImportRow[]
}

interface Results {
  articles: ImportResult
  directory: DirectoryImportResult
}

const DIR_TYPE_LABEL: Record<DirectoryType, string> = {
  startup: 'Startup',
  incubator: 'Incubator / TBI',
  government: 'Government',
  university: 'University / HEI',
  community: 'Community',
}

// ─── Page ──────────────────────────────────────────────────────
export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedData>({ articles: [], directory: [] })
  const [results, setResults] = useState<Results | null>(null)
  const [parseError, setParseError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function reset() {
    setStage('idle')
    setParsed({ articles: [], directory: [] })
    setResults(null)
    setParseError('')
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a .csv file.')
      return
    }
    setFileName(file.name)
    setParseError('')

    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete(result) {
        const [header, ...dataRows] = result.data
        if (!header || !header.includes('Slug')) {
          setParseError('Unexpected CSV format. Expected a "Slug" column in the header.')
          return
        }
        const data = parseRows(dataRows)
        if (data.articles.length === 0 && data.directory.length === 0) {
          setParseError('No valid rows found in this CSV.')
          return
        }
        setParsed(data)
        setStage('preview')
      },
      error(err) {
        setParseError('Failed to parse CSV: ' + err.message)
      },
    })
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  async function handleImport() {
    setStage('importing')
    const [articleResult, dirResult] = await Promise.all([
      parsed.articles.length > 0 ? importArticles(parsed.articles) : Promise.resolve({ imported: 0, skipped: 0, errors: [], skippedSlugs: [] }),
      parsed.directory.length > 0 ? importDirectory(parsed.directory) : Promise.resolve({ imported: 0, skipped: 0, errors: [], skippedNames: [] }),
    ])
    setResults({ articles: articleResult, directory: dirResult })
    setStage('done')
  }

  const { articles, directory } = parsed
  const newsCount = articles.filter((r) => r.category === 'news').length
  const founderCount = articles.filter((r) => r.category === 'founder-stories').length
  const dirByType = directory.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1
    return acc
  }, {} as Record<DirectoryType, number>)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Import from CSV</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload the Framer CMS export. Articles and directory listings are detected automatically.
          </p>
        </div>
        {stage !== 'idle' && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Start over
          </Button>
        )}
      </div>

      {/* ── IDLE: drop zone ── */}
      {stage === 'idle' && (
        <div className="space-y-6">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-14 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50 hover:bg-muted/20'
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Drop your CSV here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Accepts the Framer CMS export format (.csv)</p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />

          {parseError && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" /> {parseError}
            </div>
          )}

          {/* What gets imported */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/40 bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Newspaper className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Articles</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rows without a Startup Name are imported as News or Founder Stories articles.
              </p>
              <div className="mt-3 space-y-1 text-xs font-mono text-muted-foreground">
                {[['Slug', 'slug'], ['Article Name', 'title'], ['Sub-headline', 'excerpt'], ['Article / Description Body', 'content'], ['Featured Image', 'cover_image'], ['Article Type', 'category'], ['Date', 'published_at'], ['Featured Content', 'featured']].map(([k, v]) => (
                  <div key={v} className="flex justify-between gap-2"><span>{k}</span><span className="text-foreground">→ {v}</span></div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/40 bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Directory</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rows with a Startup Name are imported as directory listings (startups, incubators, etc.).
              </p>
              <div className="mt-3 space-y-1 text-xs font-mono text-muted-foreground">
                {[['Startup Name', 'name'], ['Discover Category', 'type'], ['Startup Sector', 'sector'], ['Location', 'city'], ['Logo', 'logo_url'], ['Website', 'website']].map(([k, v]) => (
                  <div key={v} className="flex justify-between gap-2"><span>{k}</span><span className="text-foreground">→ {v}</span></div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground space-y-0.5">
                <p><span className="text-foreground font-medium">Startup</span> → startup</p>
                <p><span className="text-foreground font-medium">Incubator</span> → incubator</p>
                <p><span className="text-foreground font-medium">LGU</span> → government</p>
                <p><span className="text-foreground font-medium">Community</span> → community</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {stage === 'preview' && (
        <div className="space-y-6">
          {/* File info */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border/40 bg-card">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {articles.length} articles · {directory.length} directory listings
              </p>
            </div>
          </div>

          {/* Articles summary */}
          {articles.length > 0 && (
            <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
                <Newspaper className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Articles ({articles.length})</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {newsCount} News · {founderCount} Founder Stories
                  {articles.filter(r => r.featured).length > 0 && ` · ${articles.filter(r => r.featured).length} featured`}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Title</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Category</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">★</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Img</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {articles.slice(0, 6).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-3 py-2 max-w-[200px]">
                          <p className="font-medium truncate">{row.title}</p>
                          <p className="text-muted-foreground font-mono truncate text-[10px]">{row.slug}</p>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground capitalize">
                          {row.category === 'founder-stories' ? 'Founder' : 'News'}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                          {row.published_at ? new Date(row.published_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-3 py-2">{row.featured ? <span className="text-amber-400">★</span> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-3 py-2">{row.cover_image ? <span className="text-emerald-400">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {articles.length > 6 && (
                <div className="px-4 py-2 border-t border-border/40 text-xs text-muted-foreground">
                  + {articles.length - 6} more articles
                </div>
              )}
            </div>
          )}

          {/* Directory summary */}
          {directory.length > 0 && (
            <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
                <Building2 className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Directory Listings ({directory.length})</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {Object.entries(dirByType).map(([type, count]) => `${count} ${DIR_TYPE_LABEL[type as DirectoryType]}`).join(' · ')}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/10">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Sector</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">City</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Logo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {directory.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium">{row.name}</td>
                        <td className="px-3 py-2 text-muted-foreground capitalize">{DIR_TYPE_LABEL[row.type]}</td>
                        <td className="px-3 py-2 text-muted-foreground max-w-[120px] truncate">{row.sector ?? '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.city ?? '—'}</td>
                        <td className="px-3 py-2">{row.logo_url ? <span className="text-emerald-400">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {directory.length > 8 && (
                <div className="px-4 py-2 border-t border-border/40 text-xs text-muted-foreground">
                  + {directory.length - 8} more listings
                </div>
              )}
            </div>
          )}

          {articles.filter(r => r.featured).length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              {articles.filter(r => r.featured).length} article{articles.filter(r => r.featured).length > 1 ? 's' : ''} will be marked as featured (homepage hero)
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleImport} className="flex-1 sm:flex-none sm:min-w-56">
              Import {articles.length + directory.length} rows
            </Button>
            <Button variant="outline" onClick={reset}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── IMPORTING ── */}
      {stage === 'importing' && (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div>
            <p className="text-sm font-semibold">Importing {articles.length} articles and {directory.length} listings…</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {stage === 'done' && results && (
        <div className="space-y-6">
          {/* Overall status */}
          {(() => {
            const totalErrors = results.articles.errors.length + results.directory.errors.length
            const totalImported = results.articles.imported + results.directory.imported
            return (
              <div className={`rounded-xl p-5 ${totalErrors > 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                <div className="flex items-start gap-3">
                  {totalErrors > 0
                    ? <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                    : <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold text-sm">
                      {totalErrors > 0 ? 'Import completed with errors' : 'Import successful'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {totalImported} rows imported · {results.articles.skipped + results.directory.skipped} skipped (duplicates)
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Articles result */}
          <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
              <Newspaper className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Articles</h3>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border/40 p-0">
              {[
                { label: 'Imported', value: results.articles.imported, color: 'text-emerald-400' },
                { label: 'Skipped', value: results.articles.skipped, color: 'text-amber-400' },
                { label: 'Errors', value: results.articles.errors.length, color: 'text-destructive' },
              ].map((s) => (
                <div key={s.label} className="p-4 text-center">
                  <p className={`text-2xl font-bold ${s.value > 0 ? s.color : ''}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {results.articles.errors.map((e, i) => (
              <p key={i} className="px-4 pb-3 text-xs text-destructive">{e}</p>
            ))}
          </div>

          {/* Directory result */}
          <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
              <Building2 className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold">Directory Listings</h3>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border/40">
              {[
                { label: 'Imported', value: results.directory.imported, color: 'text-emerald-400' },
                { label: 'Skipped', value: results.directory.skipped, color: 'text-amber-400' },
                { label: 'Errors', value: results.directory.errors.length, color: 'text-destructive' },
              ].map((s) => (
                <div key={s.label} className="p-4 text-center">
                  <p className={`text-2xl font-bold ${s.value > 0 ? s.color : ''}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {results.directory.skippedNames.length > 0 && (
              <div className="px-4 pb-3 border-t border-border/40 pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Skipped (already exist):</p>
                <p className="text-xs text-muted-foreground">{results.directory.skippedNames.join(', ')}</p>
              </div>
            )}
            {results.directory.errors.map((e, i) => (
              <p key={i} className="px-4 pb-3 text-xs text-destructive">{e}</p>
            ))}
          </div>

          {/* Skipped article slugs */}
          {results.articles.skippedSlugs.length > 0 && (
            <div className="rounded-lg border border-border/40 bg-card p-4">
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                Skipped article slugs
              </h3>
              <div className="max-h-28 overflow-y-auto space-y-0.5">
                {results.articles.skippedSlugs.map((slug) => (
                  <p key={slug} className="text-xs font-mono text-muted-foreground">{slug}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={reset}>Import another CSV</Button>
            <a href="/admin/articles" className={cn(buttonVariants({ variant: 'outline' }))}>
              View articles
            </a>
            <a href="/admin/directory" className={cn(buttonVariants({ variant: 'outline' }))}>
              View directory
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

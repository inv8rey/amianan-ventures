'use client'

import { useState } from 'react'
import { Link2, Copy, Check, Loader2 } from 'lucide-react'

interface ContributionLinksCardProps {
  submissionId: string
  publishedUrl: string | null
  isPublished: boolean
}

export function ContributionLinksCard({
  submissionId,
  publishedUrl: initialPublishedUrl,
  isPublished,
}: ContributionLinksCardProps) {
  const [copied, setCopied]       = useState<'preview' | 'live' | null>(null)
  const [liveUrl, setLiveUrl]     = useState(initialPublishedUrl ?? '')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [saveError, setSaveError] = useState('')

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amiananventures.org'
  const previewUrl = `${siteUrl}/preview/${submissionId}`

  function copy(url: string, type: 'preview' | 'live') {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function saveLiveUrl() {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const res = await fetch('/api/contributor/save-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, publishedUrl: liveUrl.trim() || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const urlIsDirty = liveUrl.trim() !== (initialPublishedUrl ?? '')

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-1.5">
        <Link2 className="h-3.5 w-3.5 text-muted-foreground" /> Links
      </h3>

      {/* Preview — always available */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Preview (shareable)
        </p>
        <div className="flex items-center gap-1.5">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-[11px] text-primary hover:underline font-mono"
          >
            {previewUrl}
          </a>
          <button
            type="button"
            onClick={() => copy(previewUrl, 'preview')}
            title="Copy preview link"
            className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          >
            {copied === 'preview'
              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
              : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Works for draft, scheduled &amp; published — safe to share for review.
        </p>
      </div>

      {/* Live URL — editable */}
      <div className="space-y-1.5 pt-1 border-t border-border/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Live URL
        </p>

        <div className="flex items-center gap-1.5">
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => { setLiveUrl(e.target.value); setSaved(false); setSaveError('') }}
            placeholder="https://amiananventures.org/news/…"
            className="flex-1 min-w-0 text-[11px] font-mono bg-muted/40 border border-border/40 rounded px-2 py-1.5 focus:outline-none focus:border-border focus:bg-background transition-colors placeholder:text-muted-foreground/40"
          />
          {liveUrl.trim() && (
            <button
              type="button"
              onClick={() => copy(liveUrl.trim(), 'live')}
              title="Copy live link"
              className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
            >
              {copied === 'live'
                ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          )}
        </div>

        {/* Save button — shown when URL has changed */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveLiveUrl}
            disabled={saving || (!urlIsDirty && !liveUrl.trim())}
            className="text-[10px] font-bold px-2.5 py-1 rounded bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            {saving && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            {saving ? 'Saving…' : 'Save URL'}
          </button>
          {saved && (
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          {saveError && (
            <span className="text-[10px] text-destructive">{saveError}</span>
          )}
        </div>

        {!liveUrl.trim() && !isPublished && (
          <p className="text-[10px] text-amber-500">Not live yet — publish first.</p>
        )}
        {!liveUrl.trim() && isPublished && (
          <p className="text-[10px] text-amber-500">Published — paste the live URL above.</p>
        )}
      </div>
    </div>
  )
}

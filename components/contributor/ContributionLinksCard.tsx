'use client'

import { useState } from 'react'
import { Link2, Copy, Check } from 'lucide-react'

interface ContributionLinksCardProps {
  submissionId: string
  publishedUrl: string | null
  isPublished: boolean
}

export function ContributionLinksCard({
  submissionId,
  publishedUrl,
  isPublished,
}: ContributionLinksCardProps) {
  const [copied, setCopied] = useState<'preview' | 'live' | null>(null)

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amiananventures.org'
  const previewUrl = `${siteUrl}/preview/${submissionId}`
  const liveUrl    = publishedUrl ?? null

  function copy(url: string, type: 'preview' | 'live') {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

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

      {/* Live URL */}
      <div className="space-y-1 pt-1 border-t border-border/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Live URL
        </p>
        {liveUrl ? (
          <>
            <div className="flex items-center gap-1.5">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 truncate text-[11px] font-mono ${
                  isPublished ? 'text-primary hover:underline' : 'text-muted-foreground'
                }`}
              >
                {liveUrl}
              </a>
              <button
                type="button"
                onClick={() => copy(liveUrl, 'live')}
                title="Copy live link"
                className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
              >
                {copied === 'live'
                  ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                  : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </div>
            {!isPublished && (
              <p className="text-[10px] text-amber-500">Not live yet — publish first.</p>
            )}
          </>
        ) : (
          <p className="text-[10px] text-amber-500">Not live yet — publish first.</p>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, ExternalLink } from 'lucide-react'
import { saveReport, deleteReport, type ReportInput } from './actions'

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function ReportForm({ initial }: { initial: Partial<ReportInput> & { id?: string } }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle]           = useState(initial.title ?? '')
  const [slug, setSlug]             = useState(initial.slug ?? '')
  const [description, setDesc]      = useState(initial.description ?? '')
  const [coverUrl, setCoverUrl]     = useState(initial.cover_image_url ?? '')
  const [fileUrl, setFileUrl]       = useState(initial.file_url ?? '')
  const [published, setPublished]   = useState(initial.is_published ?? false)
  const [saveMsg, setSaveMsg]       = useState<{ ok: boolean; text: string } | null>(null)

  const isNew = !initial.id

  function handleTitleChange(v: string) {
    setTitle(v)
    if (isNew) setSlug(slugify(v))
  }

  function handleSave() {
    if (!title.trim() || !slug.trim() || !fileUrl.trim()) {
      setSaveMsg({ ok: false, text: 'Title, slug, and file URL are required.' })
      return
    }
    startTransition(async () => {
      const result = await saveReport({
        id: initial.id,
        title, slug, description,
        cover_image_url: coverUrl,
        file_url: fileUrl,
        is_published: published,
        published_at: initial.published_at ?? null,
      })
      if (result.ok) {
        setSaveMsg({ ok: true, text: 'Saved!' })
        if (isNew) router.push('/admin/ecosystem-pulse')
      } else {
        setSaveMsg({ ok: false, text: result.error ?? 'Failed to save.' })
      }
    })
  }

  function handleDelete() {
    if (!initial.id) return
    if (!confirm('Delete this report? All download leads will also be removed.')) return
    startTransition(async () => {
      const result = await deleteReport(initial.id!)
      if (result.ok) router.push('/admin/ecosystem-pulse')
      else setSaveMsg({ ok: false, text: result.error ?? 'Failed to delete.' })
    })
  }

  return (
    <div className="space-y-6">
      {saveMsg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg ${saveMsg.ok ? 'bg-[#00a855]/10 text-[#00a855]' : 'bg-red-50 text-red-600'}`}>
          {saveMsg.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
          {saveMsg.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">Title *</label>
        <input
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="State of the Baguio Startup Ecosystem 2026"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">Slug * <span className="text-zinc-400 font-normal">(used in URL)</span></label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0">/ecosystem-pulse/</span>
          <input
            className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="baguio-startup-ecosystem-2026"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">Description</label>
        <textarea
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="A comprehensive look at the startup landscape in Baguio and the Cordillera region…"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">Cover image URL <span className="text-zinc-400 font-normal">(optional)</span></label>
        <input
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://…/cover.jpg"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">
          File URL * <span className="text-zinc-400 font-normal">(Google Drive, Notion, Dropbox…)</span>
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://drive.google.com/file/…"
          />
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-3 py-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <p className="text-[11px] text-zinc-400 mt-1">This is the link users will receive via email. Make sure it's publicly accessible.</p>
      </div>

      {/* Publish toggle */}
      <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-white">
        <div>
          <p className="text-sm font-bold text-zinc-900">Published</p>
          <p className="text-xs text-zinc-500 mt-0.5">Show this report on the site and allow downloads.</p>
        </div>
        <button
          type="button"
          onClick={() => setPublished((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${published ? 'bg-[#00a855]' : 'bg-zinc-200'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${published ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isNew ? 'Create Report' : 'Save Changes'}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
          >
            Delete Report
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { Check, X, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { saveAnnouncement, type AnnouncementInput } from './actions'

type BgColor = AnnouncementInput['bg_color']

const COLOR_OPTIONS: { value: BgColor; label: string; preview: string }[] = [
  { value: 'green',  label: 'Green',  preview: 'bg-[#00cc6a] text-black' },
  { value: 'dark',   label: 'Dark',   preview: 'bg-[#042212] text-white' },
  { value: 'amber',  label: 'Amber',  preview: 'bg-amber-400 text-black' },
  { value: 'black',  label: 'Black',  preview: 'bg-black text-white' },
  { value: 'white',  label: 'White',  preview: 'bg-white text-zinc-900 border border-zinc-200' },
]

export function AnnouncementForm({ initial }: { initial: AnnouncementInput }) {
  const [enabled, setEnabled]     = useState(initial.enabled)
  const [message, setMessage]     = useState(initial.message)
  const [linkText, setLinkText]   = useState(initial.link_text)
  const [linkUrl, setLinkUrl]     = useState(initial.link_url)
  const [bgColor, setBgColor]     = useState<BgColor>(initial.bg_color)
  const [saveMsg, setSaveMsg]      = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const colorStyle = COLOR_OPTIONS.find((c) => c.value === bgColor)?.preview ?? ''
  const textMuted = bgColor === 'green' || bgColor === 'amber' || bgColor === 'white'
    ? 'text-black/50'
    : 'text-white/50'

  function handleSave() {
    startTransition(async () => {
      const result = await saveAnnouncement({
        enabled,
        message,
        link_text: linkText,
        link_url: linkUrl,
        bg_color: bgColor,
      })
      setSaveMsg(result.ok
        ? { ok: true, text: 'Saved! Changes are live.' }
        : { ok: false, text: result.error ?? 'Failed to save.' })
    })
  }

  return (
    <div className="space-y-6">
      {/* Status message */}
      {saveMsg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg ${saveMsg.ok ? 'bg-[#00a855]/10 text-[#00a855]' : 'bg-red-50 text-red-600'}`}>
          {saveMsg.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
          {saveMsg.text}
        </div>
      )}

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-white">
        <div>
          <p className="text-sm font-bold text-zinc-900">Show announcement bar</p>
          <p className="text-xs text-zinc-500 mt-0.5">Displays a thin banner above the site header for all visitors.</p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${enabled ? 'bg-[#00a855]' : 'bg-zinc-200'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Live preview */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Preview</p>
        <div className={`relative w-full rounded-lg overflow-hidden ${colorStyle} ${!enabled ? 'opacity-40' : ''}`}>
          <div className="flex items-center justify-center gap-3 px-10 py-2.5 text-center min-h-[40px]">
            <p className="text-xs sm:text-sm font-semibold leading-snug">
              {message || <span className="italic opacity-50">Your message will appear here…</span>}
            </p>
            {linkText && linkUrl && (
              <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold underline ${textMuted}`}>
                {linkText} <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
            <X className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">Message *</label>
        <input
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Applications for Launchpad Batch 3 are now open!"
          maxLength={200}
        />
        <p className="text-[11px] text-zinc-400 mt-1">{message.length}/200</p>
      </div>

      {/* CTA link */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">CTA label (optional)</label>
          <input
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Apply Now"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">CTA URL (optional)</label>
          <input
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/contribute or https://…"
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-2">Background color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setBgColor(c.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                bgColor === c.value ? 'border-black' : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <span className={`w-4 h-4 rounded-full ${c.preview.split(' ')[0]}`} />
              {c.label}
              {bgColor === c.value && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

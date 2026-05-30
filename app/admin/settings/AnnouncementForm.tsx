'use client'

import { useState, useTransition } from 'react'
import { Check, X, Plus, Trash2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { saveAnnouncement, type Announcement, type AnnouncementBarInput, type BgColor } from './actions'

const COLOR_OPTIONS: { value: BgColor; label: string; dot: string }[] = [
  { value: 'green',  label: 'Green',  dot: 'bg-[#00cc6a]' },
  { value: 'dark',   label: 'Dark',   dot: 'bg-[#042212]' },
  { value: 'amber',  label: 'Amber',  dot: 'bg-amber-400' },
  { value: 'black',  label: 'Black',  dot: 'bg-black' },
  { value: 'white',  label: 'White',  dot: 'bg-white border border-zinc-300' },
]

const COLOR_BAR: Record<BgColor, string> = {
  green:  'bg-[#00cc6a] text-black',
  dark:   'bg-[#042212] text-white',
  amber:  'bg-amber-400 text-black',
  black:  'bg-black text-white',
  white:  'bg-white text-zinc-900 border border-zinc-200',
}

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    message:   'Need a web or mobile app built? Inv8 Studio partners with startups and businesses to design and ship digital products.',
    link_text: 'Visit Inv8 Studio',
    link_url:  'https://inv8.io/',
    bg_color:  'black',
  },
  {
    message:   'Founders, researchers, and builders — share your perspective with Northern Luzon\'s innovation community.',
    link_text: 'Start Contributing',
    link_url:  '/contribute',
    bg_color:  'green',
  },
  {
    message:   'Is your startup, TBI, or program in Northern Luzon? Get listed in the Amianan Ventures ecosystem directory.',
    link_text: 'Join the Ecosystem',
    link_url:  '/ecosystem',
    bg_color:  'dark',
  },
]

const EMPTY_ANNOUNCEMENT: Announcement = {
  message: '', link_text: '', link_url: '', bg_color: 'green',
}

function isDark(bg: BgColor) { return bg === 'dark' || bg === 'black' }

function MiniPreview({ ann }: { ann: Announcement }) {
  const barClass = COLOR_BAR[ann.bg_color] ?? COLOR_BAR.green
  const muted = isDark(ann.bg_color) ? 'text-white/60' : 'text-black/60'
  return (
    <div className={`relative w-full rounded-md overflow-hidden ${barClass} px-8`}>
      <div className="flex items-center justify-center gap-2 py-2 text-center">
        <p className="text-[11px] font-semibold leading-snug truncate">
          {ann.message || <span className="italic opacity-50">No message yet…</span>}
        </p>
        {ann.link_text && (
          <span className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold underline ${muted}`}>
            {ann.link_text} <ArrowRight className="h-2.5 w-2.5" />
          </span>
        )}
      </div>
      <span className={`absolute right-2 top-1/2 -translate-y-1/2 ${muted}`}><X className="h-3 w-3" /></span>
    </div>
  )
}

function AnnouncementCard({
  ann,
  index,
  total,
  onChange,
  onRemove,
}: {
  ann: Announcement
  index: number
  total: number
  onChange: (a: Announcement) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(index === 0 && !ann.message)

  function set<K extends keyof Announcement>(k: K, v: Announcement[K]) {
    onChange({ ...ann, [k]: v })
  }

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="w-5 h-5 shrink-0 rounded-full bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-700 truncate">
            {ann.message || <span className="text-zinc-400 italic">Empty announcement</span>}
          </p>
        </div>
        <span className={`w-3 h-3 rounded-full shrink-0 ${COLOR_OPTIONS.find((c) => c.value === ann.bg_color)?.dot ?? ''}`} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-1 text-zinc-300 hover:text-red-500 transition-colors rounded"
          aria-label="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        {open ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
      </div>

      {/* Card body */}
      {open && (
        <div className="border-t border-zinc-100 p-4 space-y-4">
          {/* Preview */}
          <MiniPreview ann={ann} />

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">Message *</label>
            <input
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={ann.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="e.g. Applications for Launchpad Batch 3 are now open!"
              maxLength={200}
            />
            <p className="text-[11px] text-zinc-400 mt-1">{ann.message.length}/200</p>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">CTA label</label>
              <input
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={ann.link_text}
                onChange={(e) => set('link_text', e.target.value)}
                placeholder="Apply Now"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">CTA URL</label>
              <input
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={ann.link_url}
                onChange={(e) => set('link_url', e.target.value)}
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
                  onClick={() => set('bg_color', c.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                    ann.bg_color === c.value ? 'border-black' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.dot}`} />
                  {c.label}
                  {ann.bg_color === c.value && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AnnouncementForm({ initial }: { initial: AnnouncementBarInput }) {
  const [enabled, setEnabled] = useState(initial.enabled)
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initial.announcements.length > 0 ? initial.announcements : SEED_ANNOUNCEMENTS,
  )
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateAt(i: number, ann: Announcement) {
    setAnnouncements((prev) => prev.map((a, idx) => idx === i ? ann : a))
  }

  function removeAt(i: number) {
    setAnnouncements((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addNew() {
    if (announcements.length >= 5) return
    setAnnouncements((prev) => [...prev, { ...EMPTY_ANNOUNCEMENT }])
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveAnnouncement({ enabled, announcements })
      setSaveMsg(result.ok
        ? { ok: true, text: 'Saved! Changes are live.' }
        : { ok: false, text: result.error ?? 'Failed to save.' })
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

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-white">
        <div>
          <p className="text-sm font-bold text-zinc-900">Show announcement bar</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Displays a rotating banner above the site header. Rotates every 7 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${enabled ? 'bg-[#00a855]' : 'bg-zinc-200'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Announcement cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Announcements ({announcements.length}/5)
          </p>
          <button
            type="button"
            onClick={addNew}
            disabled={announcements.length >= 5}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:text-[#008a44] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {announcements.length === 0 ? (
          <p className="text-sm text-zinc-400 py-2">No announcements yet — click Add to create one.</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((ann, i) => (
              <AnnouncementCard
                key={i}
                ann={ann}
                index={i}
                total={announcements.length}
                onChange={(a) => updateAt(i, a)}
                onRemove={() => removeAt(i)}
              />
            ))}
          </div>
        )}
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

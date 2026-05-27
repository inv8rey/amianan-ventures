'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Hash, Percent, GripVertical, Check, X } from 'lucide-react'
import { saveObjective, saveKeyResult, deleteKeyResult, deleteObjective } from '../actions'

type TargetType = 'number' | 'percentage'

type KeyResult = {
  id: string
  title: string
  target_type: TargetType
  target_value: number
  current_value: number
  unit: string | null
  sort_order: number | null
}

type Objective = {
  id: string
  title: string
  description: string | null
  quarter: string | null
  status: string
  key_results: KeyResult[]
}

function TargetTypeToggle({
  value,
  onChange,
}: {
  value: TargetType
  onChange: (v: TargetType) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 overflow-hidden text-xs font-semibold">
      <button
        type="button"
        onClick={() => onChange('number')}
        className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
          value === 'number'
            ? 'bg-black text-white'
            : 'bg-white text-zinc-500 hover:bg-zinc-50'
        }`}
      >
        <Hash className="h-3 w-3" />
        Number
      </button>
      <button
        type="button"
        onClick={() => onChange('percentage')}
        className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-zinc-200 ${
          value === 'percentage'
            ? 'bg-black text-white'
            : 'bg-white text-zinc-500 hover:bg-zinc-50'
        }`}
      >
        <Percent className="h-3 w-3" />
        Percentage
      </button>
    </div>
  )
}

type KRFormState = {
  id: string | null
  title: string
  target_type: TargetType
  target_value: string
  current_value: string
  unit: string
}

const EMPTY_KR: KRFormState = {
  id: null,
  title: '',
  target_type: 'number',
  target_value: '',
  current_value: '0',
  unit: '',
}

export function ObjectiveEditor({ objective }: { objective: Objective | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Objective fields
  const [title, setTitle] = useState(objective?.title ?? '')
  const [description, setDescription] = useState(objective?.description ?? '')
  const [quarter, setQuarter] = useState(objective?.quarter ?? '')
  const [status, setStatus] = useState<string>(objective?.status ?? 'active')

  // Key results list
  const [keyResults, setKeyResults] = useState<KeyResult[]>(objective?.key_results ?? [])

  // Currently-editing KR form (null = not editing)
  const [editingKR, setEditingKR] = useState<KRFormState | null>(null)
  const [editingKRId, setEditingKRId] = useState<string | 'new' | null>(null)

  // Messages
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const objectiveId = objective?.id ?? null

  // ── Save Objective ──────────────────────────────────────────────────────────
  function handleSaveObjective() {
    if (!title.trim()) { setSaveMsg({ ok: false, text: 'Title is required.' }); return }
    startTransition(async () => {
      const result = await saveObjective({
        id: objectiveId,
        title: title.trim(),
        description: description.trim() || null,
        quarter: quarter.trim() || null,
        status,
      })
      if (result.ok) {
        setSaveMsg({ ok: true, text: 'Saved!' })
        if (!objectiveId && result.id) {
          router.replace(`/admin/goals/${result.id}`)
        }
      } else {
        setSaveMsg({ ok: false, text: result.error ?? 'Failed to save.' })
      }
    })
  }

  // ── Delete Objective ────────────────────────────────────────────────────────
  function handleDeleteObjective() {
    if (!objectiveId) return
    if (!confirm('Delete this objective and all its key results? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteObjective(objectiveId)
      if (result.ok) {
        router.push('/admin/goals')
      } else {
        setSaveMsg({ ok: false, text: result.error ?? 'Failed to delete.' })
      }
    })
  }

  // ── Open KR editor ─────────────────────────────────────────────────────────
  function openNewKR() {
    setEditingKR({ ...EMPTY_KR })
    setEditingKRId('new')
  }

  function openEditKR(kr: KeyResult) {
    setEditingKR({
      id: kr.id,
      title: kr.title,
      target_type: kr.target_type,
      target_value: String(kr.target_value),
      current_value: String(kr.current_value),
      unit: kr.unit ?? '',
    })
    setEditingKRId(kr.id)
  }

  function cancelKR() {
    setEditingKR(null)
    setEditingKRId(null)
  }

  // ── Save KR ─────────────────────────────────────────────────────────────────
  function handleSaveKR() {
    if (!editingKR || !objectiveId) return
    if (!editingKR.title.trim()) { setSaveMsg({ ok: false, text: 'Key result title is required.' }); return }

    const targetVal = parseFloat(editingKR.target_value)
    const currentVal = parseFloat(editingKR.current_value)
    if (isNaN(targetVal)) { setSaveMsg({ ok: false, text: 'Enter a valid target value.' }); return }
    if (isNaN(currentVal)) { setSaveMsg({ ok: false, text: 'Enter a valid current value.' }); return }

    // Clamp percentage
    const targetFinal = editingKR.target_type === 'percentage'
      ? Math.min(100, Math.max(0, targetVal))
      : targetVal
    const currentFinal = editingKR.target_type === 'percentage'
      ? Math.min(100, Math.max(0, currentVal))
      : currentVal

    startTransition(async () => {
      const result = await saveKeyResult({
        id: editingKR.id,
        objective_id: objectiveId,
        title: editingKR.title.trim(),
        target_type: editingKR.target_type,
        target_value: targetFinal,
        current_value: currentFinal,
        unit: editingKR.target_type === 'percentage' ? null : (editingKR.unit.trim() || null),
        sort_order: editingKRId === 'new' ? keyResults.length : null,
      })

      if (result.ok) {
        if (editingKR.id) {
          setKeyResults((prev) => prev.map((k) => k.id === result.kr.id ? result.kr : k))
        } else {
          setKeyResults((prev) => [...prev, result.kr])
        }
        cancelKR()
        setSaveMsg({ ok: true, text: 'Key result saved.' })
      } else {
        setSaveMsg({ ok: false, text: result.error ?? 'Failed to save key result.' })
      }
    })
  }

  // ── Delete KR ───────────────────────────────────────────────────────────────
  function handleDeleteKR(krId: string) {
    if (!confirm('Delete this key result?')) return
    startTransition(async () => {
      const result = await deleteKeyResult(krId)
      if (result.ok) {
        setKeyResults((prev) => prev.filter((k) => k.id !== krId))
        if (editingKRId === krId) cancelKR()
      } else {
        setSaveMsg({ ok: false, text: result.error ?? 'Failed to delete.' })
      }
    })
  }

  // ── Progress helper ─────────────────────────────────────────────────────────
  function getProgress(kr: KeyResult) {
    if (kr.target_value === 0) return 0
    return Math.min(100, Math.round((kr.current_value / kr.target_value) * 100))
  }

  function formatVal(value: number, type: TargetType, unit: string | null) {
    if (type === 'percentage') return `${value}%`
    return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString()
  }

  return (
    <div className="space-y-8">
      {/* Status message */}
      {saveMsg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg ${saveMsg.ok ? 'bg-[#00a855]/10 text-[#00a855]' : 'bg-red-50 text-red-600'}`}>
          {saveMsg.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
          {saveMsg.text}
        </div>
      )}

      {/* ── Objective fields ── */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Objective</h2>

        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">Title *</label>
          <input
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grow Northern Luzon community reach"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">Description</label>
          <textarea
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this objective about?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">Quarter</label>
            <input
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              placeholder="e.g. Q2 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">Status</label>
            <select
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSaveObjective}
            disabled={isPending}
            className="px-5 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving…' : objectiveId ? 'Save Objective' : 'Create Objective'}
          </button>

          {objectiveId && (
            <button
              type="button"
              onClick={handleDeleteObjective}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              Delete Objective
            </button>
          )}
        </div>
      </section>

      {/* ── Key Results ── */}
      {objectiveId && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Key Results</h2>
            {editingKRId !== 'new' && (
              <button
                type="button"
                onClick={openNewKR}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:text-[#008a44] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Key Result
              </button>
            )}
          </div>

          {/* Existing KRs */}
          {keyResults.length > 0 && (
            <div className="space-y-2">
              {keyResults.map((kr) => {
                const pct = getProgress(kr)
                const barColor =
                  pct >= 80 ? 'bg-[#00a855]' :
                  pct >= 50 ? 'bg-amber-400' :
                  'bg-zinc-300'

                if (editingKRId === kr.id && editingKR) {
                  return <KREditForm key={kr.id} kr={editingKR} onChange={setEditingKR} onSave={handleSaveKR} onCancel={cancelKR} isPending={isPending} />
                }

                return (
                  <div
                    key={kr.id}
                    className="group flex items-start gap-3 p-4 border border-zinc-200 rounded-xl bg-white hover:border-zinc-300 transition-colors cursor-pointer"
                    onClick={() => openEditKR(kr)}
                  >
                    <GripVertical className="h-4 w-4 text-zinc-300 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800">{kr.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400 tabular-nums shrink-0">
                          {formatVal(kr.current_value, kr.target_type, kr.unit)}
                          {' / '}
                          {formatVal(kr.target_value, kr.target_type, kr.unit)}
                        </span>
                        <span className={`text-[11px] font-bold tabular-nums ${pct >= 80 ? 'text-[#00a855]' : pct >= 50 ? 'text-amber-500' : 'text-zinc-400'}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteKR(kr.id) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-zinc-300 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* New KR form */}
          {editingKRId === 'new' && editingKR && (
            <KREditForm kr={editingKR} onChange={setEditingKR} onSave={handleSaveKR} onCancel={cancelKR} isPending={isPending} />
          )}

          {keyResults.length === 0 && editingKRId !== 'new' && (
            <p className="text-sm text-zinc-400 py-2">No key results yet. Click "Add Key Result" to get started.</p>
          )}
        </section>
      )}
    </div>
  )
}

// ── KR Edit Form (inline) ──────────────────────────────────────────────────────
function KREditForm({
  kr,
  onChange,
  onSave,
  onCancel,
  isPending,
}: {
  kr: KRFormState
  onChange: (kr: KRFormState) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}) {
  function set<K extends keyof KRFormState>(key: K, val: KRFormState[K]) {
    onChange({ ...kr, [key]: val })
  }

  const isPercentage = kr.target_type === 'percentage'

  return (
    <div className="border-2 border-black rounded-xl p-5 space-y-4 bg-white">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-1">Key Result *</label>
        <input
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={kr.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Publish 20 articles this quarter"
          autoFocus
        />
      </div>

      {/* Target type toggle */}
      <div>
        <label className="block text-xs font-semibold text-zinc-600 mb-2">Target type</label>
        <TargetTypeToggle
          value={kr.target_type}
          onChange={(v) => {
            onChange({ ...kr, target_type: v, unit: '' })
          }}
        />
        <p className="text-[11px] text-zinc-400 mt-1.5">
          {isPercentage
            ? 'Use percentage for rate-based goals (e.g. 80% completion rate).'
            : 'Use number for count-based goals (e.g. 20 articles, 500 subscribers).'}
        </p>
      </div>

      {/* Target & current values */}
      <div className={`grid gap-4 ${isPercentage ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Target {isPercentage ? '(%)' : ''}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={isPercentage ? 100 : undefined}
              step={isPercentage ? 1 : 'any'}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black pr-8"
              value={kr.target_value}
              onChange={(e) => set('target_value', e.target.value)}
              placeholder={isPercentage ? '100' : '0'}
            />
            {isPercentage && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">%</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Current {isPercentage ? '(%)' : ''}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={isPercentage ? 100 : undefined}
              step={isPercentage ? 1 : 'any'}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black pr-8"
              value={kr.current_value}
              onChange={(e) => set('current_value', e.target.value)}
              placeholder="0"
            />
            {isPercentage && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">%</span>
            )}
          </div>
        </div>

        {!isPercentage && (
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">Unit (optional)</label>
            <input
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={kr.unit}
              onChange={(e) => set('unit', e.target.value)}
              placeholder="articles, subscribers…"
            />
          </div>
        )}
      </div>

      {/* Preview */}
      {kr.target_value !== '' && (
        <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-4 py-3">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
              {(() => {
                const t = parseFloat(kr.target_value)
                const c = parseFloat(kr.current_value || '0')
                const p = t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0
                const bar = p >= 80 ? 'bg-[#00a855]' : p >= 50 ? 'bg-amber-400' : 'bg-zinc-400'
                return <div className={`h-full rounded-full ${bar}`} style={{ width: `${p}%` }} />
              })()}
            </div>
            <span className="text-xs font-semibold text-zinc-600 tabular-nums shrink-0">
              {isPercentage
                ? `${kr.current_value || 0}% / ${kr.target_value}%`
                : `${Number(kr.current_value || 0).toLocaleString()}${kr.unit ? ` ${kr.unit}` : ''} / ${Number(kr.target_value || 0).toLocaleString()}${kr.unit ? ` ${kr.unit}` : ''}`
              }
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="px-5 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Key Result'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

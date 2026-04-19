'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { DirectoryEntry, DirectoryType, DirectoryLocation } from '@/types'
import { DIRECTORY_LOCATIONS } from '@/types'

const DIRECTORY_TYPES: { value: DirectoryType; label: string }[] = [
  { value: 'startup', label: 'Startup' },
  { value: 'incubator', label: 'Incubator / TBI' },
  { value: 'government', label: 'Government Agency' },
  { value: 'university', label: 'University / HEI' },
  { value: 'community', label: 'Community' },
]

const SECTOR_OPTIONS = [
  'Agriculture & Food Innovation',
  'Fintech',
  'E-commerce & Marketplaces',
  'Logistics & Supply Chain',
  'Health',
  'Climate & Sustainability',
  'Tourism',
  'Creative Industries & Digital Media',
  'AI, Data & Software',
  'Gaming & Interactive Media',
  'Smart Cities & GovTech',
]

interface FormData {
  name: string
  type: DirectoryType
  sector: string
  city: string
  location: DirectoryLocation | null
  logo_url: string | null
  website: string
  featured: boolean
  status: 'draft' | 'published'
}

interface Props {
  entry?: DirectoryEntry
}

export function DirectoryForm({ entry }: Props) {
  const router = useRouter()
  const isNew = !entry

  const [form, setForm] = useState<FormData>({
    name: entry?.name ?? '',
    type: entry?.type ?? 'startup',
    sector: entry?.sector ?? '',
    city: entry?.city ?? '',
    location: entry?.location ?? null,
    logo_url: entry?.logo_url ?? null,
    website: entry?.website ?? '',
    featured: entry?.featured ?? false,
    status: entry?.status ?? 'draft',
  })

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // Track whether the current sector value is a custom entry (not in SECTOR_OPTIONS)
  const [isCustomSector, setIsCustomSector] = useState(
    () => !!entry?.sector && !SECTOR_OPTIONS.includes(entry.sector)
  )

  const set = (key: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function save(status?: 'draft' | 'published') {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: form.name.trim(),
      type: form.type,
      sector: form.sector.trim() || null,
      city: form.city.trim() || null,
      location: form.location,
      logo_url: form.logo_url,
      website: form.website.trim() || null,
      featured: form.featured,
      status: status ?? form.status,
      updated_at: new Date().toISOString(),
    }

    if (isNew) {
      const { data, error } = await supabase
        .from('directory')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Listing created')
      router.push(`/admin/directory/${data.id}`)
    } else {
      const { error } = await supabase
        .from('directory')
        .update(payload)
        .eq('id', entry.id)

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Listing saved')
      set('status', payload.status)
    }

    setSaving(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!entry || !confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('directory').delete().eq('id', entry.id)

    if (error) {
      toast.error('Delete failed')
      setDeleting(false)
      return
    }
    toast.success('Listing deleted')
    router.push('/admin/directory')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main fields */}
      <div className="lg:col-span-2 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Organization name"
            className="text-base font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={form.type} onValueChange={(v) => set('type', v as DirectoryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTORY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Sector / Industry</Label>
            <Select
              value={isCustomSector ? '__custom__' : (form.sector || '__none__')}
              onValueChange={(v) => {
                if (v === '__custom__') {
                  setIsCustomSector(true)
                  set('sector', '')
                } else if (v === '__none__') {
                  setIsCustomSector(false)
                  set('sector', '')
                } else {
                  setIsCustomSector(false)
                  set('sector', v)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sector…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— None —</SelectItem>
                {SECTOR_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
                <SelectItem value="__custom__">Other (type below)…</SelectItem>
              </SelectContent>
            </Select>
            {isCustomSector && (
              <Input
                value={form.sector}
                onChange={(e) => set('sector', e.target.value)}
                placeholder="Type custom sector / industry"
                autoFocus
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="e.g. Baguio City"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Region</Label>
            <Select
              value={form.location ?? 'none'}
              onValueChange={(v) => set('location', v === 'none' ? null : v as DirectoryLocation)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— No region —</SelectItem>
                {DIRECTORY_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://example.com"
            type="url"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Publish */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Publish</h3>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              size="sm"
              onClick={() => save('draft')}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Save Draft
            </Button>
            <Button
              className="flex-1"
              size="sm"
              onClick={() => save('published')}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
              Publish
            </Button>
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => set('featured', !form.featured)}
              className={`relative w-8 h-4.5 rounded-full transition-colors ${form.featured ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-3.5' : ''}`} />
            </div>
            <span className="text-xs text-muted-foreground">
              Featured on ecosystem page
            </span>
          </label>

          {!isNew && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Status: <span className={entry.status === 'published' ? 'text-emerald-400' : ''}>{entry.status}</span></span>
              {form.website && (
                <a
                  href={form.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Visit site
                </a>
              )}
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Logo</h3>
          <p className="text-xs text-muted-foreground">
            Square logos work best. If no logo is set, the first letter of the name is shown.
          </p>
          <ImageUpload value={form.logo_url} onChange={(url) => set('logo_url', url)} />
        </div>

        {/* Delete */}
        {!isNew && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 mr-1" />
            )}
            Delete Listing
          </Button>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, Loader2, ExternalLink, Upload, FileIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { RESOURCE_CATEGORIES, RESOURCE_FORMATS } from '@/types/resources'
import type { FounderResource, FounderResourceFormData } from '@/types/resources'

interface ResourceFormProps {
  resource?: FounderResource
}

export function ResourceForm({ resource }: ResourceFormProps) {
  const router = useRouter()
  const isNew = !resource

  const [form, setForm] = useState<FounderResourceFormData>({
    title: resource?.title ?? '',
    description: resource?.description ?? '',
    category: resource?.category ?? RESOURCE_CATEGORIES[0],
    format: resource?.format ?? 'PDF',
    editable: resource?.editable ?? false,
    file_url: resource?.file_url ?? null,
    status: resource?.status ?? 'published',
    featured: resource?.featured ?? false,
    sort_order: resource?.sort_order ?? 0,
  })

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = <K extends keyof FounderResourceFormData>(key: K, value: FounderResourceFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function handleFile(file: File) {
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File must be under 25MB')
      return
    }
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `files/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('founder-resources')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('founder-resources').getPublicUrl(path)
    set('file_url', data.publicUrl)
    if (ext) set('format', ext.toUpperCase())
    setUploading(false)
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    const supabase = createClient()

    if (isNew) {
      const { data, error } = await supabase
        .from('founder_resources')
        .insert(form)
        .select('id')
        .single()

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Resource created')
      router.push(`/admin/resources/${data.id}`)
    } else {
      const { error } = await supabase
        .from('founder_resources')
        .update(form)
        .eq('id', resource.id)

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Resource saved')
    }

    setSaving(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!resource || !confirm('Delete this resource? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('founder_resources').delete().eq('id', resource.id)

    if (error) {
      toast.error('Delete failed')
      setDeleting(false)
      return
    }
    toast.success('Resource deleted')
    router.push('/admin/resources')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Lean Canvas"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Map your startup idea on a single page."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => v && set('category', v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESOURCE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Format</Label>
            <Select value={form.format} onValueChange={(v) => v && set('format', v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESOURCE_FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Resource File</Label>
          {form.file_url ? (
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card p-3">
              <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={form.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate flex-1"
              >
                {form.file_url}
              </a>
              <button
                type="button"
                onClick={() => set('file_url', null)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-card p-4 text-sm text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading…' : 'Click to upload a file'}
              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </label>
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.editable}
              onChange={(e) => set('editable', e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Editable file
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Featured
          </label>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Publish</h3>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => v && set('status', v as FounderResourceFormData['status'])}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(e) => set('sort_order', Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>

          <Button className="w-full" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {isNew ? 'Create Resource' : 'Save Changes'}
          </Button>

          {!isNew && form.status === 'published' && (
            <a
              href="/resources"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> View live on Resources page
            </a>
          )}
        </div>

        {!isNew && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
            Delete Resource
          </Button>
        )}
      </div>
    </div>
  )
}

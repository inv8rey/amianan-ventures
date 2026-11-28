'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { fromManilaInputValue, toManilaInputValue } from '@/lib/countdown'
import { OPPORTUNITY_CATEGORY_LABELS } from '@/types/opportunities'
import type { Opportunity, OpportunityCategory } from '@/types/opportunities'

const CATEGORIES = Object.keys(OPPORTUNITY_CATEGORY_LABELS) as OpportunityCategory[]

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80)

interface FormState {
  title: string
  slug: string
  category: OpportunityCategory
  organization: string
  summary: string
  location: string
  deadlineLocal: string // Manila wall-clock "YYYY-MM-DDTHH:mm"
  apply_url: string
  cover_image: string | null
  featured: boolean
  status: 'draft' | 'published'
}

export function OpportunityForm({ opportunity }: { opportunity?: Opportunity }) {
  const router = useRouter()
  const isNew = !opportunity
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState<FormState>({
    title: opportunity?.title ?? '',
    slug: opportunity?.slug ?? '',
    category: opportunity?.category ?? 'funding-grants',
    organization: opportunity?.organization ?? '',
    summary: opportunity?.summary ?? '',
    location: opportunity?.location ?? '',
    deadlineLocal: toManilaInputValue(opportunity?.deadline ?? null),
    apply_url: opportunity?.apply_url ?? '',
    cover_image: opportunity?.cover_image ?? null,
    featured: opportunity?.featured ?? false,
    status: opportunity?.status ?? 'draft',
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function save() {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.organization.trim()) return toast.error('Organizing institution is required')
    const deadline = fromManilaInputValue(form.deadlineLocal)
    if (!deadline) return toast.error('Application deadline is required')
    if (form.apply_url && !/^https?:\/\//i.test(form.apply_url)) return toast.error('Application link must start with https://')

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      category: form.category,
      organization: form.organization.trim(),
      summary: form.summary.trim() || null,
      location: form.location.trim() || null,
      deadline,
      apply_url: form.apply_url.trim() || null,
      cover_image: form.cover_image,
      featured: form.featured,
      status: form.status,
    }

    setSaving(true)
    const supabase = createClient()
    if (isNew) {
      const { data, error } = await supabase.from('opportunities').insert(payload).select('id').single()
      setSaving(false)
      if (error) return toast.error('Save failed: ' + error.message)
      toast.success('Opportunity created')
      router.push(`/rkgd6dg3k0w935/opportunities/${data.id}`)
    } else {
      const { error } = await supabase.from('opportunities').update(payload).eq('id', opportunity.id)
      setSaving(false)
      if (error) return toast.error('Save failed: ' + error.message)
      toast.success('Opportunity saved')
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!opportunity || !confirm('Delete this opportunity? This cannot be undone.')) return
    setDeleting(true)
    const { error } = await createClient().from('opportunities').delete().eq('id', opportunity.id)
    if (error) {
      setDeleting(false)
      return toast.error('Delete failed')
    }
    toast.success('Opportunity deleted')
    router.push('/rkgd6dg3k0w935/opportunities')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => {
              set('title', e.target.value)
              if (!slugTouched) set('slug', slugify(e.target.value))
            }}
            placeholder="Northern Luzon Startup Grant Program"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)) }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => v && set('category', v as OpportunityCategory)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{OPPORTUNITY_CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organization">Organizing institution *</Label>
            <Input id="organization" value={form.organization} onChange={(e) => set('organization', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Application deadline * (Philippine time)</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={form.deadlineLocal}
              onChange={(e) => set('deadlineLocal', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location or coverage</Label>
            <Input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Northern Luzon, Nationwide…" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apply_url">Official application link</Label>
          <Input id="apply_url" type="url" value={form.apply_url} onChange={(e) => set('apply_url', e.target.value)} placeholder="https://" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        </div>

        <ImageUpload value={form.cover_image} onChange={(url) => set('cover_image', url)} label="Image (optional)" />
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Publish</h3>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => v && set('status', v as FormState['status'])}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Feature on the homepage
          </label>
          <p className="text-xs text-muted-foreground">
            The nearest featured opportunity gets the large countdown. Without one, the nearest deadline is featured.
          </p>
          <Button className="w-full" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {isNew ? 'Create Opportunity' : 'Save Changes'}
          </Button>
          {!isNew && form.status === 'published' && (
            <a href="/opportunities" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> View live
            </a>
          )}
        </div>

        {!isNew && (
          <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
            Delete Opportunity
          </Button>
        )}
      </div>
    </div>
  )
}

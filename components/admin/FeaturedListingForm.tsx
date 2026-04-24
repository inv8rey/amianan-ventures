'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { FeaturedListing } from '@/types'

interface FeaturedListingFormProps {
  listing?: FeaturedListing
}

export function FeaturedListingForm({ listing }: FeaturedListingFormProps) {
  const router = useRouter()
  const isNew = !listing

  const [form, setForm] = useState({
    title: listing?.title ?? '',
    tagline: listing?.tagline ?? '',
    description: listing?.description ?? '',
    image_url: listing?.image_url ?? null as string | null,
    cta_url: listing?.cta_url ?? '',
    sponsor_label: listing?.sponsor_label ?? 'Sponsored',
    display_order: listing?.display_order ?? 0,
    status: listing?.status ?? 'draft' as 'draft' | 'published',
  })

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function save(status?: 'draft' | 'published') {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    const supabase = createClient()

    const payload = {
      title: form.title,
      tagline: form.tagline || null,
      description: form.description || null,
      image_url: form.image_url,
      cta_url: form.cta_url || null,
      sponsor_label: form.sponsor_label || 'Sponsored',
      display_order: Number(form.display_order) || 0,
      status: status ?? form.status,
    }

    if (isNew) {
      const { data, error } = await supabase
        .from('featured_listings')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Listing created')
      router.push(`/admin/featured-listings/${data.id}`)
    } else {
      const { error } = await supabase
        .from('featured_listings')
        .update(payload)
        .eq('id', listing.id)

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
    if (!listing || !confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('featured_listings').delete().eq('id', listing.id)

    if (error) {
      toast.error('Delete failed')
      setDeleting(false)
      return
    }
    toast.success('Listing deleted')
    router.push('/admin/featured-listings')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main */}
      <div className="lg:col-span-2 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Organization or campaign name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={form.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="Short descriptor shown on the card"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Longer description for internal reference…"
            rows={3}
          />
        </div>

        <ImageUpload
          value={form.image_url}
          onChange={(url) => set('image_url', url)}
          label="Featured Photo"
        />
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Publish */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Publish</h3>
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" size="sm" onClick={() => save('draft')} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Save Draft
            </Button>
            <Button className="flex-1" size="sm" onClick={() => save('published')} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
              Publish
            </Button>
          </div>
          {!isNew && form.status === 'published' && (
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> View on homepage
            </a>
          )}
        </div>

        {/* Settings */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Settings</h3>

          <div className="space-y-1.5">
            <Label htmlFor="cta_url">Link URL</Label>
            <Input
              id="cta_url"
              value={form.cta_url}
              onChange={(e) => set('cta_url', e.target.value)}
              placeholder="https://…"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sponsor_label">Label</Label>
            <Input
              id="sponsor_label"
              value={form.sponsor_label}
              onChange={(e) => set('sponsor_label', e.target.value)}
              placeholder="Sponsored / Partner / Featured"
              className="h-8 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">Shown as a small badge on the card.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min={0}
              value={form.display_order}
              onChange={(e) => set('display_order', e.target.value)}
              className="h-8 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">Lower number = shown first.</p>
          </div>
        </div>

        {!isNew && (
          <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
            Delete Listing
          </Button>
        )}
      </div>
    </div>
  )
}

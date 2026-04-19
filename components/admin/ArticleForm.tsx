'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Trash2, Loader2, ExternalLink, Clock, CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Article, ArticleFormData } from '@/types'
import { LOCATIONS } from '@/types'

interface ArticleFormProps {
  article?: Article
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const isNew = !article

  const [form, setForm] = useState<ArticleFormData>({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '',
    category: article?.category ?? 'news',
    location: article?.location ?? null,
    author: article?.author ?? 'Amianan Ventures',
    cover_image: article?.cover_image ?? null,
    tags: article?.tags ?? [],
    status: article?.status ?? 'draft',
    featured: article?.featured ?? false,
    published_at: article?.published_at ?? null,
  })

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tagInput, setTagInput] = useState(article?.tags?.join(', ') ?? '')

  const set = (key: keyof ArticleFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  function handleTitleChange(title: string) {
    set('title', title)
    if (isNew) set('slug', slugify(title))
  }

  const handleContent = useCallback((html: string) => set('content', html), [])

  // Is the currently set published_at in the future?
  const isFutureDated = form.published_at
    ? new Date(form.published_at) > new Date()
    : false

  async function save(intent: 'draft' | 'published' | 'scheduled') {
    setSaving(true)
    const supabase = createClient()

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      ...form,
      tags,
      status: intent,
      published_at:
        intent === 'published'
          ? new Date().toISOString()   // stamp now for immediate publish
          : intent === 'scheduled'
            ? form.published_at        // keep the future date the user set
            : form.published_at,       // draft: preserve whatever was there
    }

    if (isNew) {
      const { data, error } = await supabase
        .from('articles')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Article created')
      router.push(`/admin/articles/${data.id}`)
    } else {
      const { error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', article.id)

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success(
        intent === 'scheduled' ? 'Article scheduled' :
        intent === 'published' ? 'Article published' :
        'Draft saved'
      )
      set('status', intent)
      if (intent === 'published') set('published_at', payload.published_at)
    }

    setSaving(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!article || !confirm('Delete this article? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('articles').delete().eq('id', article.id)

    if (error) {
      toast.error('Delete failed')
      setDeleting(false)
      return
    }
    toast.success('Article deleted')
    router.push('/admin/articles')
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
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Article title"
            className="text-base font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="article-slug"
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            placeholder="Short description for article cards and SEO…"
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Content *</Label>
          <RichTextEditor
            value={form.content}
            onChange={handleContent}
            placeholder="Start writing your article…"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Publish controls */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Publish</h3>

          {/* Publish date / schedule picker */}
          <div className="space-y-1.5">
            <Label htmlFor="publish_date" className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
              Publish Date
            </Label>
            <Input
              id="publish_date"
              type="datetime-local"
              className="h-8 text-sm"
              value={form.published_at ? form.published_at.slice(0, 16) : ''}
              onChange={(e) =>
                set('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />
            <p className="text-[10px] text-muted-foreground leading-snug">
              Set a future date and click <span className="font-medium">Schedule</span> to auto-publish at that time.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
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
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Eye className="h-3.5 w-3.5 mr-1" />
                )}
                Publish Now
              </Button>
            </div>

            {/* Schedule button — only shown when a future date is selected */}
            {isFutureDated && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
                onClick={() => save('scheduled')}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Clock className="h-3.5 w-3.5 mr-1" />
                )}
                Schedule
              </Button>
            )}
          </div>

          {/* Status indicators */}
          {!isNew && form.status === 'published' && (
            <a
              href={`/${form.category}/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> View live article
            </a>
          )}
          {!isNew && form.status === 'scheduled' && form.published_at && (
            <p className="text-xs text-amber-500 flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              Scheduled: {format(new Date(form.published_at), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Settings</h3>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => set('category', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="founder-stories">Founder Stories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Region / Location</Label>
            <Select
              value={form.location ?? 'none'}
              onValueChange={(v) => set('location', v === 'none' ? null : v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select region…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— No region —</SelectItem>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="startup, innovation, Baguio"
              className="h-8 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 rounded border border-border accent-primary"
            />
            <Label htmlFor="featured" className="font-normal cursor-pointer">
              Featured article (homepage hero)
            </Label>
          </div>
        </div>

        {/* Cover image */}
        <ImageUpload value={form.cover_image} onChange={(url) => set('cover_image', url)} />

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
            Delete Article
          </Button>
        )}
      </div>
    </div>
  )
}

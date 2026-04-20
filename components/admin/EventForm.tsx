'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Event, EventFormData } from '@/types'

interface EventFormProps {
  event?: Event
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Split an ISO/datetime string into local [date, time] parts ("2024-01-15", "14:30")
// Uses the date object's LOCAL time so what the user typed matches what they see
function splitDateTime(iso: string | null | undefined): [string, string] {
  if (!iso) return ['', '']
  const d = new Date(iso)
  if (isNaN(d.getTime())) return [iso.slice(0, 10), iso.slice(11, 16)]
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return [`${yyyy}-${mm}-${dd}`, `${hh}:${min}`]
}

// Combine date + time strings — stores without UTC conversion so the time
// is preserved as-is (Supabase timestamptz will store it at face value in UTC)
function combineDateTime(date: string, time: string): string | null {
  if (!date) return null
  // Append Z so it is treated as UTC everywhere (server + client = consistent)
  return time ? `${date}T${time}:00.000Z` : `${date}T00:00:00.000Z`
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const isNew = !event

  const [startDate, startTime] = splitDateTime(event?.date)
  const [endDate, endTime] = splitDateTime(event?.end_date)

  const [form, setForm] = useState<Omit<EventFormData, 'date' | 'end_date'>>({
    title: event?.title ?? '',
    slug: event?.slug ?? '',
    description: event?.description ?? '',
    content: event?.content ?? '',
    location: event?.location ?? '',
    event_url: event?.event_url ?? null,
    cover_image: event?.cover_image ?? null,
    status: event?.status ?? 'draft',
  })

  const [dateStr, setDateStr] = useState(startDate)
  const [timeStr, setTimeStr] = useState(startTime)
  const [endDateStr, setEndDateStr] = useState(endDate)
  const [endTimeStr, setEndTimeStr] = useState(endTime)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  function handleTitleChange(title: string) {
    set('title', title)
    if (isNew) set('slug', slugify(title))
  }

  const handleContent = useCallback((html: string) => set('content', html), [])

  async function save(status?: 'draft' | 'published') {
    const combinedDate = combineDateTime(dateStr, timeStr)
    if (!combinedDate) {
      toast.error('Start date is required')
      return
    }
    setSaving(true)
    const supabase = createClient()

    const payload = {
      ...form,
      date: combinedDate,
      end_date: combineDateTime(endDateStr, endTimeStr),
      status: status ?? form.status,
    }

    if (isNew) {
      const { data, error } = await supabase
        .from('events')
        .insert(payload)
        .select('id')
        .single()

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Event created')
      router.push(`/admin/events/${data.id}`)
    } else {
      const { error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', event.id)

      if (error) {
        toast.error('Save failed: ' + error.message)
        setSaving(false)
        return
      }
      toast.success('Event saved')
      set('status', payload.status)
    }

    setSaving(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!event || !confirm('Delete this event? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', event.id)

    if (error) {
      toast.error('Delete failed')
      setDeleting(false)
      return
    }
    toast.success('Event deleted')
    router.push('/admin/events')
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
            placeholder="Event title"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="event-slug"
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief event summary for cards and SEO…"
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Full Details (optional)</Label>
          <RichTextEditor
            value={form.content}
            onChange={handleContent}
            placeholder="Full event details, schedule, speakers…"
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
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Eye className="h-3.5 w-3.5 mr-1" />
              )}
              Publish
            </Button>
          </div>
          {!isNew && form.status === 'published' && (
            <a
              href={`/events/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> View live event
            </a>
          )}
        </div>

        {/* Date & Time */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Date &amp; Time</h3>

          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>End Date (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                type="time"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Location</h3>

          <div className="space-y-1.5">
            <Label htmlFor="location">Venue / Place *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="SM Baguio, Session Road…"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event_url">Event Page URL (optional)</Label>
            <Input
              id="event_url"
              value={form.event_url ?? ''}
              onChange={(e) => set('event_url', e.target.value || null)}
              placeholder="https://lu.ma/… or https://eventbrite.com/…"
              className="h-8 text-sm"
            />
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
            Delete Event
          </Button>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Loader2, Camera, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ROLE_LABELS, CONTRIBUTOR_REGIONS, type ContributorProfile, type ContributorRole } from '@/types/contributor'

interface ProfileFormProps {
  profile: ContributorProfile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    display_name: profile.display_name,
    role: profile.role ?? '',
    organization: profile.organization ?? '',
    region: profile.region ?? '',
    bio: profile.bio ?? '',
    linkedin_url: profile.linkedin_url ?? '',
    facebook_url: profile.facebook_url ?? '',
    website_url: profile.website_url ?? '',
    photo_url: profile.photo_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `avatars/${profile.id}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('contributor-photos')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (error) {
      toast.error('Photo upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contributor-photos')
      .getPublicUrl(path)

    set('photo_url', publicUrl)
    setUploading(false)
    toast.success('Photo uploaded')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.display_name.trim()) {
      toast.error('Display name is required')
      return
    }
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('contributor_profiles')
      .update({
        full_name: form.full_name || null,
        display_name: form.display_name.trim(),
        role: form.role || null,
        organization: form.organization || null,
        region: form.region || null,
        bio: form.bio || null,
        linkedin_url: form.linkedin_url || null,
        facebook_url: form.facebook_url || null,
        website_url: form.website_url || null,
        photo_url: form.photo_url || null,
      })
      .eq('id', profile.id)

    setSaving(false)
    if (error) {
      toast.error('Save failed: ' + error.message)
    } else {
      toast.success('Profile saved')
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-xl">
      {/* Photo */}
      <div>
        <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3">Profile Photo</p>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-zinc-100 overflow-hidden border-2 border-zinc-200">
            {form.photo_url ? (
              <Image src={form.photo_url} alt="Profile" fill className="object-cover" sizes="64px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xl font-bold">
                {(form.display_name || '?')[0].toUpperCase()}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:border-zinc-400 transition-colors disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            {form.photo_url && (
              <button
                type="button"
                onClick={() => set('photo_url', '')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Names */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.display_name}
            onChange={(e) => set('display_name', e.target.value)}
            required
            placeholder="Your byline"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
          <p className="text-[10px] text-zinc-400 mt-1">Shown as your byline on published articles</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Role + Org */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          >
            <option value="">Select role</option>
            {(Object.entries(ROLE_LABELS) as [ContributorRole, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Organization
          </label>
          <input
            type="text"
            value={form.organization}
            onChange={(e) => set('organization', e.target.value)}
            placeholder="Company, school, org…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Region */}
      <div className="w-1/2 pr-2">
        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
          Region
        </label>
        <select
          value={form.region}
          onChange={(e) => set('region', e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
        >
          <option value="">Select region</option>
          {CONTRIBUTOR_REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Bio */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
            Bio
          </label>
          <span className={`text-[10px] ${form.bio.length > 270 ? 'text-orange-500' : 'text-zinc-400'}`}>
            {form.bio.length}/300
          </span>
        </div>
        <textarea
          value={form.bio}
          onChange={(e) => set('bio', e.target.value.slice(0, 300))}
          maxLength={300}
          rows={3}
          placeholder="A short bio that will appear alongside your published articles…"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors resize-none"
        />
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Links (optional)</p>
        {[
          { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
          { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/yourname' },
          { key: 'website_url', label: 'Personal Website', placeholder: 'https://yoursite.com' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 w-28 shrink-0">{label}</span>
            <input
              type="url"
              value={(form as Record<string, string>)[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-60 transition-colors"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Profile
      </button>
    </form>
  )
}

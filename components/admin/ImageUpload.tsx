'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'Cover Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
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
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('article-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('article-images').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
  }

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border/40 bg-muted group">
          <div className="relative aspect-video">
            <Image src={value} alt="Cover" fill className="object-cover" sizes="600px" />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-border/40 bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-colors text-muted-foreground',
            uploading && 'cursor-not-allowed opacity-60'
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
          ) : (
            <Upload className="h-6 w-6 mb-2" />
          )}
          <span className="text-sm">
            {uploading ? 'Uploading…' : 'Click to upload cover image'}
          </span>
          <span className="text-xs mt-1">PNG, JPG, WebP · Max 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}

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
  position?: string | null
  onPositionChange?: (position: string) => void
}

export function ImageUpload({ value, onChange, label = 'Cover Image', position, onPositionChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const positionerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

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

  const canReposition = !!onPositionChange
  const [px, py] = (position ?? '50% 50%').split(' ').map((v) => parseFloat(v))

  function setPositionFromPointer(clientX: number, clientY: number) {
    if (!positionerRef.current || !onPositionChange) return
    const rect = positionerRef.current.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    onPositionChange(`${x.toFixed(0)}% ${y.toFixed(0)}%`)
  }

  function handlePointerDown(e: React.PointerEvent) {
    draggingRef.current = true
    setPositionFromPointer(e.clientX, e.clientY)
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (draggingRef.current) setPositionFromPointer(e.clientX, e.clientY)
  }
  function stopDragging() {
    draggingRef.current = false
  }

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border/40 bg-muted group">
          <div
            ref={positionerRef}
            className={cn('relative aspect-video', canReposition && 'cursor-crosshair')}
            onPointerDown={canReposition ? handlePointerDown : undefined}
            onPointerMove={canReposition ? handlePointerMove : undefined}
            onPointerUp={canReposition ? stopDragging : undefined}
            onPointerLeave={canReposition ? stopDragging : undefined}
          >
            <Image src={value} alt="Cover" fill className="object-cover" style={{ objectPosition: position ?? '50% 50%' }} sizes="600px" draggable={false} />
            {canReposition && (
              <div
                className="absolute w-5 h-5 rounded-full border-2 border-white bg-black/40 shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${px}%`, top: `${py}%` }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      {canReposition && value && (
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-muted-foreground">Click or drag on the image to set what&apos;s shown when cropped.</p>
          {position && position !== '50% 50%' && (
            <button
              type="button"
              onClick={() => onPositionChange?.('50% 50%')}
              className="text-xs text-primary hover:underline shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      )}
      {!value && (
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

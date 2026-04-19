import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DirectoryForm } from '@/components/admin/DirectoryForm'
import type { DirectoryEntry } from '@/types'

export default async function EditDirectoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('directory')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const entry = data as DirectoryEntry

  return (
    <div>
      <Link
        href="/admin/directory"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
      </Link>
      <h1 className="text-2xl font-bold mb-6">{entry.name}</h1>
      <DirectoryForm entry={entry} />
    </div>
  )
}

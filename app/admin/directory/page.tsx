import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { DirectoryBulkTable } from '@/components/admin/DirectoryBulkTable'

export default async function AdminDirectoryPage() {
  const supabase = await createClient()
  const { data: entries, error } = await supabase
    .from('directory')
    .select('id, name, type, sector, city, status, featured, created_at')
    .order('name', { ascending: true })

  const published = entries?.filter((e) => e.status === 'published').length ?? 0
  const total = entries?.length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Directory</h1>
          <p className="text-xs text-muted-foreground mt-1">{published} published · {total} total</p>
        </div>
        <Link href="/admin/directory/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <PlusCircle className="h-4 w-4 mr-1.5" /> New Listing
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <strong>Database error:</strong> {error.message}
        </div>
      )}
      <DirectoryBulkTable entries={entries ?? []} />
    </div>
  )
}

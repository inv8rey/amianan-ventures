import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// PATCH /api/admin/comments  { id, status: 'approved'|'rejected' }
export async function PATCH(req: Request) {
  // Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status } = await req.json() as { id?: string; status?: string }
    if (!id || !['approved', 'rejected'].includes(status ?? '')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const svc = createServiceClient()
    const { error } = await svc
      .from('article_comments')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

// DELETE /api/admin/comments?id=<uuid>
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const svc = createServiceClient()
    const { error } = await svc.from('article_comments').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}

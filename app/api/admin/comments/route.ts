import { NextResponse } from 'next/server'
import { getSessionRole } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/service'

// DELETE /api/admin/comments?id=<uuid>
export async function DELETE(req: Request) {
  const { isAdmin } = await getSessionRole()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

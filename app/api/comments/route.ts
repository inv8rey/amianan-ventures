import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// ── GET /api/comments?type=article&id=<slug|uuid> ──────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const articleType = searchParams.get('type')
  const articleId   = searchParams.get('id')

  if (!articleType || !articleId) {
    return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('article_comments')
      .select('id, author_name, content, created_at')
      .eq('article_type', articleType)
      .eq('article_id', articleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ comments: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ comments: [] })
  }
}

// ── POST /api/comments ─────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      articleType?: string
      articleId?: string
      authorName?: string
      authorEmail?: string
      content?: string
    }

    const { articleType, articleId, authorName, authorEmail, content } = body

    // Validate
    if (!articleType || !articleId || !authorName?.trim() || !authorEmail?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (!['article', 'contribution'].includes(articleType)) {
      return NextResponse.json({ error: 'Invalid article type.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (authorName.length > 100) {
      return NextResponse.json({ error: 'Name is too long.' }, { status: 400 })
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment exceeds 1000 characters.' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('article_comments').insert({
      article_type: articleType,
      article_id:   articleId,
      author_name:  authorName.trim(),
      author_email: authorEmail.trim().toLowerCase(),
      content:      content.trim(),
      status:       'pending',
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit comment. Please try again.' }, { status: 500 })
  }
}

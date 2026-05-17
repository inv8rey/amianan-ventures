import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// Vercel Cron endpoint — runs every minute via vercel.json.
// Uses the service role key so it can bypass RLS and update articles
// without a user session. Falls back gracefully if key isn't set.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow Vercel cron (no secret needed if CRON_SECRET not set) or matching Bearer token
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Use service key if available, fall back to anon (will be limited by RLS)
  const key = serviceKey ?? anonKey
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const now = new Date().toISOString()

  const { data: due, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, slug, category')
    .eq('status', 'scheduled')
    .lte('published_at', now)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ published: 0, message: 'No scheduled articles due' })
  }

  const { error: updateError } = await supabase
    .from('articles')
    .update({ status: 'published' })
    .in('id', due.map((a) => a.id))

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  revalidatePath('/news')
  revalidatePath('/founder-stories')
  revalidatePath('/')
  for (const article of due) {
    revalidatePath(`/${article.category}/${article.slug}`)
  }

  console.log(`[publish-scheduled] Published ${due.length}:`, due.map((a) => a.title))

  return NextResponse.json({
    published: due.length,
    articles: due.map((a) => ({ id: a.id, title: a.title })),
  })
}

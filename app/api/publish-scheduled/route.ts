import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { sendPublished } from '@/lib/email'

// Vercel Cron endpoint — runs every minute via vercel.json.
// Publishes:
//   1. Scheduled articles (articles table, status = 'scheduled')
//   2. Approved contributor submissions with a past scheduled_for date
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amiananventures.org'

  // Use service key if available, fall back to anon (will be limited by RLS)
  const key = serviceKey ?? anonKey
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const now = new Date().toISOString()

  // ── 1. Publish scheduled admin articles ─────────────────────────────────
  const { data: due, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, slug, category')
    .eq('status', 'scheduled')
    .lte('published_at', now)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  let articlesPublished = 0
  if (due && due.length > 0) {
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

    articlesPublished = due.length
    console.log(`[publish-scheduled] Published ${due.length} articles:`, due.map((a) => a.title))
  }

  // ── 2. Publish scheduled contributor submissions ─────────────────────────
  const { data: dueContributions, error: contribFetchError } = await supabase
    .from('contributor_submissions')
    .select('id, headline, contributor_id')
    .eq('status', 'approved')
    .not('scheduled_for', 'is', null)
    .lte('scheduled_for', now)

  if (contribFetchError) {
    console.error('[publish-scheduled] Contributor fetch error:', contribFetchError.message)
    // Don't fail the whole cron — articles already processed
  }

  let contributionsPublished = 0
  if (dueContributions && dueContributions.length > 0) {
    for (const contrib of dueContributions) {
      const publishedUrl = `${siteUrl}/contributions/${contrib.id}`

      const { error: updateErr } = await supabase
        .from('contributor_submissions')
        .update({
          status: 'published',
          published_at: now,
          published_url: publishedUrl,
        })
        .eq('id', contrib.id)

      if (updateErr) {
        console.error(`[publish-scheduled] Failed to publish contribution ${contrib.id}:`, updateErr.message)
        continue
      }

      // Send published email
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(contrib.contributor_id)
        const email = authUser?.user?.email
        if (email) {
          await sendPublished(email, { headline: contrib.headline, url: publishedUrl })
        }
      } catch (e) {
        console.error(`[publish-scheduled] Email failed for contribution ${contrib.id}:`, e)
      }

      contributionsPublished++
    }

    // Revalidate public pages that show contributions
    revalidatePath('/')
    revalidatePath('/ecosystem')
    revalidatePath('/contributions')

    console.log(`[publish-scheduled] Published ${contributionsPublished} contributions`)
  }

  const totalPublished = articlesPublished + contributionsPublished
  if (totalPublished === 0) {
    return NextResponse.json({ published: 0, message: 'No scheduled content due' })
  }

  return NextResponse.json({
    published: totalPublished,
    articles: articlesPublished,
    contributions: contributionsPublished,
  })
}

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

// Called by Vercel Cron (vercel.json) and also by the admin page on load.
// Finds every article with status='scheduled' whose published_at is in the
// past and flips it to status='published', then busts the relevant caches.
//
// Protected by CRON_SECRET so it can't be called by random visitors.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow requests with matching secret OR from Vercel's internal cron runner
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    // Find all past-due scheduled articles
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

    // Flip status to published
    const ids = due.map((a) => a.id)
    const { error: updateError } = await supabase
      .from('articles')
      .update({ status: 'published' })
      .in('id', ids)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Bust ISR caches for affected pages
    revalidatePath('/news')
    revalidatePath('/founder-stories')
    revalidatePath('/')
    for (const article of due) {
      revalidatePath(`/${article.category}/${article.slug}`)
    }

    console.log(`[publish-scheduled] Published ${due.length} article(s):`, due.map((a) => a.title))

    return NextResponse.json({
      published: due.length,
      articles: due.map((a) => ({ id: a.id, title: a.title })),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

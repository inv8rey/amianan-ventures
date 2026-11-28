import { isRateLimited, UUID_RE } from '@/lib/rate-limit'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!UUID_RE.test(id)) return new Response(null, { status: 400 })
    if (isRateLimited(_req, `view:${id}`, 5, 60_000)) return new Response(null, { status: 204 })

    const supabase = createServiceClient()

    // Read current views, then increment — atomic enough for low-traffic site
    const { data } = await supabase
      .from('articles')
      .select('views')
      .eq('id', id)
      .eq('status', 'published')
      .single()
    if (!data) return new Response(null, { status: 404 })

    await supabase
      .from('articles')
      .update({ views: (data?.views ?? 0) + 1 })
      .eq('id', id)

    return new Response(null, { status: 204 })
  } catch {
    return new Response(null, { status: 500 })
  }
}

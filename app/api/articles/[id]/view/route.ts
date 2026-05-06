import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return new Response(null, { status: 400 })

    const supabase = createServiceClient()

    // Read current views, then increment — atomic enough for low-traffic site
    const { data } = await supabase
      .from('articles')
      .select('views')
      .eq('id', id)
      .single()

    await supabase
      .from('articles')
      .update({ views: (data?.views ?? 0) + 1 })
      .eq('id', id)

    return new Response(null, { status: 204 })
  } catch {
    return new Response(null, { status: 500 })
  }
}

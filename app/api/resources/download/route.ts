import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const { resourceId, email } = await req.json()

  if (!resourceId || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const cleanEmail = email.trim().toLowerCase()
  const supabase = createServiceClient()

  const { data: resource, error: fetchError } = await supabase
    .from('founder_resources')
    .select('id, file_url, status, download_count')
    .eq('id', resourceId)
    .single()

  if (fetchError || !resource || resource.status !== 'published' || !resource.file_url) {
    return NextResponse.json({ error: 'Resource not available' }, { status: 404 })
  }

  await supabase.from('resource_downloads').insert({ resource_id: resourceId, email: cleanEmail })
  await supabase
    .from('founder_resources')
    .update({ download_count: resource.download_count + 1 })
    .eq('id', resourceId)
  await supabase
    .from('newsletter_subscribers')
    .insert({ email: cleanEmail, source: 'resource_download' })

  return NextResponse.json({ file_url: resource.file_url })
}

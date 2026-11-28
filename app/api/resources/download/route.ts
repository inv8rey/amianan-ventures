import { EMAIL_RE, isRateLimited, UUID_RE } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'


// The Resources page lives on the main studio site and downloads through here.
const ALLOWED_ORIGINS = new Set([
  'https://amiananventures.org',
  'https://www.amiananventures.org',
  'http://localhost:4173',
])

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  if (!ALLOWED_ORIGINS.has(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

export function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req) })
}

export async function POST(req: Request) {
  if (isRateLimited(req, 'resource-download', 10, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429, headers: cors(req) })
  }
  const { resourceId, email } = await req.json().catch(() => ({}))

  if (typeof resourceId !== 'string' || !UUID_RE.test(resourceId) || typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400, headers: cors(req) })
  }

  const cleanEmail = email.trim().toLowerCase()
  const supabase = createServiceClient()

  const { data: resource, error: fetchError } = await supabase
    .from('founder_resources')
    .select('id, file_url, status, download_count')
    .eq('id', resourceId)
    .single()

  if (fetchError || !resource || resource.status !== 'published' || !resource.file_url) {
    return NextResponse.json({ error: 'Resource not available' }, { status: 404, headers: cors(req) })
  }

  await supabase.from('resource_downloads').insert({ resource_id: resourceId, email: cleanEmail })
  await supabase
    .from('founder_resources')
    .update({ download_count: resource.download_count + 1 })
    .eq('id', resourceId)
  await supabase
    .from('newsletter_subscribers')
    .insert({ email: cleanEmail, source: 'resource_download' })

  return NextResponse.json({ file_url: resource.file_url }, { headers: cors(req) })
}

import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendSpotlightSubmitted, sendEditorSpotlightAlert } from '@/lib/email'

// Internal API — called from SpotlightForm after a successful "submit for
// review" update to trigger applicant + editor email notifications.
export async function POST(request: Request) {
  const body = await request.json()
  const { applicationId } = body

  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const { data: app } = await supabase
    .from('spotlight_applications')
    .select('business_name, email')
    .eq('id', applicationId)
    .single()

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  try {
    await sendSpotlightSubmitted(app.email, { businessName: app.business_name })
    await sendEditorSpotlightAlert({ businessName: app.business_name, applicationId })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[spotlight send-email] Error:', error)
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Called right after Get Featured signup to set up the applicant's
// contributor profile + initial draft application row.
// Uses service role key to bypass RLS.
//
// Retries on FK violation (23503) — the contributor_profiles row is
// created by a DB trigger on auth.users INSERT, which can land a few ms
// after signUp() resolves on the client (same race condition handled by
// /api/contributor/create-profile).
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const body = await request.json()
  const { userId, businessName, contactName, email } = body

  if (!userId || !businessName || !contactName || !email) {
    return NextResponse.json({ error: 'userId, businessName, contactName, and email are required' }, { status: 400 })
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
  const delays = [300, 600, 1200, 2000, 3000]

  // Safety net: make sure organization/display_name are set on the
  // contributor profile even if the DB trigger didn't populate them.
  for (let i = 0; i <= delays.length; i++) {
    const { error } = await supabase
      .from('contributor_profiles')
      .update({ organization: businessName, display_name: contactName })
      .eq('id', userId)
      .is('organization', null)

    if (!error) break
    if (i === delays.length) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await sleep(delays[i])
  }

  // Insert the initial draft application
  for (let i = 0; i <= delays.length; i++) {
    const { data, error } = await supabase
      .from('spotlight_applications')
      .insert({
        contributor_id: userId,
        business_name: businessName,
        contact_name: contactName,
        email,
        status: 'draft',
      })
      .select('id')
      .single()

    if (!error) return NextResponse.json({ ok: true, id: data.id })

    // FK violation — contributor profile not committed yet, wait and retry
    if (error.code === '23503' && i < delays.length) {
      await sleep(delays[i])
      continue
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ error: 'Could not create application after retries. Please try again.' }, { status: 500 })
}

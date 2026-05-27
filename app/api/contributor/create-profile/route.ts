import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Called right after contributor signup to insert their profile row.
// Uses service role key to bypass RLS.
//
// Retries on FK violation (23503) — Supabase occasionally commits the
// auth.users row a few ms after signUp() resolves, causing a race condition.
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
  const { userId, displayName, fullName, role } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

  const payload = {
    id: userId,
    display_name: displayName ?? '',
    full_name: fullName ?? null,
    role: role ?? null,
  }

  // Retry up to 5 times on FK violation — handles auth commit race condition
  const delays = [300, 600, 1200, 2000, 3000]

  for (let i = 0; i <= delays.length; i++) {
    const { error } = await supabase.from('contributor_profiles').insert(payload)

    if (!error) return NextResponse.json({ ok: true })

    // Duplicate row — already created (e.g. double submit)
    if (error.code === '23505') return NextResponse.json({ ok: true })

    // FK violation — auth user not committed yet, wait and retry
    if (error.code === '23503' && i < delays.length) {
      await sleep(delays[i])
      continue
    }

    // Any other error — fail immediately
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ error: 'Could not create profile after retries. Please try again.' }, { status: 500 })
}

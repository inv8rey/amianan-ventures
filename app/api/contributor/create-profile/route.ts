import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Called right after contributor signup to insert their profile row.
// Uses service role key to bypass RLS (the user session cookie isn't available
// immediately after signup in the same server request).
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

  const { error } = await supabase.from('contributor_profiles').insert({
    id: userId,
    display_name: displayName ?? '',
    full_name: fullName ?? null,
    role: role ?? null,
  })

  if (error) {
    // If row already exists (duplicate signup attempt), treat as success
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

import { canSetUpAccount } from '@/lib/new-account'
import { EMAIL_RE, isRateLimited, str, tooMany } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PACKAGES, isPackageId } from '@/types/spotlight'

// Called right after Get Featured signup to set up the applicant's
// contributor profile + initial draft application row.
// Uses service role key to bypass RLS.
//
// The contributor_profiles row is *supposed* to be created by a DB trigger
// on auth.users INSERT, but that trigger isn't guaranteed to exist (it's
// not in a tracked migration file) — so this route upserts the profile
// itself rather than relying on it. Retries on FK violation (23503) cover
// the case where auth.users hasn't fully committed yet.
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (isRateLimited(request, 'spotlight-start', 10, 60_000)) return tooMany()
  const body = await request.json().catch(() => ({}))
  const { userId, packageId } = body
  if (!(await canSetUpAccount(userId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const businessName = str(body.businessName, 150)
  const contactName = str(body.contactName, 120)
  const email = str(body.email, 254)

  if (!businessName || !contactName || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'userId, businessName, contactName, and email are required' }, { status: 400 })
  }

  const pkg = PACKAGES[isPackageId(packageId) ? packageId : 'founding-rate']

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
  const delays = [300, 600, 1200, 2000, 3000]

  // Ensure the contributor profile exists (insert if missing, fill in
  // organization/display_name if it already exists but is blank).
  for (let i = 0; i <= delays.length; i++) {
    const { data: existing, error: fetchError } = await supabase
      .from('contributor_profiles')
      .select('id, organization, display_name')
      .eq('id', userId)
      .maybeSingle()

    if (!fetchError) {
      if (!existing) {
        const { error: insertError } = await supabase
          .from('contributor_profiles')
          .insert({ id: userId, display_name: contactName, organization: businessName })
        if (!insertError || insertError.code === '23505') break
        if (insertError.code === '23503' && i < delays.length) {
          await sleep(delays[i])
          continue
        }
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      } else if (!existing.organization || !existing.display_name) {
        await supabase
          .from('contributor_profiles')
          .update({
            organization: existing.organization || businessName,
            display_name: existing.display_name || contactName,
          })
          .eq('id', userId)
      }
      break
    }

    if (i === delays.length) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
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
        package: pkg.id,
        amount_php: pkg.amount_php,
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

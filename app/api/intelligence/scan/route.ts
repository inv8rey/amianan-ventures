import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getSessionRole } from '@/lib/admin-auth'
import { runIntelligenceScan } from '@/lib/intelligence'

export const maxDuration = 300

function validCronAuthorization(request: Request) {
  const secret = process.env.CRON_SECRET
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!secret || !supplied || secret.length !== supplied.length) return false
  return timingSafeEqual(Buffer.from(secret), Buffer.from(supplied))
}

export async function GET(request: Request) {
  if (!validCronAuthorization(request)) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  try { return NextResponse.json(await runIntelligenceScan()) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Scan failed' }, { status: 500 }) }
}

export async function POST() {
  const { isAdmin } = await getSessionRole()
  if (!isAdmin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  try { return NextResponse.json(await runIntelligenceScan()) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Scan failed' }, { status: 500 }) }
}

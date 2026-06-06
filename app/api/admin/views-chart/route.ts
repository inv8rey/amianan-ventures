import { NextResponse } from 'next/server'
import crypto from 'crypto'

function b64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function getToken(): Promise<string | null> {
  const email  = process.env.GA4_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !rawKey) return null
  try {
    const now    = Math.floor(Date.now() / 1000)
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claim  = b64url(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now, exp: now + 3600,
    }))
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(`${header}.${claim}`)
    const sig = b64url(sign.sign(rawKey))
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claim}.${sig}` }),
    })
    const j = await r.json() as { access_token?: string }
    return j.access_token ?? null
  } catch { return null }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? '30d'

  const propertyId = process.env.GA4_PROPERTY_ID
  if (!propertyId) return NextResponse.json({ error: 'GA4 not configured' }, { status: 503 })

  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Auth failed' }, { status: 503 })

  // Date range by period
  const startMap: Record<string, string> = {
    '7d':  '6daysAgo',
    '30d': '29daysAgo',
    '3m':  '89daysAgo',
  }
  const startDate = startMap[period] ?? '29daysAgo'

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      cache: 'no-store',
    }
  )

  if (!res.ok) return NextResponse.json({ error: 'GA4 request failed' }, { status: 502 })

  interface Ga4Row { dimensionValues: { value: string }[]; metricValues: { value: string }[] }
  const json = await res.json() as { rows?: Ga4Row[] }

  const data = (json.rows ?? []).map((row) => {
    const raw  = row.dimensionValues[0].value // YYYYMMDD
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
    const d    = new Date(date)
    // Label format depends on period
    const label = period === '7d'
      ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : period === '30d'
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { date, label, pageviews: parseInt(row.metricValues[0].value) }
  })

  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}

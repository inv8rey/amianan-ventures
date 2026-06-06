import crypto from 'crypto'

// ---------------------------------------------------------------------------
// JWT signing (service-account → OAuth2 access token)
// ---------------------------------------------------------------------------
function b64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function getAccessToken(): Promise<string | null> {
  const email = process.env.GA4_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !rawKey) return null

  try {
    const now = Math.floor(Date.now() / 1000)
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claim = b64url(
      JSON.stringify({
        iss: email,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      })
    )

    const sign = crypto.createSign('RSA-SHA256')
    sign.update(`${header}.${claim}`)
    const sig = b64url(sign.sign(rawKey))
    const jwt = `${header}.${claim}.${sig}`

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
      cache: 'no-store',
    })

    if (!res.ok) return null
    const json = await res.json() as { access_token?: string }
    return json.access_token ?? null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// GA4 Data API runner
// ---------------------------------------------------------------------------
interface Ga4ApiRow {
  dimensionValues?: { value: string }[]
  metricValues: { value: string }[]
}

async function runReport(token: string, propertyId: string, body: object) {
  try {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        next: { revalidate: 3600 }, // cache 1 hour
      }
    )
    if (!res.ok) return null
    return res.json() as Promise<{ rows?: Ga4ApiRow[]; rowCount?: number }>
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Public shape
// ---------------------------------------------------------------------------
export interface Ga4Stats {
  totalPageviews: number
  totalSessions: number
  avgSessionDuration: number   // seconds
  avgPageviewsPerSession: number
  topPages: { page: string; views: number }[]
  sources: { source: string; sessions: number; pct: number }[]
  dailyViews: { date: string; views: number }[]
}

export async function fetchGa4Stats(): Promise<Ga4Stats | null> {
  const propertyId = process.env.GA4_PROPERTY_ID
  if (!propertyId) return null

  const token = await getAccessToken()
  if (!token) return null

  const [overviewData, topPagesData, sourcesData, dailyData] = await Promise.all([
    // Overview totals — no dimension
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViewsPerSession' },
      ],
    }),

    // Top pages
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    }),

    // Traffic sources
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    }),

    // Daily pageviews (last 30 days for sparkline)
    runReport(token, propertyId, {
      dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
  ])

  const totalPageviews        = parseInt(overviewData?.rows?.[0]?.metricValues?.[0]?.value ?? '0')
  const totalSessions         = parseInt(overviewData?.rows?.[0]?.metricValues?.[1]?.value ?? '0')
  const avgSessionDuration    = parseFloat(overviewData?.rows?.[0]?.metricValues?.[2]?.value ?? '0')
  const avgPageviewsPerSession = parseFloat(overviewData?.rows?.[0]?.metricValues?.[3]?.value ?? '0')

  const topPages = (topPagesData?.rows ?? []).map((r) => ({
    page: r.dimensionValues?.[0]?.value ?? '',
    views: parseInt(r.metricValues[0].value),
  }))

  const rawSources = (sourcesData?.rows ?? []).map((r) => ({
    source: r.dimensionValues?.[0]?.value ?? 'Unknown',
    sessions: parseInt(r.metricValues[0].value),
  }))
  const totalSourceSessions = rawSources.reduce((s, r) => s + r.sessions, 0)
  const sources = rawSources.map((r) => ({
    ...r,
    pct: totalSourceSessions > 0 ? Math.round((r.sessions / totalSourceSessions) * 100) : 0,
  }))

  const dailyViews = (dailyData?.rows ?? []).map((r) => {
    const raw = r.dimensionValues?.[0]?.value ?? ''
    // raw is YYYYMMDD
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
    return { date, views: parseInt(r.metricValues[0].value) }
  })

  return { totalPageviews, totalSessions, avgSessionDuration, avgPageviewsPerSession, topPages, sources, dailyViews }
}

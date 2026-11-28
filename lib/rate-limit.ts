/**
 * Small in-memory rate limiter for public form endpoints (comments, downloads, emails).
 * Each server instance keeps its own counts, so this is a speed bump against scripted
 * abuse, not a hard guarantee. Vercel's firewall rules are the place for stronger limits.
 */
const hits = new Map<string, number[]>()

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

/** Returns true when the caller is over `limit` requests in the last `windowMs`. */
export function isRateLimited(req: Request, bucket: string, limit: number, windowMs: number): boolean {
  const key = `${bucket}:${clientIp(req)}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k)
  }
  return recent.length > limit
}

export const tooMany = () =>
  Response.json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429 })

export const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Trimmed string or null when missing, not a string, or longer than `max`. */
export function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  return v && v.length <= max ? v : null
}

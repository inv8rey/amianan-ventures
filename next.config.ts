import type { NextConfig } from 'next'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://*.supabase.co'

// Content Security Policy: the browser only loads scripts, connections, and frames from
// the places listed here, so injected code has nowhere to send data. Inline scripts stay
// allowed because Next.js and Google Analytics use them; rich text is sanitized separately.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https:",
  `connect-src 'self' ${supabase} ${supabase.replace('https://', 'wss://')} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`,
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Development needs eval for hot reload, so the policy only applies to production builds
  ...(process.env.NODE_ENV === 'production' ? [{ key: 'Content-Security-Policy', value: csp }] : []),
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      {
        source: '/founder-story',
        destination: '/share-your-story',
        permanent: true,
      },
      // About and Resources moved to the main studio site
      { source: '/about', destination: 'https://amiananventures.org/about/', permanent: true },
      { source: '/resources', destination: 'https://amiananventures.org/resources/', permanent: true },
      // The ecosystem directory was retired; that space is now Opportunities
      { source: '/ecosystem', destination: '/opportunities', permanent: true },
      // Contributor sign-ups are paused; send people to the contact form instead.
      // Temporary, so login and password reset keep working for existing contributors.
      { source: '/contribute', destination: '/contact?topic=story', permanent: false },
      { source: '/contribute/signup', destination: '/contact?topic=story', permanent: false },
    ]
  },
  images: {
    // Disable Vercel image optimization — images are served from Supabase CDN
    // which already optimizes delivery. This prevents hitting the 5K/month
    // free-tier transformation limit.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

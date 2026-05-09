import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 31536000,
    formats: ['image/webp'],
    remotePatterns: [
      // Supabase storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow any https image during development
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
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

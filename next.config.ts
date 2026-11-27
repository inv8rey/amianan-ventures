import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

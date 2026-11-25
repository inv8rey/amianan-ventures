import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { SITE_URL } from '@/lib/site'

// Body / UI font — Geist, shared with amiananventures.org
const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Display headlines use Geist too, at a medium weight
const geistDisplay = Geist({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Amianan Ventures — Innovation Media for Northern Luzon',
    template: '%s | Amianan Ventures',
  },
  description:
    'Connecting founders, startups, universities, and innovation programs across Baguio, the Cordillera, and Northern Luzon.',
  keywords: ['startups', 'innovation', 'Baguio', 'Cordillera', 'Northern Luzon', 'founders', 'tech'],
  authors: [{ name: 'Amianan Ventures', url: 'https://amiananventures.org' }],
  creator: 'Amianan Ventures',
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: SITE_URL,
    siteName: 'Amianan Ventures',
    title: 'Amianan Ventures — Innovation Media for Northern Luzon',
    description:
      'Connecting founders, startups, universities, and innovation programs across Baguio, the Cordillera, and Northern Luzon.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amianan Ventures',
    description: 'Innovation media for Northern Luzon',
    creator: '@amiananventures',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${geistDisplay.variable} antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}

import type { Metadata } from 'next'
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'
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

// Editorial serif for major headlines (homepage, opportunities)
const editorial = Source_Serif_4({
  variable: '--font-editorial',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Amianan Ventures News',
  title: {
    default: 'Amianan Ventures News | Startup Stories & Opportunities',
    template: '%s | Amianan Ventures News',
  },
  description:
    'Startup news, founder stories, and open opportunities for founders and innovators in the Philippines. Rooted in Northern Luzon, open to builders everywhere.',
  keywords: ['startups', 'innovation', 'founders', 'Philippines', 'Northern Luzon', 'Baguio', 'opportunities', 'tech'],
  authors: [{ name: 'Amianan Ventures', url: 'https://amiananventures.org' }],
  creator: 'Amianan Ventures',
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: SITE_URL,
    siteName: 'Amianan Ventures News',
    title: 'Amianan Ventures News | Startup Stories & Opportunities',
    description:
      'Startup news, founder stories, and open opportunities for founders and innovators in the Philippines.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amianan Ventures News',
    description: 'Startup news, founder stories, and open opportunities for founders and innovators.',
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${geistDisplay.variable} ${editorial.variable} antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono, DM_Serif_Display } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// Body / UI font — geometric grotesque
const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Display font — editorial serif for large headlines only
const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amiananventures.org'),
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
    url: 'https://amiananventures.org',
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
      <body className={`${jakartaSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}

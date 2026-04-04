import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AgeGate } from '@/components/age-gate'
import { ADULT_CONTENT_DISCLAIMER } from '@/lib/adult-disclaimer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hook — Escorts at yours',
  description:
    'Independent escorts and companions who come to you—browse explicit listings, pick your fantasy, then call or WhatsApp. Private adults-only bookings.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: '/apple-icon.png',
    shortcut: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light">
          <AgeGate />
          {children}
          <footer className="border-t border-border bg-muted/20 px-4 py-8 lg:px-8 shrink-0">
            <p className="text-[11px] sm:text-xs leading-relaxed text-muted-foreground max-w-3xl mx-auto text-center">
              {ADULT_CONTENT_DISCLAIMER}
            </p>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

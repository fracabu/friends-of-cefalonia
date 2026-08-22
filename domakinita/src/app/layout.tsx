import type { Metadata } from 'next'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Case e terreni a Cefalonia`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Case, ville e terreni a Cefalonia: annunci delle agenzie dell’isola, ricerca per paese e per area disegnata sulla mappa, richieste di visita.',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: SITE_NAME,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Case in vendita e in affitto`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Annunci immobiliari di agenzie e privati: case in vendita e in affitto, ricerca per zona, mappa, richieste di visita.',
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

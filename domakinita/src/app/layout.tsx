import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { CODICI_HTML, linguaSicura } from '@/i18n/config'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Titolo e descrizione li scrive il layout della lingua: qui resta solo
  // ciò che non cambia da una lingua all'altra.
  title: SITE_NAME,
  openGraph: { type: 'website', siteName: SITE_NAME },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // La lingua arriva dal middleware: qui i parametri del segmento [lingua]
  // non sono ancora visibili, ma l'attributo lang va scritto su <html>.
  const lingua = linguaSicura((await headers()).get('x-lingua'))

  return (
    <html lang={CODICI_HTML[lingua]} suppressHydrationWarning>
      <head>
        {/*
          Il tema si applica prima che il browser disegni: leggerlo in un
          effetto vorrebbe dire mostrare la pagina chiara per un istante e poi
          scurirla, ed è lo sfarfallio che si nota sempre.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('tema');var s=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='scuro'||(!t&&s))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}

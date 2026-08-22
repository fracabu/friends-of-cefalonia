import { NextResponse, type NextRequest } from 'next/server'
import { LINGUE, LINGUA_PREDEFINITA, linguaDaHeader, isLingua } from '@/i18n/config'

const COOKIE_LINGUA = 'lingua'

/**
 * Ogni pagina vive sotto la sua lingua: /it/cerca, /en/search-… , /el/…
 * Chi arriva su un indirizzo senza lingua viene mandato alla sua: prima quella
 * scelta in precedenza (cookie), poi quella del browser, infine l'italiano.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const gia = LINGUE.find(
    (lingua) => pathname === `/${lingua}` || pathname.startsWith(`/${lingua}/`),
  )

  // Il layout principale deve sapere la lingua per l'attributo lang, ma i
  // parametri dei segmenti figli non gli arrivano: gliela si passa in una
  // intestazione.
  if (gia) {
    const intestazioni = new Headers(request.headers)
    intestazioni.set('x-lingua', gia)
    return NextResponse.next({ request: { headers: intestazioni } })
  }

  const scelta = request.cookies.get(COOKIE_LINGUA)?.value
  const lingua = isLingua(scelta)
    ? scelta
    : linguaDaHeader(request.headers.get('accept-language')) || LINGUA_PREDEFINITA

  const destinazione = new URL(`/${lingua}${pathname === '/' ? '' : pathname}`, request.url)
  destinazione.search = request.nextUrl.search
  return NextResponse.redirect(destinazione)
}

export const config = {
  // Fuori dalla lingua restano le API, i file di Next, la sitemap e le immagini.
  matcher: ['/((?!api|_next|favicon.ico|icon.svg|robots.txt|sitemap.xml|uploads).*)'],
}

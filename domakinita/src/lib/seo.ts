
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Domakinita'

/**
 * L'indirizzo pubblico del sito, da cui dipendono link canonici, sitemap,
 * hreflang e dati strutturati.
 *
 * Non serve configurarlo su Vercel: la piattaforma pubblica già da sé il
 * dominio di produzione, e nelle anteprime quello del singolo deploy. La
 * variabile esplicita resta la prima scelta — serve il giorno che ci sarà un
 * dominio proprio, che Vercel non può indovinare.
 *
 * Queste variabili sono lette solo sul server: URL canonici, robots e sitemap
 * si generano lì, e nel pacchetto del browser non finiscono.
 */
function indirizzoPubblico() {
  const esplicito = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (esplicito) return esplicito.replace(/\/$/, '')

  const produzione = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (produzione) return `https://${produzione}`

  const anteprima = process.env.VERCEL_URL?.trim()
  if (anteprima) return `https://${anteprima}`

  return 'http://localhost:3000'
}

export const SITE_URL = indirizzoPubblico()

/** Dati strutturati schema.org per la scheda immobile. */
export function listingJsonLd(listing: {
  slug: string
  title: string
  description: string
  price: number | null
  surface: number
  rooms: number
  bathrooms: number | null
  city: string
  province: string
  postalCode: string | null
  addressLine: string | null
  hideAddress: boolean
  latitude: number | null
  longitude: number | null
  images: { url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description.slice(0, 400),
    url: `${SITE_URL}/annuncio/${listing.slug}`,
    image: listing.images.map((i) => i.url),
    ...(listing.price
      ? { offers: { '@type': 'Offer', price: listing.price, priceCurrency: 'EUR' } }
      : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city,
      addressRegion: listing.province,
      addressCountry: 'IT',
      ...(listing.postalCode ? { postalCode: listing.postalCode } : {}),
      ...(listing.addressLine && !listing.hideAddress
        ? { streetAddress: listing.addressLine }
        : {}),
    },
    ...(listing.latitude && listing.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: listing.latitude,
            longitude: listing.longitude,
          },
        }
      : {}),
    floorSize: { '@type': 'QuantitativeValue', value: listing.surface, unitCode: 'MTK' },
    numberOfRooms: listing.rooms,
    ...(listing.bathrooms ? { numberOfBathroomsTotal: listing.bathrooms } : {}),
  }
}

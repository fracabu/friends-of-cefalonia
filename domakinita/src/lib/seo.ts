
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Domakinita'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

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

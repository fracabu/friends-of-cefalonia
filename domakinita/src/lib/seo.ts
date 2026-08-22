import type { ContractType, PropertyType } from '@prisma/client'
import { PROPERTY_TYPE_LABELS } from './labels'

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Domakinita'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/** Titolo dell'annuncio come lo vuole Google: tipologia, locali, zona, città. */
export function listingTitle(listing: {
  type: PropertyType
  rooms: number
  surface: number
  city: string
  zone: string | null
  contract: ContractType
}) {
  const contract = listing.contract === 'SALE' ? 'in vendita' : 'in affitto'
  const where = listing.zone ? `${listing.zone}, ${listing.city}` : listing.city
  return `${PROPERTY_TYPE_LABELS[listing.type]} ${contract} a ${where} - ${listing.rooms} locali, ${listing.surface} m²`
}

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

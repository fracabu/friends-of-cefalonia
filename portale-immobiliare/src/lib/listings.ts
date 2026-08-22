import 'server-only'
import { Prisma } from '@prisma/client'
import { db } from './db'
import {
  PAGE_SIZE,
  buildListingOrderBy,
  buildListingWhere,
  type SearchFilters,
} from './search'

// Un solo `select` per le liste: le schede mostrano sempre le stesse colonne,
// e non ci si porta dietro la descrizione lunga in una pagina da 24 risultati.
export const listingCardSelect = {
  id: true,
  slug: true,
  title: true,
  contract: true,
  type: true,
  price: true,
  priceOnRequest: true,
  surface: true,
  rooms: true,
  bathrooms: true,
  floor: true,
  city: true,
  province: true,
  zone: true,
  latitude: true,
  longitude: true,
  featured: true,
  publishedAt: true,
  images: {
    select: { url: true, thumbUrl: true, alt: true },
    orderBy: [{ isCover: 'desc' }, { position: 'asc' }],
    take: 1,
  },
  agency: { select: { name: true, slug: true, logoUrl: true } },
} satisfies Prisma.ListingSelect

export type ListingCard = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>

export async function searchListings(filters: SearchFilters) {
  const where = buildListingWhere(filters)
  const skip = (filters.pagina - 1) * PAGE_SIZE

  const [items, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: buildListingOrderBy(filters),
      select: listingCardSelect,
      skip,
      take: PAGE_SIZE,
    }),
    db.listing.count({ where }),
  ])

  return {
    items,
    total,
    page: filters.pagina,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export function getListingBySlug(slug: string) {
  return db.listing.findFirst({
    where: { slug, status: { in: ['PUBLISHED', 'RESERVED', 'SOLD', 'RENTED'] } },
    include: {
      images: { orderBy: [{ isCover: 'desc' }, { position: 'asc' }] },
      agency: true,
      owner: { select: { id: true, name: true, phone: true, email: true } },
    },
  })
}

/** Annunci simili: stessa città, stesso contratto, prezzo entro il 30%. */
export function getSimilarListings(listing: {
  id: string
  city: string
  contract: 'SALE' | 'RENT'
  price: number | null
}) {
  const price = listing.price
  return db.listing.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: listing.id },
      city: listing.city,
      contract: listing.contract,
      ...(price
        ? { price: { gte: Math.round(price * 0.7), lte: Math.round(price * 1.3) } }
        : {}),
    },
    select: listingCardSelect,
    orderBy: { publishedAt: 'desc' },
    take: 4,
  })
}

export function getFeaturedListings(take = 8) {
  return db.listing.findMany({
    where: { status: 'PUBLISHED', featured: true },
    select: listingCardSelect,
    orderBy: { publishedAt: 'desc' },
    take,
  })
}

export function getLatestListings(take = 8) {
  return db.listing.findMany({
    where: { status: 'PUBLISHED' },
    select: listingCardSelect,
    orderBy: { publishedAt: 'desc' },
    take,
  })
}

/** Città con più annunci: alimenta i riquadri in home. */
export async function getTopCities(take = 8) {
  const rows = await db.listing.groupBy({
    by: ['city', 'province'],
    where: { status: 'PUBLISHED' },
    _count: { _all: true },
    orderBy: { _count: { city: 'desc' } },
    take,
  })
  return rows.map((r) => ({ city: r.city, province: r.province, count: r._count._all }))
}

/** Il conteggio delle visite non deve rallentare la scheda: si fa e si dimentica. */
export function incrementViews(id: string) {
  return db.listing
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(() => undefined)
}

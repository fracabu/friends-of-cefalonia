import 'server-only'
import { Prisma } from '@prisma/client'
import { db } from './db'
import { containsPoint, type LatLng } from './geo'
import {
  PAGE_SIZE,
  buildListingOrderBy,
  buildListingWhere,
  parseArea,
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
  isAuction: true,
  isNewBuild: true,
  virtualTourUrl: true,
  publishedAt: true,
  images: {
    select: { url: true, thumbUrl: true, alt: true },
    orderBy: [{ isCover: 'desc' }, { position: 'asc' }],
    take: 1,
  },
  agency: { select: { name: true, slug: true, logoUrl: true } },
} satisfies Prisma.ListingSelect

export type ListingCard = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>

export type SearchResults = {
  items: ListingCard[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  /** Quanti risultati sono stati esaminati per la forma disegnata sulla mappa. */
  areaScanned?: number
}

/** Oltre questa soglia l'area disegnata viene servita solo in parte: si avvisa. */
const AREA_SCAN_LIMIT = 5000

function completeWhere(filters: SearchFilters): Prisma.ListingWhereInput {
  const where = buildListingWhere(filters)

  // «Ultimo piano» mette a confronto due colonne: serve il riferimento di
  // campo di Prisma, che esiste solo dove c'è il client.
  if (filters.ultimoPiano) {
    const existing = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []
    where.AND = [...existing, { floor: { equals: db.listing.fields.totalFloors } }]
  }

  return where
}

export async function searchListings(filters: SearchFilters): Promise<SearchResults> {
  const where = completeWhere(filters)
  const orderBy = buildListingOrderBy(filters)
  const area = parseArea(filters)

  // Senza area disegnata la paginazione la fa il database, come dev'essere.
  if (!area) {
    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy,
        select: listingCardSelect,
        skip: (filters.pagina - 1) * PAGE_SIZE,
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

  /*
   * Con un'area disegnata servono due passaggi. Il primo restringe al
   * rettangolo che la contiene (lo fa già `buildListingWhere`, e l'indice su
   * latitudine e longitudine lo copre); il secondo tiene solo i punti davvero
   * dentro la forma. Solo allora si sa quanti sono i risultati, quindi la
   * pagina si ritaglia qui e non nel database.
   *
   * Con volumi da portale nazionale questo passaggio va spostato in PostGIS
   * (ST_Contains su una colonna geography con indice GiST): l'interfaccia
   * pubblica di questa funzione non cambia.
   */
  const candidates = await db.listing.findMany({
    where,
    orderBy,
    select: { id: true, latitude: true, longitude: true },
    take: AREA_SCAN_LIMIT,
  })

  const insideIds = candidates
    .filter(
      (c) =>
        c.latitude != null &&
        c.longitude != null &&
        containsPoint(area, [c.latitude, c.longitude] as LatLng),
    )
    .map((c) => c.id)

  const total = insideIds.length
  const pageIds = insideIds.slice((filters.pagina - 1) * PAGE_SIZE, filters.pagina * PAGE_SIZE)

  const rows = await db.listing.findMany({
    where: { id: { in: pageIds } },
    select: listingCardSelect,
  })

  // `IN` non conserva l'ordine: lo si rimette come stava dopo il ritaglio.
  const byId = new Map(rows.map((row) => [row.id, row]))
  const items = pageIds.map((id) => byId.get(id)).filter(Boolean) as ListingCard[]

  return {
    items,
    total,
    page: filters.pagina,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    areaScanned: candidates.length,
  }
}

/**
 * I segnaposti della mappa: non solo la pagina corrente, così muovendosi si
 * vede dove sono gli immobili anche oltre i primi ventiquattro.
 */
export async function listingPoints(filters: SearchFilters, take = 400) {
  const where = completeWhere(filters)
  const area = parseArea(filters)

  const rows = await db.listing.findMany({
    where: { ...where, latitude: { not: null }, longitude: { not: null } },
    orderBy: buildListingOrderBy(filters),
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      priceOnRequest: true,
      contract: true,
      latitude: true,
      longitude: true,
    },
    take,
  })

  return rows.filter(
    (row) =>
      !area ||
      (row.latitude != null &&
        row.longitude != null &&
        containsPoint(area, [row.latitude, row.longitude] as LatLng)),
  )
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
      ...(price ? { price: { gte: Math.round(price * 0.7), lte: Math.round(price * 1.3) } } : {}),
    },
    select: listingCardSelect,
    orderBy: { publishedAt: 'desc' },
    take: 4,
  })
}

export function getFeaturedListings(take = 8) {
  return db.listing.findMany({
    where: { status: 'PUBLISHED', featured: true, isAuction: false },
    select: listingCardSelect,
    orderBy: { publishedAt: 'desc' },
    take,
  })
}

export function getLatestListings(take = 8) {
  return db.listing.findMany({
    where: { status: 'PUBLISHED', isAuction: false },
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

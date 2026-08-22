import { Prisma, type ContractType, type PropertyType } from '@prisma/client'
import { z } from 'zod'
import { AMENITIES } from './labels'

/**
 * Un solo punto di verità per la ricerca.
 *
 *   URL (?contratto=vendita&comune=roma&prezzoMax=450000)
 *     -> parseSearchParams()  -> SearchFilters (tipizzato, validato)
 *     -> buildListingWhere()  -> Prisma.ListingWhereInput
 *
 * Server component, route API e ricerche salvate passano tutte di qui, così
 * i filtri non si sdoppiano fra pagina e endpoint.
 */

export const SORTS = {
  recenti: { publishedAt: 'desc' },
  'prezzo-asc': { price: 'asc' },
  'prezzo-desc': { price: 'desc' },
  'superficie-desc': { surface: 'desc' },
} satisfies Record<string, Prisma.ListingOrderByWithRelationInput>

export type SortKey = keyof typeof SORTS

export const SORT_LABELS: Record<SortKey, string> = {
  recenti: 'Più recenti',
  'prezzo-asc': 'Prezzo crescente',
  'prezzo-desc': 'Prezzo decrescente',
  'superficie-desc': 'Superficie',
}

export const PAGE_SIZE = 24

const CONTRACT_FROM_SLUG: Record<string, ContractType> = {
  vendita: 'SALE',
  affitto: 'RENT',
}

const TYPE_FROM_SLUG: Record<string, PropertyType> = {
  appartamento: 'APARTMENT',
  attico: 'ATTIC',
  villa: 'VILLA',
  villetta: 'TOWNHOUSE',
  loft: 'LOFT',
  stanza: 'ROOM',
  box: 'GARAGE',
  ufficio: 'OFFICE',
  negozio: 'SHOP',
  capannone: 'WAREHOUSE',
  terreno: 'LAND',
  stabile: 'BUILDING',
}

const intFromParam = z.coerce.number().int().positive().optional().catch(undefined)
const boolFromParam = z
  .enum(['1', 'true', 'si'])
  .optional()
  .catch(undefined)
  .transform((v) => (v ? true : undefined))

export const searchFiltersSchema = z.object({
  q: z.string().trim().min(1).max(120).optional().catch(undefined),
  contratto: z
    .string()
    .optional()
    .catch(undefined)
    .transform((v) => (v ? CONTRACT_FROM_SLUG[v] : undefined)),
  tipo: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .catch(undefined)
    .transform((v) => {
      const raw = v === undefined ? [] : Array.isArray(v) ? v : v.split(',')
      const types = raw.map((s) => TYPE_FROM_SLUG[s.trim()]).filter(Boolean) as PropertyType[]
      return types.length ? types : undefined
    }),
  comune: z.string().trim().min(1).max(80).optional().catch(undefined),
  provincia: z.string().trim().length(2).optional().catch(undefined),
  zona: z.string().trim().min(1).max(80).optional().catch(undefined),
  prezzoMin: intFromParam,
  prezzoMax: intFromParam,
  superficieMin: intFromParam,
  superficieMax: intFromParam,
  localiMin: intFromParam,
  bagniMin: intFromParam,
  ascensore: boolFromParam,
  giardino: boolFromParam,
  terrazzo: boolFromParam,
  balcone: boolFromParam,
  box: boolFromParam,
  cantina: boolFromParam,
  piscina: boolFromParam,
  aria: boolFromParam,
  arredato: z.enum(['FURNISHED', 'PARTIALLY', 'UNFURNISHED']).optional().catch(undefined),
  stato: z.enum(['NEW', 'RENOVATED', 'GOOD', 'TO_RENOVATE']).optional().catch(undefined),
  agenzia: z.string().trim().optional().catch(undefined),
  ordina: z
    .enum(['recenti', 'prezzo-asc', 'prezzo-desc', 'superficie-desc'])
    .default('recenti')
    .catch('recenti'),
  pagina: z.coerce.number().int().min(1).max(500).default(1).catch(1),
})

export type SearchFilters = z.infer<typeof searchFiltersSchema>

/** I nomi dei parametri booleani nell'URL, e la colonna che accendono. */
const AMENITY_PARAMS: Record<string, (typeof AMENITIES)[number]['key']> = {
  ascensore: 'elevator',
  giardino: 'garden',
  terrazzo: 'terrace',
  balcone: 'balcony',
  box: 'parking',
  cantina: 'cellar',
  piscina: 'pool',
  aria: 'airCon',
}

type RawParams = Record<string, string | string[] | undefined>

export function parseSearchParams(params: RawParams): SearchFilters {
  return searchFiltersSchema.parse(params)
}

/** Ricostruisce la query string canonica: serve ai link e alle ricerche salvate. */
export function buildSearchQuery(filters: Partial<Record<string, unknown>>): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '' || value === false) continue
    if (Array.isArray(value)) {
      if (value.length) sp.set(key, value.join(','))
      continue
    }
    sp.set(key, value === true ? '1' : String(value))
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

/** Traduce i filtri validati in una WHERE di Prisma. */
export function buildListingWhere(f: SearchFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: 'PUBLISHED' }
  const and: Prisma.ListingWhereInput[] = []

  if (f.contratto) where.contract = f.contratto
  if (f.tipo) where.type = { in: f.tipo }
  if (f.comune) where.city = { equals: f.comune, mode: 'insensitive' }
  if (f.provincia) where.province = { equals: f.provincia.toUpperCase() }
  if (f.zona) where.zone = { contains: f.zona, mode: 'insensitive' }
  if (f.agenzia) where.agency = { slug: f.agenzia }

  if (f.prezzoMin != null || f.prezzoMax != null) {
    where.price = {
      ...(f.prezzoMin != null ? { gte: f.prezzoMin } : {}),
      ...(f.prezzoMax != null ? { lte: f.prezzoMax } : {}),
    }
  }
  if (f.superficieMin != null || f.superficieMax != null) {
    where.surface = {
      ...(f.superficieMin != null ? { gte: f.superficieMin } : {}),
      ...(f.superficieMax != null ? { lte: f.superficieMax } : {}),
    }
  }
  if (f.localiMin != null) where.rooms = { gte: f.localiMin }
  if (f.bagniMin != null) where.bathrooms = { gte: f.bagniMin }
  if (f.arredato) where.furnished = f.arredato
  if (f.stato) where.condition = f.stato

  for (const [param, column] of Object.entries(AMENITY_PARAMS)) {
    if (f[param as keyof SearchFilters]) and.push({ [column]: true })
  }

  // Ricerca libera: titolo, descrizione, comune, zona, indirizzo.
  if (f.q) {
    and.push({
      OR: [
        { title: { contains: f.q, mode: 'insensitive' } },
        { description: { contains: f.q, mode: 'insensitive' } },
        { city: { contains: f.q, mode: 'insensitive' } },
        { zone: { contains: f.q, mode: 'insensitive' } },
        { addressLine: { contains: f.q, mode: 'insensitive' } },
      ],
    })
  }

  if (and.length) where.AND = and
  return where
}

export function buildListingOrderBy(f: SearchFilters): Prisma.ListingOrderByWithRelationInput[] {
  // In vetrina prima gli annunci in evidenza, poi l'ordinamento scelto.
  return [{ featured: 'desc' }, SORTS[f.ordina]]
}

/** Riassunto leggibile dei filtri attivi: titolo pagina, chip, ricerche salvate. */
export function describeFilters(f: SearchFilters): string {
  const parts: string[] = []
  if (f.contratto) parts.push(f.contratto === 'SALE' ? 'in vendita' : 'in affitto')
  if (f.comune) parts.push(`a ${f.comune}`)
  if (f.zona) parts.push(`zona ${f.zona}`)
  if (f.prezzoMax) parts.push(`fino a ${f.prezzoMax.toLocaleString('it-IT')} euro`)
  return parts.join(' ')
}

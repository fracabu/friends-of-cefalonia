import { Prisma, type ContractType, type EnergyClass, type PropertyType } from '@prisma/client'
import { z } from 'zod'
import { areaBounds, decodePolyline, type Area, type LatLng } from './geo'
import { interpola } from '@/i18n'
import type { Dizionario } from '@/i18n'

/**
 * Un solo punto di verità per la ricerca.
 *
 *   URL (?contratto=vendita&comune=roma&prezzoMax=450000&area=_p~iF~ps|U…)
 *     -> parseSearchParams()  -> SearchFilters (tipizzato, validato)
 *     -> buildListingWhere()  -> Prisma.ListingWhereInput
 *     -> parseArea()          -> il filtro geografico, applicato a parte
 *
 * Pagina di ricerca, route API e ricerche salvate passano tutte di qui: un
 * filtro nuovo si aggiunge in questo file e vale ovunque.
 */

export const SORTS = {
  rilevanza: { publishedAt: 'desc' },
  recenti: { publishedAt: 'desc' },
  'prezzo-asc': { price: 'asc' },
  'prezzo-desc': { price: 'desc' },
  'superficie-desc': { surface: 'desc' },
  'superficie-asc': { surface: 'asc' },
} satisfies Record<string, Prisma.ListingOrderByWithRelationInput>

export type SortKey = keyof typeof SORTS

export const PAGE_SIZE = 24

/** Le classi energetiche dalla migliore alla peggiore: serve per «almeno C». */
export const ENERGY_ORDER: EnergyClass[] = [
  'A4',
  'A3',
  'A2',
  'A1',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
]

const CONTRACT_FROM_SLUG: Record<string, ContractType> = {
  vendita: 'SALE',
  affitto: 'RENT',
}

const TYPE_FROM_SLUG: Record<string, PropertyType> = {
  appartamento: 'APARTMENT',
  attico: 'ATTIC',
  villa: 'VILLA',
  casa: 'TOWNHOUSE',
  loft: 'LOFT',
  stanza: 'ROOM',
  box: 'GARAGE',
  ufficio: 'OFFICE',
  negozio: 'SHOP',
  capannone: 'WAREHOUSE',
  terreno: 'LAND',
  stabile: 'BUILDING',
}

const positiveInt = z.coerce.number().int().positive().optional().catch(undefined)
const anyInt = z.coerce.number().int().optional().catch(undefined)

/** Un interruttore acceso nell'URL: ?ascensore=1 */
const flag = z
  .enum(['1', 'true', 'si'])
  .optional()
  .catch(undefined)
  .transform((v) => (v ? true : undefined))

/** Liste separate da virgola: ?comune=roma,fiumicino */
const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .catch(undefined)
  .transform((v) => {
    const raw = v === undefined ? [] : Array.isArray(v) ? v : v.split(',')
    const values = raw.map((s) => s.trim()).filter(Boolean)
    return values.length ? values : undefined
  })

export const searchFiltersSchema = z.object({
  // --- dove ---------------------------------------------------------------
  q: z.string().trim().min(1).max(120).optional().catch(undefined),
  comune: csv,
  zona: csv,
  provincia: z.string().trim().length(2).optional().catch(undefined),
  regione: z.string().trim().min(2).max(40).optional().catch(undefined),
  /** Poligono disegnato sulla mappa, in polyline compressa. */
  area: z.string().trim().min(4).max(4000).optional().catch(undefined),
  /** Centro del raggio: "41.9028,12.4964". */
  centro: z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
    .optional()
    .catch(undefined),
  raggio: z.coerce.number().min(0.2).max(100).optional().catch(undefined),
  /** Riquadro visibile: "sud,ovest,nord,est". */
  bbox: z
    .string()
    .trim()
    .regex(/^(-?\d+(\.\d+)?,){3}-?\d+(\.\d+)?$/)
    .optional()
    .catch(undefined),

  // --- cosa ---------------------------------------------------------------
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

  // --- prezzo -------------------------------------------------------------
  prezzoMin: positiveInt,
  prezzoMax: positiveInt,
  speseIncluse: flag,
  cauzioneMax: positiveInt,
  trattativaRiservata: flag,

  // --- consistenza --------------------------------------------------------
  superficieMin: positiveInt,
  superficieMax: positiveInt,
  localiMin: positiveInt,
  localiMax: positiveInt,
  cameremin: positiveInt,
  bagniMin: positiveInt,
  pianoMin: anyInt,
  pianoMax: anyInt,
  pianoTerra: flag,
  ultimoPiano: flag,
  annoMin: positiveInt,
  annoMax: positiveInt,

  // --- dotazioni ----------------------------------------------------------
  ascensore: flag,
  giardino: flag,
  terrazzo: flag,
  balcone: flag,
  box: flag,
  cantina: flag,
  piscina: flag,
  aria: flag,
  animali: flag,

  // --- caratteristiche ----------------------------------------------------
  arredato: z.enum(['FURNISHED', 'PARTIALLY', 'UNFURNISHED']).optional().catch(undefined),
  stato: z.enum(['NEW', 'RENOVATED', 'GOOD', 'TO_RENOVATE']).optional().catch(undefined),
  riscaldamento: z.enum(['AUTONOMOUS', 'CENTRALIZED', 'ABSENT']).optional().catch(undefined),
  classeMin: z.enum(ENERGY_ORDER as [EnergyClass, ...EnergyClass[]]).optional().catch(undefined),
  proprieta: z.enum(['FULL', 'BARE', 'SHARED']).optional().catch(undefined),
  disponibilita: z.enum(['FREE', 'OCCUPIED', 'RENTED']).optional().catch(undefined),

  // --- annuncio -----------------------------------------------------------
  /** Le aste stanno in una sezione a parte: fuori dai risultati normali. */
  asta: flag,
  nuovaCostruzione: flag,
  conFoto: flag,
  planimetria: flag,
  virtualTour: flag,
  /** Pubblicati negli ultimi N giorni. */
  pubblicatoDa: z.coerce.number().int().min(1).max(365).optional().catch(undefined),
  inserzionista: z.enum(['agenzia', 'privato']).optional().catch(undefined),
  agenzia: z.string().trim().optional().catch(undefined),
  rif: z.string().trim().max(40).optional().catch(undefined),

  // --- presentazione ------------------------------------------------------
  ordina: z
    .enum([
      'rilevanza',
      'recenti',
      'prezzo-asc',
      'prezzo-desc',
      'superficie-desc',
      'superficie-asc',
    ])
    .default('rilevanza')
    .catch('rilevanza'),
  pagina: z.coerce.number().int().min(1).max(500).default(1).catch(1),
})

export type SearchFilters = z.infer<typeof searchFiltersSchema>

type RawParams = Record<string, string | string[] | undefined>

export function parseSearchParams(params: RawParams): SearchFilters {
  return searchFiltersSchema.parse(params)
}

/** I parametri booleani dell'URL e la colonna che accendono. */
const AMENITY_PARAMS = {
  ascensore: 'elevator',
  giardino: 'garden',
  terrazzo: 'terrace',
  balcone: 'balcony',
  box: 'parking',
  cantina: 'cellar',
  piscina: 'pool',
  aria: 'airCon',
} as const

/** Ricostruisce la query string canonica: link, paginazione, ricerche salvate. */
export function buildSearchQuery(filters: Record<string, unknown>): string {
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

// ------------------------------------------------------------ geografia ----

/** Ricava dall'URL l'area di ricerca: poligono, raggio o riquadro. */
export function parseArea(f: SearchFilters): Area | null {
  if (f.area) {
    const points = decodePolyline(f.area)
    if (points.length >= 3) return { kind: 'polygon', points }
  }

  if (f.centro && f.raggio) {
    const [lat, lng] = f.centro.split(',').map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { kind: 'circle', center: [lat, lng] as LatLng, radiusKm: f.raggio }
    }
  }

  if (f.bbox) {
    const [south, west, north, east] = f.bbox.split(',').map(Number)
    if ([south, west, north, east].every(Number.isFinite)) {
      return { kind: 'bounds', bounds: { south, west, north, east } }
    }
  }

  return null
}

// ------------------------------------------------------------- query -------

export function buildListingWhere(f: SearchFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: 'PUBLISHED' }
  const and: Prisma.ListingWhereInput[] = []

  if (f.contratto) where.contract = f.contratto
  if (f.tipo) where.type = { in: f.tipo }

  // Dove
  if (f.comune) where.city = { in: f.comune, mode: 'insensitive' }
  if (f.zona) where.zone = { in: f.zona, mode: 'insensitive' }
  if (f.provincia) where.province = f.provincia.toUpperCase()
  if (f.regione) where.region = { equals: f.regione, mode: 'insensitive' }

  // Prezzo
  if (f.prezzoMin != null || f.prezzoMax != null) {
    where.price = {
      ...(f.prezzoMin != null ? { gte: f.prezzoMin } : {}),
      ...(f.prezzoMax != null ? { lte: f.prezzoMax } : {}),
    }
  }
  if (f.speseIncluse) where.utilitiesIncluded = true
  if (f.cauzioneMax != null) where.deposit = { lte: f.cauzioneMax }
  if (f.trattativaRiservata) where.priceOnRequest = true

  // Consistenza
  if (f.superficieMin != null || f.superficieMax != null) {
    where.surface = {
      ...(f.superficieMin != null ? { gte: f.superficieMin } : {}),
      ...(f.superficieMax != null ? { lte: f.superficieMax } : {}),
    }
  }
  if (f.localiMin != null || f.localiMax != null) {
    where.rooms = {
      ...(f.localiMin != null ? { gte: f.localiMin } : {}),
      ...(f.localiMax != null ? { lte: f.localiMax } : {}),
    }
  }
  if (f.cameremin != null) where.bedrooms = { gte: f.cameremin }
  if (f.bagniMin != null) where.bathrooms = { gte: f.bagniMin }
  if (f.annoMin != null || f.annoMax != null) {
    where.yearBuilt = {
      ...(f.annoMin != null ? { gte: f.annoMin } : {}),
      ...(f.annoMax != null ? { lte: f.annoMax } : {}),
    }
  }

  // Piano: l'intervallo, oppure le due scorciatoie che usano tutti.
  if (f.pianoMin != null || f.pianoMax != null) {
    where.floor = {
      ...(f.pianoMin != null ? { gte: f.pianoMin } : {}),
      ...(f.pianoMax != null ? { lte: f.pianoMax } : {}),
    }
  }
  if (f.pianoTerra) and.push({ floor: 0 })
  // «Ultimo piano» confronta due colonne fra loro: si aggiunge in
  // lib/listings.ts, dove c'è il client Prisma che sa fare quel riferimento.

  // Caratteristiche
  if (f.arredato) where.furnished = f.arredato
  if (f.stato) where.condition = f.stato
  if (f.riscaldamento) where.heating = f.riscaldamento
  if (f.proprieta) where.ownership = f.proprieta
  if (f.disponibilita) where.availability = f.disponibilita
  if (f.animali) where.petsAllowed = true
  if (f.classeMin) {
    const limit = ENERGY_ORDER.indexOf(f.classeMin)
    where.energy = { in: ENERGY_ORDER.slice(0, limit + 1) }
  }

  for (const [param, column] of Object.entries(AMENITY_PARAMS)) {
    if (f[param as keyof SearchFilters]) and.push({ [column]: true })
  }

  // Annuncio. Le aste restano fuori finché non si chiedono: chi cerca casa non
  // vuole trovarsi in mezzo ai risultati un immobile con procedura in corso.
  where.isAuction = f.asta ? true : false
  if (f.nuovaCostruzione) where.isNewBuild = true
  if (f.planimetria) where.hasFloorPlan = true
  if (f.virtualTour) where.virtualTourUrl = { not: null }
  if (f.conFoto) and.push({ images: { some: {} } })
  if (f.inserzionista === 'agenzia') where.agencyId = { not: null }
  if (f.inserzionista === 'privato') where.agencyId = null
  if (f.agenzia) where.agency = { slug: f.agenzia }
  if (f.rif) where.reference = { equals: f.rif, mode: 'insensitive' }
  if (f.pubblicatoDa != null) {
    where.publishedAt = { gte: new Date(Date.now() - f.pubblicatoDa * 86_400_000) }
  }

  // Il rettangolo che contiene l'area disegnata: sfrutta l'indice su
  // (latitude, longitude). La forma esatta si applica dopo, in memoria.
  const area = parseArea(f)
  if (area) {
    const { south, west, north, east } = areaBounds(area)
    and.push({
      latitude: { gte: south, lte: north },
      longitude: { gte: west, lte: east },
    })
  }

  // Ricerca libera su titolo, descrizione, comune, zona e indirizzo.
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
  // «Rilevanza» mette davanti gli annunci in evidenza; gli altri ordinamenti
  // sono espliciti e vanno rispettati alla lettera.
  return f.ordina === 'rilevanza'
    ? [{ featured: 'desc' }, { publishedAt: 'desc' }]
    : [SORTS[f.ordina]]
}

// ------------------------------------------------------------ etichette ----

/** Come si chiama l'area scelta, nella lingua di chi guarda. */
export function descriviArea(area: Area, d: Dizionario): string {
  if (area.kind === 'polygon') return d.mappa.areaDisegnata
  if (area.kind === 'circle') return interpola(d.mappa.areaRaggio, { n: area.radiusKm })
  return d.mappa.areaVista
}

/** Riassunto leggibile: titolo della pagina e nome proposto per la ricerca salvata. */
export function describeFilters(f: SearchFilters, d: Dizionario): string {
  const parts: string[] = []
  if (f.contratto) parts.push(d.et.contratto[f.contratto].toLowerCase())
  if (f.comune) parts.push(f.comune.join(', '))
  if (f.zona) parts.push(f.zona.join(', '))

  const area = parseArea(f)
  if (area && !f.comune) parts.push(descriviArea(area, d).toLowerCase())

  return parts.join(' · ')
}

/** I filtri attivi come chip richiudibili: chiave da togliere ed etichetta. */
export function activeFilterChips(
  f: SearchFilters,
  d: Dizionario,
  formattaPrezzo: (valore: number) => string,
): Array<{ param: string; label: string }> {
  const chips: Array<{ param: string; label: string }> = []
  const push = (param: string, label: string) => chips.push({ param, label })

  if (f.q) push('q', `«${f.q}»`)
  if (f.comune) push('comune', f.comune.join(', '))
  if (f.zona) push('zona', f.zona.join(', '))
  if (f.tipo) push('tipo', f.tipo.map((t) => d.et.tipo[t]).join(', '))
  if (f.prezzoMin) push('prezzoMin', `${d.ricerca.prezzoMin}: ${formattaPrezzo(f.prezzoMin)}`)
  if (f.prezzoMax) push('prezzoMax', `${d.ricerca.prezzoMax}: ${formattaPrezzo(f.prezzoMax)}`)
  if (f.superficieMin) push('superficieMin', `${d.ricerca.superficieMin}: ${f.superficieMin} m²`)
  if (f.superficieMax) push('superficieMax', `${d.ricerca.superficieMax}: ${f.superficieMax} m²`)
  if (f.localiMin) push('localiMin', `${d.ricerca.localiDa} ${f.localiMin}`)
  if (f.localiMax) push('localiMax', `${d.ricerca.localiA} ${f.localiMax}`)
  if (f.cameremin) push('cameremin', `${d.annuncio.camere}: ${f.cameremin}+`)
  if (f.bagniMin) push('bagniMin', `${d.annuncio.bagni}: ${f.bagniMin}+`)
  if (f.pianoTerra) push('pianoTerra', d.ricerca.soloPianoTerra)
  if (f.ultimoPiano) push('ultimoPiano', d.ricerca.soloUltimoPiano)
  if (f.annoMin) push('annoMin', `${d.ricerca.annoDa} ${f.annoMin}`)
  if (f.annoMax) push('annoMax', `${d.ricerca.annoA} ${f.annoMax}`)
  if (f.classeMin) push('classeMin', `${d.annuncio.classe} ${f.classeMin}+`)
  if (f.riscaldamento) push('riscaldamento', d.et.riscaldamento[f.riscaldamento])
  if (f.arredato) push('arredato', d.et.arredamento[f.arredato])
  if (f.stato) push('stato', d.et.condizione[f.stato])
  if (f.proprieta) push('proprieta', d.et.proprieta[f.proprieta])
  if (f.disponibilita) push('disponibilita', d.et.disponibilita[f.disponibilita])
  if (f.asta) push('asta', d.ricerca.aste)
  if (f.nuovaCostruzione) push('nuovaCostruzione', d.ricerca.nuovaCostruzione)
  if (f.conFoto) push('conFoto', d.ricerca.conFoto)
  if (f.planimetria) push('planimetria', d.ricerca.conPlanimetria)
  if (f.virtualTour) push('virtualTour', d.ricerca.conTour)
  if (f.speseIncluse) push('speseIncluse', d.ricerca.speseIncluse)
  if (f.trattativaRiservata) push('trattativaRiservata', d.ricerca.soloRiservate)
  if (f.pubblicatoDa) push('pubblicatoDa', `${d.ricerca.pubblicatoDa} ${f.pubblicatoDa}`)
  if (f.inserzionista)
    push('inserzionista', f.inserzionista === 'agenzia' ? d.ricerca.agenzieOpz : d.ricerca.privatiOpz)
  if (f.rif) push('rif', `${d.ricerca.riferimento} ${f.rif}`)

  const dotazioni: Record<string, keyof Dizionario['et']['dotazione']> = {
    ascensore: 'elevator',
    giardino: 'garden',
    terrazzo: 'terrace',
    balcone: 'balcony',
    box: 'parking',
    cantina: 'cellar',
    piscina: 'pool',
    aria: 'airCon',
    animali: 'pets',
  }
  for (const [param, chiave] of Object.entries(dotazioni)) {
    if (f[param as keyof SearchFilters]) push(param, d.et.dotazione[chiave])
  }

  const area = parseArea(f)
  if (area) {
    push(
      area.kind === 'polygon' ? 'area' : area.kind === 'circle' ? 'centro' : 'bbox',
      descriviArea(area, d),
    )
  }

  return chips
}

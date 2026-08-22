import { z } from 'zod'

// Gli stessi schemi valgono per le Server Action e per le route API:
// una regola scritta due volte è una regola che prima o poi diverge.

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Il nome è troppo corto').max(80),
    email: z.string().trim().toLowerCase().email('Indirizzo email non valido'),
    password: z.string().min(8, 'La password deve avere almeno 8 caratteri').max(200),
    phone: z.string().trim().max(30).optional().or(z.literal('')),
    role: z.enum(['USER', 'AGENT']).default('USER'),
    agencyName: z.string().trim().max(120).optional().or(z.literal('')),
  })
  .refine((data) => data.role !== 'AGENT' || Boolean(data.agencyName), {
    message: "Indica il nome dell'agenzia",
    path: ['agencyName'],
  })

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Indirizzo email non valido'),
  password: z.string().min(1, 'Inserisci la password'),
})

export const leadSchema = z.object({
  listingId: z.string().min(1),
  name: z.string().trim().min(2, 'Inserisci il tuo nome').max(80),
  email: z.string().trim().toLowerCase().email('Indirizzo email non valido'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Scrivi almeno una riga').max(2000),
  privacy: z.literal('on', { errorMap: () => ({ message: "Serve il consenso al trattamento dei dati" }) }),
})

// I moduli HTML mandano stringhe vuote dove il database vuole NULL, e "on"
// dove vuole un booleano. La traduzione si fa qui, una volta per tutte, così
// l'output dello schema entra in Prisma senza altri passaggi.
const nullIfEmpty = (value: unknown) => (value === '' || value === undefined ? null : value)

const text = (max: number) => z.preprocess(nullIfEmpty, z.string().trim().max(max).nullable())

const optInt = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
  z.number().int().nullable(),
)

const optFloat = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
  z.number().nullable(),
)

const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(nullIfEmpty, z.enum(values).nullable())

const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean())

export const listingSchema = z.object({
  title: z.string().trim().min(10, 'Il titolo è troppo corto').max(140),
  description: z.string().trim().min(40, 'Descrivi l’immobile in almeno qualche riga').max(8000),
  contract: z.enum(['SALE', 'RENT']),
  type: z.enum([
    'APARTMENT',
    'ATTIC',
    'VILLA',
    'TOWNHOUSE',
    'LOFT',
    'ROOM',
    'GARAGE',
    'OFFICE',
    'SHOP',
    'WAREHOUSE',
    'LAND',
    'BUILDING',
  ]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'RESERVED', 'SOLD', 'RENTED', 'ARCHIVED']).default('DRAFT'),

  price: optInt,
  priceOnRequest: checkbox,
  condoFees: optInt,
  deposit: optInt,

  surface: z.coerce.number().int().positive('La superficie è obbligatoria'),
  rooms: z.coerce.number().int().min(1).max(30),
  bedrooms: optInt,
  bathrooms: optInt,
  floor: optInt,
  totalFloors: optInt,
  yearBuilt: optInt,

  elevator: checkbox,
  garden: checkbox,
  terrace: checkbox,
  balcony: checkbox,
  parking: checkbox,
  cellar: checkbox,
  pool: checkbox,
  airCon: checkbox,

  furnished: optEnum(['FURNISHED', 'PARTIALLY', 'UNFURNISHED'] as const),
  condition: optEnum(['NEW', 'RENOVATED', 'GOOD', 'TO_RENOVATE'] as const),
  heating: optEnum(['AUTONOMOUS', 'CENTRALIZED', 'ABSENT'] as const),
  energy: optEnum([
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
    'EXEMPT',
    'PENDING',
  ] as const),

  isAuction: checkbox,
  isNewBuild: checkbox,
  hasFloorPlan: checkbox,
  utilitiesIncluded: checkbox,
  virtualTourUrl: text(400),
  availability: optEnum(['FREE', 'OCCUPIED', 'RENTED'] as const),
  ownership: z
    .preprocess((v) => (v === '' || v === undefined ? 'FULL' : v), z.enum(['FULL', 'BARE', 'SHARED']))
    .default('FULL'),
  petsAllowed: checkbox,

  addressLine: text(160),
  hideAddress: checkbox,
  city: z.string().trim().min(2, 'Indica il comune').max(80),
  province: z.string().trim().length(2, 'Sigla di due lettere, per esempio RM').toUpperCase(),
  region: z.string().trim().min(2).max(40),
  postalCode: text(10),
  zone: text(80),
  latitude: optFloat,
  longitude: optFloat,

  features: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) =>
      (Array.isArray(v) ? v : (v ?? '').split(','))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
})

export const savedSearchSchema = z.object({
  name: z.string().trim().min(2).max(80),
  query: z.string().max(2000),
  frequency: z.enum(['NONE', 'INSTANT', 'DAILY', 'WEEKLY']).default('DAILY'),
})

export type ListingInput = z.infer<typeof listingSchema>
export type RegisterInput = z.infer<typeof registerSchema>

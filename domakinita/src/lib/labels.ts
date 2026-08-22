import type { PropertyType } from '@prisma/client'

/**
 * Quello che resta qui non sono etichette da leggere — quelle stanno nei
 * dizionari, una per lingua — ma le chiavi tecniche: i segmenti che una
 * tipologia occupa nell'URL e i nomi delle colonne delle dotazioni.
 */

/** Segmento nell'URL: /cerca?tipo=villa */
export const PROPERTY_TYPE_SLUGS: Record<PropertyType, string> = {
  APARTMENT: 'appartamento',
  ATTIC: 'attico',
  VILLA: 'villa',
  TOWNHOUSE: 'casa',
  LOFT: 'loft',
  ROOM: 'stanza',
  GARAGE: 'box',
  OFFICE: 'ufficio',
  SHOP: 'negozio',
  WAREHOUSE: 'capannone',
  LAND: 'terreno',
  BUILDING: 'stabile',
}

/** Le dotazioni filtrabili: la colonna nel database è anche la chiave del dizionario. */
export const AMENITIES = [
  { key: 'elevator' },
  { key: 'garden' },
  { key: 'terrace' },
  { key: 'balcony' },
  { key: 'parking' },
  { key: 'cellar' },
  { key: 'pool' },
  { key: 'airCon' },
] as const

export type AmenityKey = (typeof AMENITIES)[number]['key']

/** Le classi energetiche, dalla migliore alla peggiore, come le scrive il certificato. */
export const ENERGY_LABELS = {
  A4: 'A4',
  A3: 'A3',
  A2: 'A2',
  A1: 'A1',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  EXEMPT: '—',
  PENDING: '…',
} as const

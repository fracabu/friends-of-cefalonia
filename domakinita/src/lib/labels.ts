import type {
  Availability,
  ContractType,
  EnergyClass,
  FurnishedState,
  HeatingType,
  LeadStatus,
  ListingStatus,
  OwnershipType,
  PropertyCondition,
  PropertyType,
} from '@prisma/client'

// Un solo posto dove il dominio parla italiano. I componenti non scrivono
// mai "Appartamento" a mano: leggono da qui.

export const CONTRACT_LABELS: Record<ContractType, string> = {
  SALE: 'Vendita',
  RENT: 'Affitto',
}

/** Segmento di URL per il contratto: /cerca?contratto=vendita */
export const CONTRACT_SLUGS: Record<ContractType, string> = {
  SALE: 'vendita',
  RENT: 'affitto',
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: 'Appartamento',
  ATTIC: 'Attico',
  VILLA: 'Villa',
  TOWNHOUSE: 'Casa indipendente',
  LOFT: 'Loft',
  ROOM: 'Stanza',
  GARAGE: 'Box / posto auto',
  OFFICE: 'Ufficio',
  SHOP: 'Negozio',
  WAREHOUSE: 'Capannone',
  LAND: 'Terreno edificabile',
  BUILDING: 'Stabile',
}

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

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: 'Bozza',
  PUBLISHED: 'Pubblicato',
  RESERVED: 'Sotto proposta',
  SOLD: 'Venduto',
  RENTED: 'Affittato',
  ARCHIVED: 'Archiviato',
}

export const CONDITION_LABELS: Record<PropertyCondition, string> = {
  NEW: 'Nuovo / in costruzione',
  RENOVATED: 'Ristrutturato',
  GOOD: 'Buono / abitabile',
  TO_RENOVATE: 'Da ristrutturare',
}

export const HEATING_LABELS: Record<HeatingType, string> = {
  AUTONOMOUS: 'Autonomo',
  CENTRALIZED: 'Centralizzato',
  ABSENT: 'Assente',
}

export const FURNISHED_LABELS: Record<FurnishedState, string> = {
  FURNISHED: 'Arredato',
  PARTIALLY: 'Parzialmente arredato',
  UNFURNISHED: 'Non arredato',
}

export const ENERGY_LABELS: Record<EnergyClass, string> = {
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
  EXEMPT: 'Esente',
  PENDING: 'In attesa',
}

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  FREE: 'Libero',
  OCCUPIED: 'Occupato',
  RENTED: 'Affittato, a reddito',
}

export const OWNERSHIP_LABELS: Record<OwnershipType, string> = {
  FULL: 'Intera proprietà',
  BARE: 'Nuda proprietà',
  SHARED: 'Multiproprietà',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Nuova',
  CONTACTED: 'Ricontattato',
  SCHEDULED: 'Visita fissata',
  CLOSED: 'Chiusa',
  SPAM: 'Spam',
}

/** Le dotazioni filtrabili: chiave nel DB, etichetta, icona testuale. */
export const AMENITIES = [
  { key: 'elevator', label: 'Ascensore' },
  { key: 'garden', label: 'Giardino' },
  { key: 'terrace', label: 'Terrazzo' },
  { key: 'balcony', label: 'Balcone' },
  { key: 'parking', label: 'Box / posto auto' },
  { key: 'cellar', label: 'Cantina' },
  { key: 'pool', label: 'Piscina' },
  { key: 'airCon', label: 'Aria condizionata' },
] as const

export type AmenityKey = (typeof AMENITIES)[number]['key']

/** Numero di locali come lo scrive un annuncio: 1 = monolocale. */
export function roomsLabel(rooms: number) {
  const names = ['', 'Monolocale', 'Bilocale', 'Trilocale', 'Quadrilocale', 'Cinque locali']
  return names[rooms] ?? `${rooms} locali`
}

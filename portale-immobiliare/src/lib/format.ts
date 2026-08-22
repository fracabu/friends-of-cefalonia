const euro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('it-IT')

export function formatPrice(price: number | null | undefined, onRequest = false) {
  if (onRequest || price == null) return 'Trattativa riservata'
  return euro.format(price)
}

export function formatMonthlyPrice(price: number | null | undefined, onRequest = false) {
  if (onRequest || price == null) return 'Trattativa riservata'
  return `${euro.format(price)}/mese`
}

export function formatSurface(surface: number) {
  return `${number.format(surface)} m²`
}

export function formatPricePerSqm(price: number | null, surface: number) {
  if (!price || !surface) return null
  return `${euro.format(Math.round(price / surface))}/m²`
}

export function formatFloor(floor: number | null | undefined, totalFloors?: number | null) {
  if (floor == null) return null
  const label =
    floor < 0 ? 'Seminterrato' : floor === 0 ? 'Piano terra' : `${number.format(floor)}° piano`
  return totalFloors ? `${label} di ${totalFloors}` : label
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(new Date(date))
}

/** "3 giorni fa", per la data di pubblicazione in scheda. */
export function formatRelative(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days <= 0) return 'oggi'
  if (days === 1) return 'ieri'
  if (days < 30) return `${days} giorni fa`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${months === 1 ? 'mese' : 'mesi'} fa`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'anno' : 'anni'} fa`
}

import { CODICI_HTML, LINGUA_PREDEFINITA, type Lingua } from '@/i18n/config'

/**
 * Numeri, prezzi e date nella lingua di chi guarda.
 *
 * Intl fa quasi tutto: separatori, valuta e distanze nel tempo cambiano da soli
 * col codice della lingua. Restano da fuori solo le parole del dominio —
 * «trattativa riservata», «al mese» — che arrivano dal dizionario.
 */

/*
 * `useGrouping: 'always'` non è un vezzo tipografico. In italiano i numeri di
 * quattro cifre si raggruppano o no a seconda della versione di CLDR: Node
 * scriveva «2590 m²» e il browser «2.590 m²», e React se ne accorgeva a ogni
 * idratazione. Imponendo il raggruppamento le due parti dicono la stessa cosa.
 */
const cacheValuta = new Map<Lingua, Intl.NumberFormat>()
const cacheNumeri = new Map<Lingua, Intl.NumberFormat>()

function valuta(lingua: Lingua) {
  let f = cacheValuta.get(lingua)
  if (!f) {
    f = new Intl.NumberFormat(CODICI_HTML[lingua], {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      useGrouping: 'always',
    })
    cacheValuta.set(lingua, f)
  }
  return f
}

function numeri(lingua: Lingua) {
  let f = cacheNumeri.get(lingua)
  if (!f) {
    f = new Intl.NumberFormat(CODICI_HTML[lingua], { useGrouping: 'always' })
    cacheNumeri.set(lingua, f)
  }
  return f
}

export function formatPrice(
  price: number | null | undefined,
  onRequest = false,
  lingua: Lingua = LINGUA_PREDEFINITA,
  riservata = 'Trattativa riservata',
) {
  if (onRequest || price == null) return riservata
  return valuta(lingua).format(price)
}

export function formatMonthlyPrice(
  price: number | null | undefined,
  onRequest = false,
  lingua: Lingua = LINGUA_PREDEFINITA,
  riservata = 'Trattativa riservata',
  alMese = '/mese',
) {
  if (onRequest || price == null) return riservata
  return `${valuta(lingua).format(price)}${alMese}`
}

export function formatSurface(surface: number, lingua: Lingua = LINGUA_PREDEFINITA) {
  return `${numeri(lingua).format(surface)} m²`
}

export function formatNumber(valore: number, lingua: Lingua = LINGUA_PREDEFINITA) {
  return numeri(lingua).format(valore)
}

export function formatPricePerSqm(
  price: number | null,
  surface: number,
  lingua: Lingua = LINGUA_PREDEFINITA,
) {
  if (!price || !surface) return null
  return `${valuta(lingua).format(Math.round(price / surface))}/m²`
}

/** Il piano come lo scrive un annuncio, con le parole della lingua scelta. */
export function formatFloor(
  floor: number | null | undefined,
  totalFloors: number | null | undefined,
  etichette: { pianoTerra: string; seminterrato: string; pianoN: string; pianoDi: string },
  lingua: Lingua = LINGUA_PREDEFINITA,
) {
  if (floor == null) return null

  const label =
    floor < 0
      ? etichette.seminterrato
      : floor === 0
        ? etichette.pianoTerra
        : etichette.pianoN.replace('{n}', numeri(lingua).format(floor))

  return totalFloors ? `${label} ${etichette.pianoDi} ${totalFloors}` : label
}

export function formatDate(date: Date | string, lingua: Lingua = LINGUA_PREDEFINITA) {
  return new Intl.DateTimeFormat(CODICI_HTML[lingua], { dateStyle: 'medium' }).format(new Date(date))
}

/** «3 giorni fa», «3 days ago», «πριν από 3 ημέρες»: lo sa fare Intl. */
export function formatRelative(date: Date | string, lingua: Lingua = LINGUA_PREDEFINITA) {
  const giorni = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
  const rtf = new Intl.RelativeTimeFormat(CODICI_HTML[lingua], { numeric: 'auto' })

  if (giorni < 1) return rtf.format(0, 'day')
  if (giorni < 30) return rtf.format(-giorni, 'day')
  if (giorni < 365) return rtf.format(-Math.floor(giorni / 30), 'month')
  return rtf.format(-Math.floor(giorni / 365), 'year')
}

/**
 * Le tre lingue del portale.
 *
 * L'italiano è quella di partenza — il pubblico principale sono gli italiani
 * che comprano nelle Ionie — ma un venditore di Argostoli legge il greco e un
 * compratore del nord Europa l'inglese: senza le altre due, metà del mercato
 * non entra nemmeno.
 */

export const LINGUE = ['it', 'en', 'el'] as const

export type Lingua = (typeof LINGUE)[number]

export const LINGUA_PREDEFINITA: Lingua = 'it'

/** Come la lingua si chiama nella lingua stessa: mai «Italiano» in inglese. */
export const NOMI_LINGUA: Record<Lingua, string> = {
  it: 'Italiano',
  en: 'English',
  el: 'Ελληνικά',
}

/** Il codice per l'attributo lang, per Intl e per gli hreflang. */
export const CODICI_HTML: Record<Lingua, string> = {
  it: 'it-IT',
  en: 'en-GB',
  el: 'el-GR',
}

export function isLingua(valore: string | null | undefined): valore is Lingua {
  return LINGUE.includes(valore as Lingua)
}

/** Una lingua valida comunque, anche da un valore incerto o assente. */
export function linguaSicura(valore: string | null | undefined): Lingua {
  return isLingua(valore) ? valore : LINGUA_PREDEFINITA
}

/** Antepone la lingua a un percorso interno: percorso('el', '/cerca') -> '/el/cerca' */
export function percorso(lingua: Lingua, path = '/') {
  return path === '/' ? `/${lingua}` : `/${lingua}${path}`
}

/**
 * Sceglie la lingua dall'intestazione del browser.
 * Il greco è indicato come `el`, ma qualche browser manda ancora `gr`.
 */
export function linguaDaHeader(header: string | null): Lingua {
  if (!header) return LINGUA_PREDEFINITA

  const preferenze = header
    .split(',')
    .map((parte) => {
      const [codice, q] = parte.trim().split(';q=')
      return { codice: codice.toLowerCase(), peso: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.peso - a.peso)

  for (const { codice } of preferenze) {
    const radice = codice.split('-')[0]
    if (radice === 'gr') return 'el'
    if (isLingua(radice)) return radice
  }

  return LINGUA_PREDEFINITA
}

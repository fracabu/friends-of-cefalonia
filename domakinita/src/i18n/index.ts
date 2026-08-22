import { it } from './dizionari/it'
import { en } from './dizionari/en'
import { el } from './dizionari/el'
import { LINGUA_PREDEFINITA, isLingua, type Lingua } from './config'
import type { Dizionario } from './dizionari/it'

const DIZIONARI: Record<Lingua, Dizionario> = { it, en, el }

export function getDizionario(lingua: string | undefined): Dizionario {
  return DIZIONARI[isLingua(lingua) ? lingua : LINGUA_PREDEFINITA]
}

/** Sostituisce i segnaposti: interpola('Entro {n} km', { n: 5 }) */
export function interpola(testo: string, valori: Record<string, string | number>) {
  return testo.replace(/\{(\w+)\}/g, (intero, chiave) =>
    chiave in valori ? String(valori[chiave]) : intero,
  )
}

export type { Dizionario }
export * from './config'

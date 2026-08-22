'use client'

import { createContext, useContext } from 'react'
import type { Dizionario } from './dizionari/it'
import type { Lingua } from './config'

/**
 * I componenti server ricevono il dizionario come argomento; quelli client lo
 * prendono da qui. Il valore viene messo una volta sola, nel layout della
 * lingua, e non cambia finché non si cambia lingua — cioè finché non si cambia
 * pagina.
 */
const Contesto = createContext<{ lingua: Lingua; d: Dizionario } | null>(null)

export function ProvvedituraLingua({
  lingua,
  dizionario,
  children,
}: {
  lingua: Lingua
  dizionario: Dizionario
  children: React.ReactNode
}) {
  return <Contesto.Provider value={{ lingua, d: dizionario }}>{children}</Contesto.Provider>
}

export function useI18n() {
  const valore = useContext(Contesto)
  if (!valore) throw new Error('useI18n va usato dentro ProvvedituraLingua')
  return valore
}

/** Antepone la lingua corrente a un percorso interno. */
export function useHref() {
  const { lingua } = useI18n()
  return (path: string) => (path === '/' ? `/${lingua}` : `/${lingua}${path}`)
}

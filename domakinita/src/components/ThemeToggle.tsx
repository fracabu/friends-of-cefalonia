'use client'

import { useSyncExternalStore } from 'react'
import { useI18n } from '@/i18n/client'
import { cn } from '@/lib/utils'

type Tema = 'chiaro' | 'scuro' | 'sistema'

/**
 * Tre stati, non due: chiaro, scuro e «come il sistema» — che è il valore di
 * partenza, e l'unico che segue chi cambia impostazione al tramonto.
 *
 * La scelta va in localStorage e viene riapplicata da uno script inline nella
 * testata: senza, la pagina apparirebbe chiara per un istante prima di
 * scurirsi, ed è lo sfarfallio che tutti riconoscono.
 */
// La scelta vive in localStorage, che è uno stato esterno a React: si legge
// con useSyncExternalStore, non copiandola in uno stato interno dentro un
// effetto. Sul server non esiste, e la risposta è «sistema».
const ascoltatori = new Set<() => void>()

function sottoscrivi(avvisa: () => void) {
  ascoltatori.add(avvisa)
  window.addEventListener('storage', avvisa)
  return () => {
    ascoltatori.delete(avvisa)
    window.removeEventListener('storage', avvisa)
  }
}

function leggiTema(): Tema {
  try {
    return (localStorage.getItem('tema') as Tema | null) ?? 'sistema'
  } catch {
    return 'sistema'
  }
}

export function ThemeToggle() {
  const { d } = useI18n()
  const tema = useSyncExternalStore(sottoscrivi, leggiTema, () => 'sistema' as Tema)

  function applica(scelto: Tema) {

    const scuro =
      scelto === 'scuro' ||
      (scelto === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', scuro)

    if (scelto === 'sistema') localStorage.removeItem('tema')
    else localStorage.setItem('tema', scelto)

    // `storage` avvisa solo le altre schede: questa la si avvisa a mano.
    for (const avvisa of ascoltatori) avvisa()
  }

  const opzioni: Array<{ valore: Tema; etichetta: string; icona: React.ReactNode }> = [
    {
      valore: 'chiaro',
      etichetta: d.nav.temaChiaro,
      icona: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      valore: 'sistema',
      etichetta: d.nav.temaSistema,
      icona: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      valore: 'scuro',
      etichetta: d.nav.temaScuro,
      icona: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <div
      role="group"
      aria-label={d.nav.tema}
      className="inline-flex rounded-lg bg-black/15 p-0.5 text-current dark:bg-white/10"
    >
      {opzioni.map((opzione) => (
        <button
          key={opzione.valore}
          type="button"
          onClick={() => applica(opzione.valore)}
          aria-pressed={tema === opzione.valore}
          title={opzione.etichetta}
          className={cn(
            'grid h-7 w-7 place-items-center rounded-md transition',
            // Il gruppo vive sia sulla fascia blu sia nel pannello chiaro:
            // il selezionato deve reggere su tutti e due, in tutti e due i temi.
            tema === opzione.valore
              ? 'bg-white text-brand-700 shadow-sm dark:bg-ink-200 dark:text-ink-900'
              : 'text-current hover:bg-white/20',
          )}
        >
          {opzione.icona}
          <span className="sr-only">{opzione.etichetta}</span>
        </button>
      ))}
    </div>
  )
}

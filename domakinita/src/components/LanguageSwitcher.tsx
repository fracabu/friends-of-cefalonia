'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LINGUE, NOMI_LINGUA } from '@/i18n/config'
import { useI18n } from '@/i18n/client'

/**
 * Cambia lingua restando dove si è: si sostituisce il primo segmento del
 * percorso e si tiene tutto il resto, filtri compresi. La scelta finisce in un
 * cookie, così la volta dopo si arriva già nella lingua giusta.
 */
export function LanguageSwitcher() {
  const { lingua, d } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function cambia(nuova: string) {
    document.cookie = `lingua=${nuova}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`

    const resto = pathname.replace(/^\/[^/]+/, '')
    const query = params.toString()
    router.push(`/${nuova}${resto}${query ? `?${query}` : ''}`)
    router.refresh()
  }

  return (
    <label className="flex items-center gap-1.5 text-sm text-ink-600">
      <span className="sr-only">{d.nav.lingua}</span>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
      </svg>
      <select
        value={lingua}
        onChange={(e) => cambia(e.target.value)}
        className="cursor-pointer rounded-lg border-0 bg-transparent py-1 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {LINGUE.map((codice) => (
          <option key={codice} value={codice}>
            {NOMI_LINGUA[codice]}
          </option>
        ))}
      </select>
    </label>
  )
}

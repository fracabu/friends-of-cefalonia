'use client'

import { useRouter, useSearchParams } from 'next/navigation'

/** I filtri attivi, ciascuno con la sua croce per toglierlo. */
export function ActiveFilters({ chips }: { chips: Array<{ param: string; label: string }> }) {
  const router = useRouter()
  const params = useSearchParams()

  if (!chips.length) return null

  function remove(param: string) {
    const next = new URLSearchParams(params.toString())
    next.delete(param)
    // Il raggio senza centro (e viceversa) non vuol dire niente: vanno insieme.
    if (param === 'centro') next.delete('raggio')
    if (param === 'raggio') next.delete('centro')
    next.delete('pagina')
    router.push(`/cerca?${next.toString()}`)
  }

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.param}>
          <button
            type="button"
            onClick={() => remove(chip.param)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-xs font-medium text-brand-800 hover:bg-brand-100"
          >
            {chip.label}
            <span aria-hidden className="text-brand-500">
              &times;
            </span>
            <span className="sr-only">Togli il filtro</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

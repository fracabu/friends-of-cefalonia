'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/client'

/**
 * Ottimistico: il cuore cambia subito, la chiamata segue. Se l'utente non è
 * autenticato la route risponde 401 e lo mandiamo al login.
 */
export function FavoriteButton({ listingId, initial }: { listingId: string; initial: boolean }) {
  const [active, setActive] = useState(initial)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const { lingua, d } = useI18n()

  function toggle(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    const next = !active
    setActive(next)

    startTransition(async () => {
      const res = await fetch('/api/preferiti', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      if (res.status === 401) {
        setActive(!next)
        router.push(`/${lingua}/accedi?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      if (!res.ok) setActive(!next)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? d.annuncio.togliPreferiti : d.annuncio.salvaPreferiti}
      className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink-600 shadow-sm backdrop-blur transition hover:text-red-600"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20.5 4.6 13.4a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9a4.6 4.6 0 1 1 6.5 6.5Z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

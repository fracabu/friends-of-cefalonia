'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/client'
import { IconaCuore } from '@/components/ui/Icons'

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
      className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-surface/95 text-ink-600 shadow-sm backdrop-blur transition hover:text-red-600 aria-pressed:text-red-600"
    >
      <IconaCuore pieno={active} className="h-5 w-5" />
    </button>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n/client'

/** Salva i filtri correnti come avviso: è il gancio che fa tornare gli utenti. */
export function SaveSearchButton({ suggestedName }: { suggestedName: string }) {
  const params = useSearchParams()
  const router = useRouter()
  const { lingua, d } = useI18n()
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')

  async function save() {
    setState('saving')
    const res = await fetch('/api/ricerche-salvate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: suggestedName, query: params.toString(), frequency: 'DAILY' }),
    })

    if (res.status === 401) {
      router.push(`/${lingua}/accedi?redirect=${encodeURIComponent(`/${lingua}/cerca?${params.toString()}`)}`)
      setState('idle')
      return
    }
    setState(res.ok ? 'saved' : 'idle')
  }

  return (
    <Button variant="secondary" size="sm" onClick={save} disabled={state !== 'idle'}>
      {state === 'saved'
        ? d.ricerca.ricercaSalvata
        : state === 'saving'
          ? d.ricerca.salvataggio
          : d.ricerca.salvaRicerca}
    </Button>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type Suggestion = { slug: string; name: string; type: string; province: string | null }

/**
 * La barra della home e dell'header: contratto, luogo con autocomplete, tipologia.
 * Non fa la ricerca: compone l'URL di /cerca, che resta la sola fonte di verità.
 */
export function SearchBar({
  defaultContract = 'vendita',
  defaultCity = '',
  className,
}: {
  defaultContract?: 'vendita' | 'affitto'
  defaultCity?: string
  className?: string
}) {
  const router = useRouter()
  const [contract, setContract] = useState(defaultContract)
  const [city, setCity] = useState(defaultCity)
  const [type, setType] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  // Autocomplete con un attimo di attesa: si evita una richiesta per lettera.
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      if (city.trim().length < 2) {
        setSuggestions([])
        return
      }
      try {
        const res = await fetch(`/api/luoghi?q=${encodeURIComponent(city)}`, {
          signal: controller.signal,
        })
        if (res.ok) setSuggestions(await res.json())
      } catch {
        /* richiesta annullata: nessun rumore in console */
      }
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [city])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ contratto: contract })
    if (city.trim()) params.set('comune', city.trim())
    if (type) params.set('tipo', type)
    router.push(`/cerca?${params.toString()}`)
  }

  return (
    <form
      onSubmit={submit}
      className={cn('rounded-2xl bg-white p-3 shadow-card sm:p-4', className)}
    >
      <div className="mb-3 inline-flex rounded-xl bg-ink-100 p-1">
        {(['vendita', 'affitto'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setContract(value)}
            aria-pressed={contract === value}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition',
              contract === value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600',
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div ref={box} className="relative flex-1">
          <label htmlFor="ricerca-comune" className="sr-only">
            Località o zona
          </label>
          <input
            id="ricerca-comune"
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
            placeholder="Cerca per località, per esempio Argostoli, Fiskardo"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />

          {open && suggestions.length > 0 ? (
            <ul className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-ink-100 bg-white py-1 shadow-lg">
              {suggestions.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setCity(s.name)
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-ink-50"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs text-ink-400">{s.province ?? s.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <label htmlFor="ricerca-tipo" className="sr-only">
          Tipologia
        </label>
        <select
          id="ricerca-tipo"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none sm:w-56"
        >
          <option value="">Tutte le tipologie</option>
          <option value="appartamento">Appartamento</option>
          <option value="attico">Attico</option>
          <option value="villa">Villa</option>
          <option value="casa">Casa indipendente</option>
          <option value="loft">Loft</option>
                    <option value="ufficio">Ufficio</option>
          <option value="negozio">Negozio</option>
          <option value="terreno">Terreno edificabile</option>
        </select>

        <Button type="submit" size="lg" className="sm:w-40">
          Cerca
        </Button>
      </div>
    </form>
  )
}

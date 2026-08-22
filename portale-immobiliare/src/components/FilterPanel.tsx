'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, Input, Select } from '@/components/ui/Field'
import { CONDITION_LABELS, FURNISHED_LABELS, PROPERTY_TYPE_SLUGS, PROPERTY_TYPE_LABELS } from '@/lib/labels'

const AMENITY_PARAMS = [
  ['ascensore', 'Ascensore'],
  ['giardino', 'Giardino'],
  ['terrazzo', 'Terrazzo'],
  ['balcone', 'Balcone'],
  ['box', 'Box / posto auto'],
  ['cantina', 'Cantina'],
  ['piscina', 'Piscina'],
  ['aria', 'Aria condizionata'],
] as const

/**
 * I filtri scrivono nell'URL, non in uno stato locale: il risultato è
 * condivisibile, indicizzabile e ricaricabile: è il comportamento che ci si
 * aspetta da un portale.
 */
export function FilterPanel({ total }: { total: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  const current = useMemo(() => new URLSearchParams(params.toString()), [params])

  const apply = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === '') next.delete(key)
        else next.set(key, value)
      }
      next.delete('pagina') // cambiando un filtro si torna alla prima pagina
      router.push(`/cerca?${next.toString()}`)
    },
    [params, router],
  )

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const changes: Record<string, string | null> = {}
    for (const key of [
      'prezzoMin',
      'prezzoMax',
      'superficieMin',
      'superficieMax',
      'localiMin',
      'bagniMin',
      'arredato',
      'stato',
      'zona',
    ]) {
      changes[key] = (data.get(key) as string | null)?.trim() || null
    }
    for (const [key] of AMENITY_PARAMS) {
      changes[key] = data.get(key) ? '1' : null
    }
    const tipi = data.getAll('tipo').map(String)
    changes.tipo = tipi.length ? tipi.join(',') : null
    apply(changes)
    setOpen(false)
  }

  const selectedTypes = (current.get('tipo') ?? '').split(',').filter(Boolean)
  const activeCount = [...current.keys()].filter(
    (k) => !['contratto', 'comune', 'ordina', 'pagina'].includes(k),
  ).length

  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
        <p className="text-sm text-ink-600">
          <strong className="text-ink-900">{total.toLocaleString('it-IT')}</strong> immobili
        </p>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-ink-100 p-1">
            {(['vendita', 'affitto'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => apply({ contratto: c })}
                aria-pressed={(current.get('contratto') ?? 'vendita') === c}
                className={
                  (current.get('contratto') ?? 'vendita') === c
                    ? 'rounded-md bg-white px-3 py-1 text-sm font-medium capitalize shadow-sm'
                    : 'rounded-md px-3 py-1 text-sm capitalize text-ink-600'
                }
              >
                {c}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
            Filtri{activeCount ? ` (${activeCount})` : ''}
          </Button>
        </div>
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="space-y-6 px-4 py-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">Tipologia</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(PROPERTY_TYPE_SLUGS).map(([key, slug]) => (
                <Checkbox
                  key={slug}
                  name="tipo"
                  value={slug}
                  defaultChecked={selectedTypes.includes(slug)}
                  label={PROPERTY_TYPE_LABELS[key as keyof typeof PROPERTY_TYPE_LABELS]}
                />
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Prezzo minimo">
              <Input name="prezzoMin" type="number" min={0} step={1000} inputMode="numeric" defaultValue={current.get('prezzoMin') ?? ''} placeholder="€" />
            </Field>
            <Field label="Prezzo massimo">
              <Input name="prezzoMax" type="number" min={0} step={1000} inputMode="numeric" defaultValue={current.get('prezzoMax') ?? ''} placeholder="€" />
            </Field>
            <Field label="Superficie minima">
              <Input name="superficieMin" type="number" min={0} inputMode="numeric" defaultValue={current.get('superficieMin') ?? ''} placeholder="m²" />
            </Field>
            <Field label="Superficie massima">
              <Input name="superficieMax" type="number" min={0} inputMode="numeric" defaultValue={current.get('superficieMax') ?? ''} placeholder="m²" />
            </Field>
            <Field label="Locali (minimo)">
              <Select name="localiMin" defaultValue={current.get('localiMin') ?? ''}>
                <option value="">Indifferente</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Bagni (minimo)">
              <Select name="bagniMin" defaultValue={current.get('bagniMin') ?? ''}>
                <option value="">Indifferente</option>
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Stato">
              <Select name="stato" defaultValue={current.get('stato') ?? ''}>
                <option value="">Indifferente</option>
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Arredamento">
              <Select name="arredato" defaultValue={current.get('arredato') ?? ''}>
                <option value="">Indifferente</option>
                {Object.entries(FURNISHED_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Zona / quartiere" className="sm:col-span-2">
              <Input name="zona" defaultValue={current.get('zona') ?? ''} placeholder="Trastevere" />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">Dotazioni</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AMENITY_PARAMS.map(([param, label]) => (
                <Checkbox key={param} name={param} defaultChecked={current.get(param) === '1'} label={label} />
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-3">
            <Button type="submit">Mostra risultati</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const keep = new URLSearchParams()
                const contratto = current.get('contratto')
                const comune = current.get('comune')
                if (contratto) keep.set('contratto', contratto)
                if (comune) keep.set('comune', comune)
                router.push(`/cerca?${keep.toString()}`)
                setOpen(false)
              }}
            >
              Azzera i filtri
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

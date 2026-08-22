'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, Input, Select } from '@/components/ui/Field'
import {
  CONDITION_LABELS,
  FURNISHED_LABELS,
  HEATING_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_SLUGS,
} from '@/lib/labels'
import { ENERGY_ORDER } from '@/lib/search'

/** Interruttori: nome del parametro nell'URL ed etichetta. */
const AMENITIES = [
  ['ascensore', 'Ascensore'],
  ['giardino', 'Giardino'],
  ['terrazzo', 'Terrazzo'],
  ['balcone', 'Balcone'],
  ['box', 'Box / posto auto'],
  ['cantina', 'Cantina'],
  ['piscina', 'Piscina'],
  ['aria', 'Aria condizionata'],
  ['animali', 'Animali ammessi'],
] as const

const LISTING_FLAGS = [
  ['conFoto', 'Solo con fotografie'],
  ['planimetria', 'Con planimetria'],
  ['virtualTour', 'Con tour virtuale'],
  ['nuovaCostruzione', 'Nuova costruzione'],
  ['speseIncluse', 'Spese incluse'],
  ['asta', 'Immobili all’asta'],
] as const

const TEXT_PARAMS = [
  'prezzoMin',
  'prezzoMax',
  'cauzioneMax',
  'superficieMin',
  'superficieMax',
  'localiMin',
  'localiMax',
  'cameremin',
  'bagniMin',
  'pianoMin',
  'pianoMax',
  'annoMin',
  'annoMax',
  'zona',
  'rif',
  'arredato',
  'stato',
  'riscaldamento',
  'classeMin',
  'proprieta',
  'disponibilita',
  'inserzionista',
  'pubblicatoDa',
] as const

const BOOLEAN_PARAMS = [
  ...AMENITIES.map(([p]) => p),
  ...LISTING_FLAGS.map(([p]) => p),
  'pianoTerra',
  'ultimoPiano',
  'trattativaRiservata',
] as const

/**
 * I filtri scrivono nell'URL, non in uno stato locale: il risultato è
 * condivisibile, indicizzabile e ricaricabile. È il comportamento che ci si
 * aspetta da un portale, ed è anche ciò che rende salvabile una ricerca.
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

    for (const key of TEXT_PARAMS) changes[key] = (data.get(key) as string | null)?.trim() || null
    for (const key of BOOLEAN_PARAMS) changes[key] = data.get(key) ? '1' : null

    const tipi = data.getAll('tipo').map(String)
    changes.tipo = tipi.length ? tipi.join(',') : null

    apply(changes)
    setOpen(false)
  }

  const selectedTypes = (current.get('tipo') ?? '').split(',').filter(Boolean)
  const contract = current.get('contratto') ?? 'vendita'
  const activeCount = [...current.keys()].filter(
    (k) => !['contratto', 'comune', 'ordina', 'pagina'].includes(k),
  ).length

  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
        <p className="text-sm text-ink-600">
          <strong className="text-ink-900">{total.toLocaleString('it-IT')}</strong> immobili
        </p>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-ink-100 p-1">
            {(['vendita', 'affitto'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => apply({ contratto: value })}
                aria-pressed={contract === value}
                className={
                  contract === value
                    ? 'rounded-md bg-white px-3 py-1 text-sm font-medium capitalize shadow-sm'
                    : 'rounded-md px-3 py-1 text-sm capitalize text-ink-600'
                }
              >
                {value}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? 'Chiudi i filtri' : `Tutti i filtri${activeCount ? ` (${activeCount})` : ''}`}
          </Button>
        </div>
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="space-y-7 px-4 py-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">Tipologia</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">Prezzo e superficie</legend>
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
              {contract === 'affitto' ? (
                <Field label="Cauzione massima">
                  <Input name="cauzioneMax" type="number" min={0} inputMode="numeric" defaultValue={current.get('cauzioneMax') ?? ''} placeholder="€" />
                </Field>
              ) : null}
            </div>
            <div className="mt-3">
              <Checkbox
                name="trattativaRiservata"
                label="Solo trattative riservate"
                defaultChecked={current.get('trattativaRiservata') === '1'}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">Composizione</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Locali da">
                <Select name="localiMin" defaultValue={current.get('localiMin') ?? ''}>
                  <option value="">Indifferente</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Locali fino a">
                <Select name="localiMax" defaultValue={current.get('localiMax') ?? ''}>
                  <option value="">Indifferente</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Camere da letto (minimo)">
                <Select name="cameremin" defaultValue={current.get('cameremin') ?? ''}>
                  <option value="">Indifferente</option>
                  {[1, 2, 3, 4].map((n) => (
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
              <Field label="Piano da" hint="0 = piano terra">
                <Input name="pianoMin" type="number" defaultValue={current.get('pianoMin') ?? ''} />
              </Field>
              <Field label="Piano fino a">
                <Input name="pianoMax" type="number" defaultValue={current.get('pianoMax') ?? ''} />
              </Field>
              <Field label="Costruito dal">
                <Input name="annoMin" type="number" min={1800} max={2100} defaultValue={current.get('annoMin') ?? ''} />
              </Field>
              <Field label="Costruito fino al">
                <Input name="annoMax" type="number" min={1800} max={2100} defaultValue={current.get('annoMax') ?? ''} />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <Checkbox name="pianoTerra" label="Solo piano terra" defaultChecked={current.get('pianoTerra') === '1'} />
              <Checkbox name="ultimoPiano" label="Solo ultimo piano" defaultChecked={current.get('ultimoPiano') === '1'} />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">Caratteristiche</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Stato dell'immobile">
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
              <Field label="Riscaldamento">
                <Select name="riscaldamento" defaultValue={current.get('riscaldamento') ?? ''}>
                  <option value="">Indifferente</option>
                  {Object.entries(HEATING_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Classe energetica" hint="La classe indicata o migliore">
                <Select name="classeMin" defaultValue={current.get('classeMin') ?? ''}>
                  <option value="">Indifferente</option>
                  {ENERGY_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo di proprietà">
                <Select name="proprieta" defaultValue={current.get('proprieta') ?? ''}>
                  <option value="">Indifferente</option>
                  <option value="FULL">Intera proprietà</option>
                  <option value="BARE">Nuda proprietà</option>
                  <option value="SHARED">Multiproprietà</option>
                </Select>
              </Field>
              <Field label="Disponibilità">
                <Select name="disponibilita" defaultValue={current.get('disponibilita') ?? ''}>
                  <option value="">Indifferente</option>
                  <option value="FREE">Libero</option>
                  <option value="OCCUPIED">Occupato</option>
                  <option value="RENTED">Affittato, a reddito</option>
                </Select>
              </Field>
              <Field label="Zona / quartiere" hint="Più zone separate da virgola">
                <Input name="zona" defaultValue={current.get('zona') ?? ''} placeholder="Trastevere, Prati" />
              </Field>
              <Field label="Riferimento annuncio">
                <Input name="rif" defaultValue={current.get('rif') ?? ''} placeholder="RIF-1024" />
              </Field>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {AMENITIES.map(([param, label]) => (
                <Checkbox key={param} name={param} defaultChecked={current.get(param) === '1'} label={label} />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">L&apos;annuncio</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Pubblicato negli ultimi">
                <Select name="pubblicatoDa" defaultValue={current.get('pubblicatoDa') ?? ''}>
                  <option value="">Sempre</option>
                  <option value="1">24 ore</option>
                  <option value="3">3 giorni</option>
                  <option value="7">7 giorni</option>
                  <option value="30">30 giorni</option>
                </Select>
              </Field>
              <Field label="Inserzionista">
                <Select name="inserzionista" defaultValue={current.get('inserzionista') ?? ''}>
                  <option value="">Tutti</option>
                  <option value="agenzia">Agenzie</option>
                  <option value="privato">Privati</option>
                </Select>
              </Field>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LISTING_FLAGS.map(([param, label]) => (
                <Checkbox key={param} name={param} defaultChecked={current.get(param) === '1'} label={label} />
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-3 border-t border-ink-100 pt-5">
            <Button type="submit">Mostra {total.toLocaleString('it-IT')} risultati</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                // Si azzerano i filtri, non la ricerca: dove e cosa restano.
                const keep = new URLSearchParams()
                for (const key of ['contratto', 'comune', 'area', 'centro', 'raggio', 'bbox']) {
                  const value = current.get(key)
                  if (value) keep.set(key, value)
                }
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

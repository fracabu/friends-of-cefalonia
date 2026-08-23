'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, Input, Select } from '@/components/ui/Field'
import { PROPERTY_TYPE_SLUGS } from '@/lib/labels'
import { ENERGY_ORDER } from '@/lib/search'
import { useI18n } from '@/i18n/client'

/** Nome del parametro nell'URL e chiave della sua etichetta nel dizionario. */
const AMENITIES = [
  ['ascensore', 'elevator'],
  ['giardino', 'garden'],
  ['terrazzo', 'terrace'],
  ['balcone', 'balcony'],
  ['box', 'parking'],
  ['cantina', 'cellar'],
  ['piscina', 'pool'],
  ['aria', 'airCon'],
  ['animali', 'pets'],
] as const

const LISTING_FLAGS = [
  ['conFoto', 'conFoto'],
  ['planimetria', 'conPlanimetria'],
  ['virtualTour', 'conTour'],
  ['nuovaCostruzione', 'nuovaCostruzione'],
  ['speseIncluse', 'speseIncluse'],
  ['asta', 'aste'],
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
  const { lingua, d } = useI18n()

  const current = useMemo(() => new URLSearchParams(params.toString()), [params])

  const apply = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === '') next.delete(key)
        else next.set(key, value)
      }
      next.delete('pagina') // cambiando un filtro si torna alla prima pagina
      router.push(`/${lingua}/cerca?${next.toString()}`)
    },
    [lingua, params, router],
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
  }

  const selectedTypes = (current.get('tipo') ?? '').split(',').filter(Boolean)
  const contract = current.get('contratto') ?? 'vendita'

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-7">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">{d.ricerca.tipologia}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(PROPERTY_TYPE_SLUGS).map(([key, slug]) => (
                <Checkbox
                  key={slug}
                  name="tipo"
                  value={slug}
                  defaultChecked={selectedTypes.includes(slug)}
                  label={d.et.tipo[key as keyof typeof d.et.tipo]}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">{d.ricerca.sezPrezzo}</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={d.ricerca.prezzoMin}>
                <Input name="prezzoMin" type="number" min={0} step={1000} inputMode="numeric" defaultValue={current.get('prezzoMin') ?? ''} placeholder="€" />
              </Field>
              <Field label={d.ricerca.prezzoMax}>
                <Input name="prezzoMax" type="number" min={0} step={1000} inputMode="numeric" defaultValue={current.get('prezzoMax') ?? ''} placeholder="€" />
              </Field>
              <Field label={d.ricerca.superficieMin}>
                <Input name="superficieMin" type="number" min={0} inputMode="numeric" defaultValue={current.get('superficieMin') ?? ''} placeholder="m²" />
              </Field>
              <Field label={d.ricerca.superficieMax}>
                <Input name="superficieMax" type="number" min={0} inputMode="numeric" defaultValue={current.get('superficieMax') ?? ''} placeholder="m²" />
              </Field>
              {contract === 'affitto' ? (
                <Field label={d.ricerca.cauzioneMax}>
                  <Input name="cauzioneMax" type="number" min={0} inputMode="numeric" defaultValue={current.get('cauzioneMax') ?? ''} placeholder="€" />
                </Field>
              ) : null}
            </div>
            <div className="mt-3">
              <Checkbox
                name="trattativaRiservata"
                label={d.ricerca.soloRiservate}
                defaultChecked={current.get('trattativaRiservata') === '1'}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">{d.ricerca.sezComposizione}</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={d.ricerca.localiDa}>
                <Select name="localiMin" defaultValue={current.get('localiMin') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.localiA}>
                <Select name="localiMax" defaultValue={current.get('localiMax') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.camereMin}>
                <Select name="cameremin" defaultValue={current.get('cameremin') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.bagniMin}>
                <Select name="bagniMin" defaultValue={current.get('bagniMin') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.pianoDa} hint={d.ricerca.pianoNota}>
                <Input name="pianoMin" type="number" defaultValue={current.get('pianoMin') ?? ''} />
              </Field>
              <Field label={d.ricerca.pianoA}>
                <Input name="pianoMax" type="number" defaultValue={current.get('pianoMax') ?? ''} />
              </Field>
              <Field label={d.ricerca.annoDa}>
                <Input name="annoMin" type="number" min={1800} max={2100} defaultValue={current.get('annoMin') ?? ''} />
              </Field>
              <Field label={d.ricerca.annoA}>
                <Input name="annoMax" type="number" min={1800} max={2100} defaultValue={current.get('annoMax') ?? ''} />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <Checkbox name="pianoTerra" label={d.ricerca.soloPianoTerra} defaultChecked={current.get('pianoTerra') === '1'} />
              <Checkbox name="ultimoPiano" label={d.ricerca.soloUltimoPiano} defaultChecked={current.get('ultimoPiano') === '1'} />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">{d.ricerca.sezCaratteristiche}</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={d.ricerca.stato}>
                <Select name="stato" defaultValue={current.get('stato') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {Object.entries(d.et.condizione).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.arredamento}>
                <Select name="arredato" defaultValue={current.get('arredato') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {Object.entries(d.et.arredamento).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.riscaldamento}>
                <Select name="riscaldamento" defaultValue={current.get('riscaldamento') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {Object.entries(d.et.riscaldamento).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.classe} hint={d.ricerca.classeNota}>
                <Select name="classeMin" defaultValue={current.get('classeMin') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  {ENERGY_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.ricerca.proprieta}>
                <Select name="proprieta" defaultValue={current.get('proprieta') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  <option value="FULL">{d.et.proprieta.FULL}</option>
                  <option value="BARE">{d.et.proprieta.BARE}</option>
                  <option value="SHARED">{d.et.proprieta.SHARED}</option>
                </Select>
              </Field>
              <Field label={d.ricerca.disponibilita}>
                <Select name="disponibilita" defaultValue={current.get('disponibilita') ?? ''}>
                  <option value="">{d.ricerca.indifferente}</option>
                  <option value="FREE">{d.et.disponibilita.FREE}</option>
                  <option value="OCCUPIED">{d.et.disponibilita.OCCUPIED}</option>
                  <option value="RENTED">{d.et.disponibilita.RENTED}</option>
                </Select>
              </Field>
              <Field label={d.ricerca.zona} hint={d.ricerca.zonaNota}>
                <Input name="zona" defaultValue={current.get('zona') ?? ''} placeholder="Trastevere, Prati" />
              </Field>
              <Field label={d.ricerca.riferimento}>
                <Input name="rif" defaultValue={current.get('rif') ?? ''} placeholder="RIF-1024" />
              </Field>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {AMENITIES.map(([param, chiave]) => (
                <Checkbox
                  key={param}
                  name={param}
                  defaultChecked={current.get(param) === '1'}
                  label={d.et.dotazione[chiave]}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-700">{d.ricerca.sezAnnuncio}</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={d.ricerca.pubblicatoDa}>
                <Select name="pubblicatoDa" defaultValue={current.get('pubblicatoDa') ?? ''}>
                  <option value="">{d.ricerca.sempre}</option>
                  <option value="1">{d.ricerca.ore24}</option>
                  <option value="3">{d.ricerca.giorni3}</option>
                  <option value="7">{d.ricerca.giorni7}</option>
                  <option value="30">{d.ricerca.giorni30}</option>
                </Select>
              </Field>
              <Field label={d.ricerca.inserzionista}>
                <Select name="inserzionista" defaultValue={current.get('inserzionista') ?? ''}>
                  <option value="">{d.ricerca.tutti}</option>
                  <option value="agenzia">{d.ricerca.agenzieOpz}</option>
                  <option value="privato">{d.ricerca.privatiOpz}</option>
                </Select>
              </Field>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LISTING_FLAGS.map(([param, chiave]) => (
                <Checkbox
                  key={param}
                  name={param}
                  defaultChecked={current.get(param) === '1'}
                  label={d.ricerca[chiave]}
                />
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-3 border-t border-ink-100 pt-5">
            <Button type="submit">{d.ricerca.mostraRisultati.replace('{n}', total.toLocaleString(lingua))}</Button>
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
                router.push(`/${lingua}/cerca?${keep.toString()}`)
              }}
            >
              {d.ricerca.azzeraFiltri}
            </Button>
          </div>
      </form>
    </div>
  )
}

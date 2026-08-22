'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/Field'
import { ENERGY_LABELS } from '@/lib/labels'
import { useI18n } from '@/i18n/client'
import { LINGUE, NOMI_LINGUA, type Lingua } from '@/i18n/config'

type ListingLike = Record<string, unknown> & { id: string }
type ImageLike = { id: string; url: string; alt: string | null }
type TraduzioneLike = { locale: string; title: string; description: string }

/**
 * Il modulo di inserimento. Manda un JSON a /api/annunci: le stesse regole di
 * validazione girano sul server, quindi il browser qui è solo una comodità.
 */
export function ListingForm({
  listing,
  images = [],
  traduzioni = [],
}: {
  listing?: ListingLike
  images?: ImageLike[]
  traduzioni?: TraduzioneLike[]
}) {
  const router = useRouter()
  const { lingua, d } = useI18n()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)

  const value = (key: string) => (listing?.[key] ?? '') as string | number

  // La lingua originale dell'annuncio: quella dichiarata, o quella in cui
  // l'agenzia sta scrivendo adesso.
  const originale = (listing?.locale as Lingua) ?? lingua
  const traduzione = (l: string, campo: 'title' | 'description') =>
    traduzioni.find((t) => t.locale === l)?.[campo] ?? ''

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setErrors({})

    const form = new FormData(event.currentTarget)
    const payload: Record<string, unknown> = Object.fromEntries(form)

    // Le traduzioni viaggiano insieme all'annuncio, non come campi sciolti:
    // quelle lasciate vuote non si mandano affatto.
    payload.locale = originale
    payload.traduzioni = LINGUE.filter((l) => l !== originale)
      .map((l) => ({
        locale: l,
        title: String(form.get(`titolo_${l}`) ?? '').trim(),
        description: String(form.get(`descrizione_${l}`) ?? '').trim(),
      }))
      .filter((t) => t.title && t.description)

    for (const l of LINGUE) {
      delete payload[`titolo_${l}`]
      delete payload[`descrizione_${l}`]
    }

    const res = await fetch(listing ? `/api/annunci/${listing.id}` : '/api/annunci', {
      method: listing ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const flat = body.errors ?? { form: body.error ?? d.form.erroreSalvataggio }
      setErrors(
        Object.fromEntries(
          Object.entries(flat).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
        ),
      )
      setPending(false)
      return
    }

    const saved = await res.json()

    // Le fotografie viaggiano dopo: prima deve esistere l'annuncio a cui legarle.
    // Se il caricamento non riesce l'annuncio resta salvato, ma va detto.
    if (files?.length) {
      const upload = new FormData()
      upload.set('listingId', saved.id)
      for (const file of Array.from(files)) upload.append('file', file)
      const esito = await fetch('/api/upload', { method: 'POST', body: upload })

      if (!esito.ok) {
        const body = await esito.json().catch(() => ({}))
        setErrors({
          form: `Annuncio salvato, ma le fotografie non sono state caricate. ${body.error ?? ''}`.trim(),
        })
        setPending(false)
        return
      }
    }

    router.push('/dashboard/annunci')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">{d.form.sezAnnuncio}</h2>

        <Field label={d.form.titolo} htmlFor="title" error={errors.title} hint={d.form.titoloNota}>
          <Input id="title" name="title" required defaultValue={value('title')} />
        </Field>

        <Field label={d.form.descrizione} htmlFor="description" error={errors.description}>
          <Textarea id="description" name="description" required defaultValue={value('description')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={d.form.contratto} htmlFor="contract" error={errors.contract}>
            <Select id="contract" name="contract" defaultValue={value('contract') || 'SALE'}>
              <option value="SALE">{d.et.contratto.SALE}</option>
              <option value="RENT">{d.et.contratto.RENT}</option>
            </Select>
          </Field>

          <Field label={d.form.tipologia} htmlFor="type" error={errors.type}>
            <Select id="type" name="type" defaultValue={value('type') || 'APARTMENT'}>
              {Object.entries(d.et.tipo).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={d.form.statoAnnuncio} htmlFor="status" error={errors.status}>
            <Select id="status" name="status" defaultValue={value('status') || 'DRAFT'}>
              <option value="DRAFT">{d.et.statoAnnuncio.DRAFT}</option>
              <option value="PUBLISHED">{d.et.statoAnnuncio.PUBLISHED}</option>
              <option value="RESERVED">{d.et.statoAnnuncio.RESERVED}</option>
              <option value="SOLD">{d.et.statoAnnuncio.SOLD}</option>
              <option value="RENTED">{d.et.statoAnnuncio.RENTED}</option>
              <option value="ARCHIVED">{d.et.statoAnnuncio.ARCHIVED}</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">{d.form.sezPrezzo}</h2>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label={d.form.prezzo} htmlFor="price" error={errors.price}>
            <Input id="price" name="price" type="number" min={0} step={1000} defaultValue={value('price')} />
          </Field>
          <Field label={d.form.spese} htmlFor="condoFees">
            <Input id="condoFees" name="condoFees" type="number" min={0} defaultValue={value('condoFees')} />
          </Field>
          <Field label={d.form.superficie} htmlFor="surface" error={errors.surface}>
            <Input id="surface" name="surface" type="number" min={1} required defaultValue={value('surface')} />
          </Field>
          <Field label={d.form.locali} htmlFor="rooms" error={errors.rooms}>
            <Input id="rooms" name="rooms" type="number" min={1} max={30} required defaultValue={value('rooms')} />
          </Field>
          <Field label={d.form.camere} htmlFor="bedrooms">
            <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={value('bedrooms')} />
          </Field>
          <Field label={d.form.bagni} htmlFor="bathrooms">
            <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={value('bathrooms')} />
          </Field>
          <Field label={d.form.piano} htmlFor="floor" hint={d.form.pianoNota}>
            <Input id="floor" name="floor" type="number" defaultValue={value('floor')} />
          </Field>
          <Field label={d.form.pianiTotali} htmlFor="totalFloors">
            <Input id="totalFloors" name="totalFloors" type="number" min={1} defaultValue={value('totalFloors')} />
          </Field>
        </div>

        <Checkbox name="priceOnRequest" label={d.form.riservata} defaultChecked={Boolean(listing?.priceOnRequest)} />
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">{d.form.sezCaratteristiche}</h2>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label={d.form.stato} htmlFor="condition">
            <Select id="condition" name="condition" defaultValue={value('condition')}>
              <option value="">{d.form.nonIndicato}</option>
              {Object.entries(d.et.condizione).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.form.arredamento} htmlFor="furnished">
            <Select id="furnished" name="furnished" defaultValue={value('furnished')}>
              <option value="">{d.form.nonIndicato}</option>
              {Object.entries(d.et.arredamento).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.form.riscaldamento} htmlFor="heating">
            <Select id="heating" name="heating" defaultValue={value('heating')}>
              <option value="">{d.form.nonIndicato}</option>
              {Object.entries(d.et.riscaldamento).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.form.classe} htmlFor="energy">
            <Select id="energy" name="energy" defaultValue={value('energy')}>
              <option value="">{d.form.nonIndicata}</option>
              {Object.entries(ENERGY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ['elevator', 'Ascensore'],
              ['garden', 'Giardino'],
              ['terrace', 'Terrazzo'],
              ['balcony', 'Balcone'],
              ['parking', 'Box / posto auto'],
              ['cellar', 'Cantina'],
              ['pool', 'Piscina'],
              ['airCon', 'Aria condizionata'],
            ] as const
          ).map(([name, label]) => (
            <Checkbox key={name} name={name} label={label} defaultChecked={Boolean(listing?.[name])} />
          ))}
        </div>

        <Field label={d.form.altreCaratteristiche} htmlFor="features" hint={d.form.altreNota}>
          <Input
            id="features"
            name="features"
            defaultValue={Array.isArray(listing?.features) ? (listing.features as string[]).join(', ') : ''}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">{d.form.sezPortale}</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={d.form.disponibilita} htmlFor="availability">
            <Select id="availability" name="availability" defaultValue={value('availability')}>
              <option value="">{d.form.nonIndicata}</option>
              {Object.entries(d.et.disponibilita).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.form.proprieta} htmlFor="ownership">
            <Select id="ownership" name="ownership" defaultValue={value('ownership') || 'FULL'}>
              {Object.entries(d.et.proprieta).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={d.form.tour} htmlFor="virtualTourUrl" hint={d.form.tourNota}>
            <Input id="virtualTourUrl" name="virtualTourUrl" defaultValue={value('virtualTourUrl')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(
            [
              ['isNewBuild', d.form.nuovaCostruzione],
              ['isAuction', d.form.asta],
              ['hasFloorPlan', d.form.planimetria],
              ['utilitiesIncluded', d.form.speseIncluse],
              ['petsAllowed', d.form.animali],
            ] as const
          ).map(([name, label]) => (
            <Checkbox key={name} name={name} label={label} defaultChecked={Boolean(listing?.[name])} />
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">{d.form.sezDove}</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={d.form.indirizzo} htmlFor="addressLine" className="sm:col-span-2">
            <Input id="addressLine" name="addressLine" defaultValue={value('addressLine')} />
          </Field>
          <Field label={d.form.zona} htmlFor="zone">
            <Input id="zone" name="zone" defaultValue={value('zone')} />
          </Field>
          <Field label={d.form.comune} htmlFor="city" error={errors.city}>
            <Input id="city" name="city" required defaultValue={value('city')} />
          </Field>
          <Field label={d.form.provincia} htmlFor="province" error={errors.province} hint={d.form.provinciaNota}>
            <Input id="province" name="province" required maxLength={2} defaultValue={value('province')} />
          </Field>
          <Field label={d.form.regione} htmlFor="region" error={errors.region}>
            <Input id="region" name="region" required defaultValue={value('region')} />
          </Field>
          <Field label={d.form.cap} htmlFor="postalCode">
            <Input id="postalCode" name="postalCode" defaultValue={value('postalCode')} />
          </Field>
          <Field label={d.form.latitudine} htmlFor="latitude">
            <Input id="latitude" name="latitude" type="number" step="any" defaultValue={value('latitude')} />
          </Field>
          <Field label={d.form.longitudine} htmlFor="longitude">
            <Input id="longitude" name="longitude" type="number" step="any" defaultValue={value('longitude')} />
          </Field>
        </div>

        <Checkbox
          name="hideAddress"
          label={d.form.nascondiIndirizzo}
          defaultChecked={Boolean(listing?.hideAddress)}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">{d.form.sezTraduzioni}</h2>
        <p className="text-sm text-ink-500">{d.form.traduzioniNota}</p>

        {LINGUE.filter((l) => l !== originale).map((l) => (
          <div key={l} className="space-y-3 border-t border-ink-100 pt-4">
            <p className="text-sm font-medium text-ink-700">{NOMI_LINGUA[l]}</p>
            <Field label={d.form.titolo} htmlFor={`titolo_${l}`}>
              <Input id={`titolo_${l}`} name={`titolo_${l}`} defaultValue={traduzione(l, 'title')} />
            </Field>
            <Field label={d.form.descrizione} htmlFor={`descrizione_${l}`}>
              <Textarea
                id={`descrizione_${l}`}
                name={`descrizione_${l}`}
                defaultValue={traduzione(l, 'description')}
              />
            </Field>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">{d.form.sezFoto}</h2>

        {images.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
                <Image src={image.url} alt={image.alt ?? ''} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="block w-full text-sm text-ink-600 file:mr-4 file:rounded-lg file:border-0 file:bg-ink-100 file:px-4 file:py-2 file:text-sm file:font-medium"
        />
        <p className="text-xs text-ink-500">
          {d.form.fotoNota}
        </p>
      </section>

      {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? d.form.salvataggio : listing ? d.form.salva : d.form.crea}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {d.form.annulla}
        </Button>
      </div>
    </form>
  )
}

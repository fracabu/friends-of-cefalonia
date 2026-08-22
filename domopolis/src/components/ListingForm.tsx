'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/Field'
import {
  AVAILABILITY_LABELS,
  CONDITION_LABELS,
  ENERGY_LABELS,
  FURNISHED_LABELS,
  HEATING_LABELS,
  OWNERSHIP_LABELS,
  PROPERTY_TYPE_LABELS,
} from '@/lib/labels'

type ListingLike = Record<string, unknown> & { id: string }
type ImageLike = { id: string; url: string; alt: string | null }

/**
 * Il modulo di inserimento. Manda un JSON a /api/annunci: le stesse regole di
 * validazione girano sul server, quindi il browser qui è solo una comodità.
 */
export function ListingForm({
  listing,
  images = [],
}: {
  listing?: ListingLike
  images?: ImageLike[]
}) {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)

  const value = (key: string) => (listing?.[key] ?? '') as string | number

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setErrors({})

    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form)

    const res = await fetch(listing ? `/api/annunci/${listing.id}` : '/api/annunci', {
      method: listing ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const flat = body.errors ?? { form: body.error ?? 'Salvataggio non riuscito' }
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
    if (files?.length) {
      const upload = new FormData()
      upload.set('listingId', saved.id)
      for (const file of Array.from(files)) upload.append('file', file)
      await fetch('/api/upload', { method: 'POST', body: upload })
    }

    router.push('/dashboard/annunci')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">L&apos;annuncio</h2>

        <Field label="Titolo" htmlFor="title" error={errors.title} hint="Per esempio: Trilocale ristrutturato con terrazzo">
          <Input id="title" name="title" required defaultValue={value('title')} />
        </Field>

        <Field label="Descrizione" htmlFor="description" error={errors.description}>
          <Textarea id="description" name="description" required defaultValue={value('description')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Contratto" htmlFor="contract" error={errors.contract}>
            <Select id="contract" name="contract" defaultValue={value('contract') || 'SALE'}>
              <option value="SALE">Vendita</option>
              <option value="RENT">Affitto</option>
            </Select>
          </Field>

          <Field label="Tipologia" htmlFor="type" error={errors.type}>
            <Select id="type" name="type" defaultValue={value('type') || 'APARTMENT'}>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Stato dell'annuncio" htmlFor="status" error={errors.status}>
            <Select id="status" name="status" defaultValue={value('status') || 'DRAFT'}>
              <option value="DRAFT">Bozza</option>
              <option value="PUBLISHED">Pubblicato</option>
              <option value="RESERVED">Sotto proposta</option>
              <option value="SOLD">Venduto</option>
              <option value="RENTED">Affittato</option>
              <option value="ARCHIVED">Archiviato</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">Prezzo e consistenza</h2>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Prezzo (€)" htmlFor="price" error={errors.price}>
            <Input id="price" name="price" type="number" min={0} step={1000} defaultValue={value('price')} />
          </Field>
          <Field label="Spese condominiali" htmlFor="condoFees">
            <Input id="condoFees" name="condoFees" type="number" min={0} defaultValue={value('condoFees')} />
          </Field>
          <Field label="Superficie (m²)" htmlFor="surface" error={errors.surface}>
            <Input id="surface" name="surface" type="number" min={1} required defaultValue={value('surface')} />
          </Field>
          <Field label="Locali" htmlFor="rooms" error={errors.rooms}>
            <Input id="rooms" name="rooms" type="number" min={1} max={30} required defaultValue={value('rooms')} />
          </Field>
          <Field label="Camere da letto" htmlFor="bedrooms">
            <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={value('bedrooms')} />
          </Field>
          <Field label="Bagni" htmlFor="bathrooms">
            <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={value('bathrooms')} />
          </Field>
          <Field label="Piano" htmlFor="floor" hint="0 = piano terra">
            <Input id="floor" name="floor" type="number" defaultValue={value('floor')} />
          </Field>
          <Field label="Piani totali" htmlFor="totalFloors">
            <Input id="totalFloors" name="totalFloors" type="number" min={1} defaultValue={value('totalFloors')} />
          </Field>
        </div>

        <Checkbox name="priceOnRequest" label="Trattativa riservata" defaultChecked={Boolean(listing?.priceOnRequest)} />
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">Caratteristiche</h2>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Stato" htmlFor="condition">
            <Select id="condition" name="condition" defaultValue={value('condition')}>
              <option value="">Non indicato</option>
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Arredamento" htmlFor="furnished">
            <Select id="furnished" name="furnished" defaultValue={value('furnished')}>
              <option value="">Non indicato</option>
              {Object.entries(FURNISHED_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Riscaldamento" htmlFor="heating">
            <Select id="heating" name="heating" defaultValue={value('heating')}>
              <option value="">Non indicato</option>
              {Object.entries(HEATING_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Classe energetica" htmlFor="energy">
            <Select id="energy" name="energy" defaultValue={value('energy')}>
              <option value="">Non indicata</option>
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

        <Field label="Altre caratteristiche" htmlFor="features" hint="Separale con una virgola: vista mare, portineria">
          <Input
            id="features"
            name="features"
            defaultValue={Array.isArray(listing?.features) ? (listing.features as string[]).join(', ') : ''}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">Come si presenta sul portale</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Disponibilità" htmlFor="availability">
            <Select id="availability" name="availability" defaultValue={value('availability')}>
              <option value="">Non indicata</option>
              {Object.entries(AVAILABILITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo di proprietà" htmlFor="ownership">
            <Select id="ownership" name="ownership" defaultValue={value('ownership') || 'FULL'}>
              {Object.entries(OWNERSHIP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tour virtuale o video" htmlFor="virtualTourUrl" hint="Indirizzo del filmato">
            <Input id="virtualTourUrl" name="virtualTourUrl" defaultValue={value('virtualTourUrl')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(
            [
              ['isNewBuild', 'Nuova costruzione'],
              ['isAuction', 'Immobile all’asta'],
              ['hasFloorPlan', 'Planimetria disponibile'],
              ['utilitiesIncluded', 'Spese incluse nel canone'],
              ['petsAllowed', 'Animali ammessi'],
            ] as const
          ).map(([name, label]) => (
            <Checkbox key={name} name={name} label={label} defaultChecked={Boolean(listing?.[name])} />
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">Dove si trova</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Indirizzo" htmlFor="addressLine" className="sm:col-span-2">
            <Input id="addressLine" name="addressLine" defaultValue={value('addressLine')} />
          </Field>
          <Field label="Zona / quartiere" htmlFor="zone">
            <Input id="zone" name="zone" defaultValue={value('zone')} />
          </Field>
          <Field label="Comune" htmlFor="city" error={errors.city}>
            <Input id="city" name="city" required defaultValue={value('city')} />
          </Field>
          <Field label="Provincia" htmlFor="province" error={errors.province} hint="Sigla, per esempio RM">
            <Input id="province" name="province" required maxLength={2} defaultValue={value('province')} />
          </Field>
          <Field label="Regione" htmlFor="region" error={errors.region}>
            <Input id="region" name="region" required defaultValue={value('region')} />
          </Field>
          <Field label="CAP" htmlFor="postalCode">
            <Input id="postalCode" name="postalCode" defaultValue={value('postalCode')} />
          </Field>
          <Field label="Latitudine" htmlFor="latitude">
            <Input id="latitude" name="latitude" type="number" step="any" defaultValue={value('latitude')} />
          </Field>
          <Field label="Longitudine" htmlFor="longitude">
            <Input id="longitude" name="longitude" type="number" step="any" defaultValue={value('longitude')} />
          </Field>
        </div>

        <Checkbox
          name="hideAddress"
          label="Mostra solo la zona nella scheda pubblica"
          defaultChecked={Boolean(listing?.hideAddress)}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-ink-900">Fotografie</h2>

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
          Fino a 8 MB per file. Vengono ridotte e convertite in WebP al momento del caricamento.
        </p>
      </section>

      {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Salvo…' : listing ? 'Salva le modifiche' : 'Crea annuncio'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annulla
        </Button>
      </div>
    </form>
  )
}

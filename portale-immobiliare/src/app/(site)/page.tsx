import Link from 'next/link'
import { SearchBar } from '@/components/SearchBar'
import { ListingCard } from '@/components/ListingCard'
import { ButtonLink } from '@/components/ui/Button'
import { getFeaturedListings, getLatestListings, getTopCities } from '@/lib/listings'

export const revalidate = 300 // la home cambia poco: cinque minuti di cache bastano

export default async function HomePage() {
  const [featured, latest, cities] = await Promise.all([
    getFeaturedListings(4),
    getLatestListings(8),
    getTopCities(8),
  ])

  return (
    <>
      <section className="border-b border-ink-100 bg-gradient-to-b from-brand-50 to-ink-50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            La casa che stai cercando
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-600">
            Migliaia di annunci di agenzie e privati. Cerca per comune o quartiere, confronta sulla
            mappa, richiedi una visita.
          </p>
          <SearchBar className="mx-auto mt-8 max-w-3xl text-left" />
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink-900">In evidenza</h2>
              <p className="mt-1 text-sm text-ink-500">Selezionati dalle agenzie del portale</p>
            </div>
            <ButtonLink href="/cerca" variant="secondary" size="sm">
              Vedi tutti
            </ButtonLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} priority={i < 2} />
            ))}
          </div>
        </section>
      ) : null}

      {cities.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="text-2xl font-semibold text-ink-900">Cerca per città</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cities.map((city) => (
              <Link
                key={city.city}
                href={`/cerca?comune=${encodeURIComponent(city.city)}`}
                className="rounded-2xl border border-ink-100 bg-white px-4 py-5 shadow-card transition hover:border-brand-200"
              >
                <p className="font-medium text-ink-900">{city.city}</p>
                <p className="mt-1 text-sm text-ink-500">
                  {city.count} {city.count === 1 ? 'immobile' : 'immobili'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-semibold text-ink-900">Ultimi inserimenti</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {latest.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center text-sm text-ink-500">
            Ancora nessun annuncio pubblicato. Lancia <code className="rounded bg-ink-100 px-1.5 py-0.5">pnpm db:seed</code> per
            popolare il portale con dati di esempio.
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 rounded-3xl bg-ink-900 px-8 py-12 text-white sm:grid-cols-2 sm:px-12">
          <div>
            <h2 className="text-2xl font-semibold">Hai un immobile da vendere o affittare?</h2>
            <p className="mt-3 max-w-md text-ink-200">
              Pubblica l&apos;annuncio, ricevi le richieste in un&apos;unica casella e rispondi dal
              pannello. Le agenzie hanno una vetrina dedicata.
            </p>
          </div>
          <div className="flex items-center gap-3 sm:justify-end">
            <ButtonLink href="/registrati?ruolo=agente">Pubblica un annuncio</ButtonLink>
            <ButtonLink href="/valuta-immobile" variant="secondary">
              Valuta l&apos;immobile
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}

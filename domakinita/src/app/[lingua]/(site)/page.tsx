import Link from 'next/link'
import { SearchBar } from '@/components/SearchBar'
import { ListingCard } from '@/components/ListingCard'
import { ButtonLink } from '@/components/ui/Button'
import { getFeaturedListings, getLatestListings, getTopCities } from '@/lib/listings'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export default async function HomePage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)

  const [featured, latest, localita] = await Promise.all([
    getFeaturedListings(4),
    getLatestListings(8),
    getTopCities(8),
  ])

  return (
    <>
      <section className="bg-brand-700">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {d.home.titolo}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-100">{d.home.sottotitolo}</p>
          <SearchBar className="mx-auto mt-8 max-w-3xl text-left" />
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink-900">{d.home.inEvidenza}</h2>
              <p className="mt-1 text-sm text-ink-500">{d.home.inEvidenzaNota}</p>
            </div>
            <ButtonLink href={p('/cerca')} variant="secondary" size="sm">
              {d.home.vediTutti}
            </ButtonLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} priority={i < 2} />
            ))}
          </div>
        </section>
      ) : null}

      {localita.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="text-2xl font-semibold text-ink-900">{d.home.perLocalita}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {localita.map((posto) => (
              <Link
                key={posto.city}
                href={p(`/cerca?comune=${encodeURIComponent(posto.city)}`)}
                className="rounded-2xl border border-ink-100 bg-white px-4 py-5 shadow-card transition hover:border-brand-200"
              >
                <p className="font-medium text-ink-900">{posto.city}</p>
                <p className="mt-1 text-sm text-ink-500">
                  {posto.count} {posto.count === 1 ? d.home.immobile : d.home.immobili}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-semibold text-ink-900">{d.home.ultimi}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {latest.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center text-sm text-ink-500">
            {d.home.vuoto}
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 rounded-3xl bg-ink-900 px-8 py-12 text-white sm:grid-cols-2 sm:px-12">
          <div>
            <h2 className="text-2xl font-semibold">{d.home.venditoriTitolo}</h2>
            <p className="mt-3 max-w-md text-ink-200">{d.home.venditoriTesto}</p>
          </div>
          <div className="flex items-center gap-3 sm:justify-end">
            <ButtonLink href={p('/registrati?ruolo=agente')}>{d.nav.pubblica}</ButtonLink>
            <ButtonLink href={p('/valuta-immobile')} variant="secondary">
              {d.home.valutaCta}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}

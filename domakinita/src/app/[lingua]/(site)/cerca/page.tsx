import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ActiveFilters } from '@/components/ActiveFilters'
import { FilterPanel } from '@/components/FilterPanel'
import { ListingCard } from '@/components/ListingCard'
import { Pagination } from '@/components/Pagination'
import { SaveSearchButton } from '@/components/SaveSearchButton'
import { SearchLayout } from '@/components/SearchLayout'
import { SearchMap } from '@/components/SearchMap'
import { SortSelect } from '@/components/SortSelect'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatNumber } from '@/lib/format'
import { listingPoints, searchListings } from '@/lib/listings'
import {
  activeFilterChips,
  buildSearchQuery,
  describeFilters,
  parseArea,
  parseSearchParams,
} from '@/lib/search'
import { getDizionario } from '@/i18n'
import { CODICI_HTML, linguaSicura, percorso, type Lingua } from '@/i18n/config'

type PageProps = {
  params: Promise<{ lingua: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const filters = parseSearchParams(await searchParams)
  const descrizione = describeFilters(filters, d)
  const chips = activeFilterChips(filters, d, (v) => String(v))

  return {
    title: descrizione ? `${d.ricerca.titolo} ${descrizione}` : d.ricerca.titolo,
    // Le combinazioni di filtri sono infinite: in indice ci va la ricerca
    // semplice, non ogni sua variante.
    robots: filters.pagina > 1 || chips.length > 2 ? { index: false, follow: true } : undefined,
  }
}

/** Prezzo compatto per i segnaposti: sulla mappa non c'è spazio per le migliaia. */
function prezzoBreve(
  price: number | null,
  onRequest: boolean,
  mensile: boolean,
  lingua: Lingua,
  riservata: string,
) {
  if (onRequest || price == null) return riservata
  if (mensile) return `${formatNumber(price, lingua)} €`
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M €`
  return `${formatNumber(Math.round(price / 1000), lingua)} k €`
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const raw = await searchParams
  const filters = parseSearchParams(raw)
  const area = parseArea(filters)

  const [session, results, points] = await Promise.all([
    getSession(),
    searchListings(filters),
    listingPoints(filters),
  ])

  // Un solo giro sul database per sapere quali risultati sono già nei preferiti.
  const favorites = session
    ? new Set(
        (
          await db.favorite.findMany({
            where: { userId: session.userId, listingId: { in: results.items.map((l) => l.id) } },
            select: { listingId: true },
          })
        ).map((f) => f.listingId),
      )
    : new Set<string>()

  const euro = new Intl.NumberFormat(CODICI_HTML[lingua], {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })

  const mapPoints = points.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: prezzoBreve(
      p.price,
      p.priceOnRequest,
      p.contract === 'RENT',
      lingua,
      d.annuncio.trattativaRiservata,
    ),
    latitude: p.latitude as number,
    longitude: p.longitude as number,
  }))

  const hrefFor = (page: number) =>
    `${percorso(lingua, '/cerca')}${buildSearchQuery({ ...raw, pagina: page })}`

  const descrizione = describeFilters(filters, d)

  const listaRisultati = (
    <div>
      {results.items.length === 0 ? (
        <EmptyState
          title={d.ricerca.nessunRisultato}
          description={area ? d.ricerca.nessunRisultatoArea : d.ricerca.nessunRisultatoTesto}
          action={
            <ButtonLink href={percorso(lingua, '/cerca')} variant="secondary">
              {d.ricerca.azzeraRicerca}
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {results.items.map((listing, i) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorite={favorites.has(listing.id)}
              priority={i < 2}
            />
          ))}
        </div>
      )}

      <Pagination page={results.page} pageCount={results.pageCount} buildHref={hrefFor} />
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink-900">
        {d.ricerca.titolo} {descrizione || d.ricerca.aCefalonia}
      </h1>

      <div className="mt-5 space-y-4">
        <Suspense fallback={<div className="h-20 animate-pulse rounded-2xl bg-white" />}>
          <FilterPanel total={results.total} />
        </Suspense>

        <Suspense fallback={null}>
          <ActiveFilters chips={activeFilterChips(filters, d, (v) => euro.format(v))} />
        </Suspense>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Suspense fallback={null}>
            <SaveSearchButton suggestedName={descrizione || d.ricerca.titolo} />
          </Suspense>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>

        <SearchLayout
          results={listaRisultati}
          map={
            <Suspense fallback={<div className="h-[520px] animate-pulse rounded-2xl bg-white" />}>
              <div>
                <h2 className="mb-2 text-base font-semibold text-ink-900">{d.mappa.titolo}</h2>
                <SearchMap points={mapPoints} area={area} />
              </div>
            </Suspense>
          }
        />
      </div>
    </div>
  )
}

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
import { listingPoints, searchListings } from '@/lib/listings'
import {
  activeFilterChips,
  buildSearchQuery,
  describeFilters,
  parseArea,
  parseSearchParams,
} from '@/lib/search'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const filters = parseSearchParams(await searchParams)
  const description = describeFilters(filters)
  const chips = activeFilterChips(filters)

  return {
    title: description ? `Immobili ${description}` : 'Cerca immobili',
    // Le combinazioni di filtri sono infinite: in indice ci va la ricerca
    // semplice, non ogni sua variante.
    robots: filters.pagina > 1 || chips.length > 2 ? { index: false, follow: true } : undefined,
  }
}

/** Prezzo compatto per i segnaposti: sulla mappa non c'è spazio per le migliaia. */
function shortPrice(price: number | null, onRequest: boolean, monthly: boolean) {
  if (onRequest || price == null) return 'Riservata'
  if (monthly) return `${Math.round(price)} €`
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M €`
  return `${Math.round(price / 1000)} mila €`
}

export default async function SearchPage({ searchParams }: PageProps) {
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

  const mapPoints = points.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: shortPrice(p.price, p.priceOnRequest, p.contract === 'RENT'),
    latitude: p.latitude as number,
    longitude: p.longitude as number,
  }))

  const hrefFor = (page: number) => `/cerca${buildSearchQuery({ ...raw, pagina: page })}`

  const listaRisultati = (
    <div>
      {results.items.length === 0 ? (
        <EmptyState
          title="Nessun immobile con questi filtri"
          description={
            area
              ? 'Prova ad allargare l’area disegnata sulla mappa o a togliere qualche filtro.'
              : 'Prova ad allargare la zona, ad alzare il prezzo massimo o a togliere qualche dotazione.'
          }
          action={
            <ButtonLink href="/cerca" variant="secondary">
              Azzera la ricerca
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
        Immobili {describeFilters(filters) || 'a Cefalonia'}
      </h1>

      <div className="mt-5 space-y-4">
        <Suspense fallback={<div className="h-20 animate-pulse rounded-2xl bg-white" />}>
          <FilterPanel total={results.total} />
        </Suspense>

        <Suspense fallback={null}>
          <ActiveFilters chips={activeFilterChips(filters)} />
        </Suspense>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Suspense fallback={null}>
            <SaveSearchButton suggestedName={describeFilters(filters) || 'Tutti gli immobili'} />
          </Suspense>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>

        <SearchLayout
          results={listaRisultati}
          map={
            <Suspense fallback={<div className="h-[520px] animate-pulse rounded-2xl bg-white" />}>
              <SearchMap points={mapPoints} area={area} />
            </Suspense>
          }
        />
      </div>
    </div>
  )
}

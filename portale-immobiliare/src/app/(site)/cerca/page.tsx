import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FilterPanel } from '@/components/FilterPanel'
import { ListingCard } from '@/components/ListingCard'
import { ListingMap } from '@/components/ListingMap'
import { Pagination } from '@/components/Pagination'
import { SaveSearchButton } from '@/components/SaveSearchButton'
import { SortSelect } from '@/components/SortSelect'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatMonthlyPrice, formatPrice } from '@/lib/format'
import { searchListings } from '@/lib/listings'
import { buildSearchQuery, describeFilters, parseSearchParams } from '@/lib/search'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const filters = parseSearchParams(await searchParams)
  const description = describeFilters(filters)
  return {
    title: description ? `Immobili ${description}` : 'Cerca immobili',
    // Le pagine di ricerca filtrate non vanno tutte in indice: si genererebbero
    // migliaia di URL quasi identici.
    robots: filters.pagina > 1 || Object.keys(filters).length > 3 ? { index: false, follow: true } : undefined,
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const filters = parseSearchParams(raw)
  const [session, results] = await Promise.all([getSession(), searchListings(filters)])

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

  const points = results.items
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      price: l.contract === 'RENT' ? formatMonthlyPrice(l.price, l.priceOnRequest) : formatPrice(l.price, l.priceOnRequest),
      latitude: l.latitude as number,
      longitude: l.longitude as number,
    }))

  const hrefFor = (page: number) => `/cerca${buildSearchQuery({ ...raw, pagina: page })}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink-900">
        Immobili {describeFilters(filters) || 'in Italia'}
      </h1>

      <div className="mt-5 space-y-5">
        <Suspense fallback={<div className="h-20 animate-pulse rounded-2xl bg-white" />}>
          <FilterPanel total={results.total} />
        </Suspense>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Suspense fallback={null}>
            <SaveSearchButton suggestedName={describeFilters(filters) || 'Tutti gli immobili'} />
          </Suspense>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            {results.items.length === 0 ? (
              <EmptyState
                title="Nessun immobile con questi filtri"
                description="Prova ad allargare la zona, ad alzare il prezzo massimo o a togliere qualche dotazione."
                action={<ButtonLink href="/cerca" variant="secondary">Azzera la ricerca</ButtonLink>}
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

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ListingMap points={points} className="h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

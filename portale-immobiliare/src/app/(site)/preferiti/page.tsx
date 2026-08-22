import type { Metadata } from 'next'
import { ListingCard } from '@/components/ListingCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { listingCardSelect } from '@/lib/listings'

export const metadata: Metadata = { title: 'I tuoi preferiti', robots: { index: false } }

export default async function FavoritesPage() {
  const session = await requireUser('/preferiti')

  const favorites = await db.favorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { listing: { select: listingCardSelect } },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">I tuoi preferiti</h1>
      <p className="mt-1 text-sm text-ink-500">{favorites.length} immobili salvati</p>

      {favorites.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Non hai ancora salvato nessun immobile"
            description="Il cuore in alto a destra di ogni annuncio lo mette qui."
            action={<ButtonLink href="/cerca">Vai alla ricerca</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {favorites.map((f) => (
            <ListingCard key={f.listingId} listing={f.listing} isFavorite />
          ))}
        </div>
      )}
    </div>
  )
}

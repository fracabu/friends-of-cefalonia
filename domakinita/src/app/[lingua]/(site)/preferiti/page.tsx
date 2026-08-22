import type { Metadata } from 'next'
import { ListingCard } from '@/components/ListingCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { listingCardSelect } from '@/lib/listings'
import { getDizionario, interpola } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export const metadata: Metadata = { robots: { index: false } }

export default async function FavoritesPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const session = await requireUser(percorso(lingua, '/preferiti'))

  const favorites = await db.favorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { listing: { select: listingCardSelect } },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">{d.preferiti.titolo}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {interpola(d.preferiti.salvati, { n: favorites.length })}
      </p>

      {favorites.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={d.preferiti.vuotoTitolo}
            description={d.preferiti.vuotoTesto}
            action={<ButtonLink href={percorso(lingua, '/cerca')}>{d.preferiti.vaiRicerca}</ButtonLink>}
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

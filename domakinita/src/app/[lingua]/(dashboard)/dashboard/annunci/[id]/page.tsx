import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ListingForm } from '@/components/ListingForm'
import { canEditListing, requireAgent } from '@/lib/auth'
import { db } from '@/lib/db'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export const metadata: Metadata = { robots: { index: false } }

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ lingua: string; id: string }>
}) {
  const { lingua: grezza, id } = await params
  const lingua = linguaSicura(grezza)
  const d = getDizionario(lingua)

  const session = await requireAgent(percorso(lingua, '/dashboard/annunci'))
  const listing = await db.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { position: 'asc' } }, translations: true },
  })

  if (!listing || !canEditListing(session, listing)) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">{d.dashboard.modificaAnnuncio}</h1>
        {listing.status === 'PUBLISHED' ? (
          <Link
            href={percorso(lingua, `/annuncio/${listing.slug}`)}
            className="text-sm text-brand-700 hover:underline"
          >
            {d.dashboard.vediScheda}
          </Link>
        ) : null}
      </div>

      <ListingForm listing={listing} images={listing.images} traduzioni={listing.translations} />
    </div>
  )
}

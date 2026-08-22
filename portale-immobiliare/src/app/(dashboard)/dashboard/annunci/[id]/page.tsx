import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ListingForm } from '@/components/ListingForm'
import { canEditListing, requireAgent } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Modifica annuncio', robots: { index: false } }

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAgent('/dashboard/annunci')
  const listing = await db.listing.findUnique({
    where: { id: (await params).id },
    include: { images: { orderBy: { position: 'asc' } } },
  })

  if (!listing || !canEditListing(session, listing)) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">Modifica annuncio</h1>
        {listing.status === 'PUBLISHED' ? (
          <Link href={`/annuncio/${listing.slug}`} className="text-sm text-brand-700 hover:underline">
            Vedi la scheda pubblica
          </Link>
        ) : null}
      </div>

      <ListingForm listing={listing} images={listing.images} />
    </div>
  )
}

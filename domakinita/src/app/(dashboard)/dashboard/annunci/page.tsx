import Link from 'next/link'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { requireAgent } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate, formatPrice } from '@/lib/format'
import { LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/labels'

export const metadata: Metadata = { title: 'I miei annunci', robots: { index: false } }

const STATUS_TONE = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  RESERVED: 'warning',
  SOLD: 'brand',
  RENTED: 'brand',
  ARCHIVED: 'neutral',
} as const

export default async function MyListingsPage() {
  const session = await requireAgent('/dashboard/annunci')
  const scope = session.agencyId ? { agencyId: session.agencyId } : { ownerId: session.userId }

  const listings = await db.listing.findMany({
    where: scope,
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">I miei annunci</h1>
        <ButtonLink href="/dashboard/annunci/nuovo">Nuovo annuncio</ButtonLink>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="Nessun annuncio"
          description="Pubblica il primo immobile: bastano titolo, prezzo, superficie e qualche fotografia."
          action={<ButtonLink href="/dashboard/annunci/nuovo">Crea annuncio</ButtonLink>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-ink-100 text-left text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Immobile</th>
                <th className="px-5 py-3 font-medium">Stato</th>
                <th className="px-5 py-3 font-medium">Prezzo</th>
                <th className="px-5 py-3 font-medium">Visite</th>
                <th className="px-5 py-3 font-medium">Richieste</th>
                <th className="px-5 py-3 font-medium">Aggiornato</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900">{listing.title}</p>
                    <p className="text-xs text-ink-500">
                      {PROPERTY_TYPE_LABELS[listing.type]} · {listing.city} ({listing.province})
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={STATUS_TONE[listing.status]}>
                      {LISTING_STATUS_LABELS[listing.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    {formatPrice(listing.price, listing.priceOnRequest)}
                  </td>
                  <td className="px-5 py-4 text-ink-700">{listing.views}</td>
                  <td className="px-5 py-4 text-ink-700">{listing._count.leads}</td>
                  <td className="px-5 py-4 text-ink-500">{formatDate(listing.updatedAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/annunci/${listing.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { requireAgent } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate, formatPrice } from '@/lib/format'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export const metadata: Metadata = { robots: { index: false } }

const TONO = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  RESERVED: 'warning',
  SOLD: 'brand',
  RENTED: 'brand',
  ARCHIVED: 'neutral',
} as const

export default async function MyListingsPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)

  const session = await requireAgent(p('/dashboard/annunci'))
  const scope = session.agencyId ? { agencyId: session.agencyId } : { ownerId: session.userId }

  const listings = await db.listing.findMany({
    where: scope,
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">{d.dashboard.mieiAnnunci}</h1>
        <ButtonLink href={p('/dashboard/annunci/nuovo')}>{d.dashboard.nuovoAnnuncio}</ButtonLink>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title={d.dashboard.nessunAnnuncio}
          description={d.dashboard.nessunAnnuncioTesto}
          action={<ButtonLink href={p('/dashboard/annunci/nuovo')}>{d.dashboard.creaAnnuncio}</ButtonLink>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-surface shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-ink-100 text-left text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">{d.dashboard.immobile}</th>
                <th className="px-5 py-3 font-medium">{d.dashboard.statoCol}</th>
                <th className="px-5 py-3 font-medium">{d.dashboard.prezzoCol}</th>
                <th className="px-5 py-3 font-medium">{d.dashboard.visiteCol}</th>
                <th className="px-5 py-3 font-medium">{d.dashboard.richiesteCol}</th>
                <th className="px-5 py-3 font-medium">{d.dashboard.aggiornatoCol}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900">{listing.title}</p>
                    <p className="text-xs text-ink-500">
                      {d.et.tipo[listing.type]} · {listing.city} ({listing.province})
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={TONO[listing.status]}>{d.et.statoAnnuncio[listing.status]}</Badge>
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    {formatPrice(listing.price, listing.priceOnRequest, lingua, d.annuncio.trattativaRiservata)}
                  </td>
                  <td className="px-5 py-4 text-ink-700">{listing.views}</td>
                  <td className="px-5 py-4 text-ink-700">{listing._count.leads}</td>
                  <td className="px-5 py-4 text-ink-500">{formatDate(listing.updatedAt, lingua)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={p(`/dashboard/annunci/${listing.id}`)}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {d.dashboard.modifica}
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

import Link from 'next/link'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { requireAgent } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/format'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export const metadata: Metadata = { robots: { index: false } }

const TONO = {
  NEW: 'brand',
  CONTACTED: 'success',
  SCHEDULED: 'warning',
  CLOSED: 'neutral',
  SPAM: 'danger',
} as const

export default async function LeadsPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)

  const session = await requireAgent(p('/dashboard/richieste'))
  const scope = session.agencyId ? { agencyId: session.agencyId } : { ownerId: session.userId }

  const leads = await db.lead.findMany({
    where: { listing: scope },
    orderBy: { createdAt: 'desc' },
    include: { listing: { select: { title: true, slug: true } } },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">{d.dashboard.richieste}</h1>

      {leads.length === 0 ? (
        <EmptyState title={d.dashboard.nessunaRichiesta} description={d.dashboard.richiesteVuote} />
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-900">{lead.name}</p>
                  <p className="text-sm text-ink-500">
                    <a href={`mailto:${lead.email}`} className="hover:underline">
                      {lead.email}
                    </a>
                    {lead.phone ? (
                      <>
                        {' · '}
                        <a href={`tel:${lead.phone}`} className="hover:underline">
                          {lead.phone}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={TONO[lead.status]}>{d.et.richiesta[lead.status]}</Badge>
                  <span className="text-sm text-ink-400">{formatDate(lead.createdAt, lingua)}</span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm text-ink-700">{lead.message}</p>

              <p className="mt-3 text-xs text-ink-400">
                {d.dashboard.immobile}:{' '}
                <Link href={p(`/annuncio/${lead.listing.slug}`)} className="hover:underline">
                  {lead.listing.title}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

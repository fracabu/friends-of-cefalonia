import type { Metadata } from 'next'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/Button'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate, formatNumber } from '@/lib/format'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export const metadata: Metadata = { robots: { index: false } }

export default async function DashboardPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)
  const session = await requireUser(p('/dashboard'))

  // Un'agenzia vede tutto il portafoglio dei colleghi, un privato solo il suo.
  const scope = session.agencyId ? { agencyId: session.agencyId } : { ownerId: session.userId }

  const [published, drafts, leads, views, recentLeads] = await Promise.all([
    db.listing.count({ where: { ...scope, status: 'PUBLISHED' } }),
    db.listing.count({ where: { ...scope, status: 'DRAFT' } }),
    db.lead.count({ where: { listing: scope, status: 'NEW' } }),
    db.listing.aggregate({ where: scope, _sum: { views: true } }),
    db.lead.findMany({
      where: { listing: scope },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { listing: { select: { title: true, slug: true } } },
    }),
  ])

  const riquadri = [
    { label: d.dashboard.pubblicati, value: published },
    { label: d.dashboard.bozze, value: drafts },
    { label: d.dashboard.daLeggere, value: leads },
    { label: d.dashboard.visualizzazioni, value: views._sum.views ?? 0 },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">{d.dashboard.riepilogo}</h1>
        <ButtonLink href={p('/dashboard/annunci/nuovo')}>{d.dashboard.nuovoAnnuncio}</ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {riquadri.map((riquadro) => (
          <div key={riquadro.label} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <p className="text-sm text-ink-500">{riquadro.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink-900">
              {formatNumber(riquadro.value, lingua)}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-semibold text-ink-900">{d.dashboard.ultimeRichieste}</h2>
          <Link href={p('/dashboard/richieste')} className="text-sm text-brand-700 hover:underline">
            {d.dashboard.vediTutte}
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-500">{d.dashboard.nessunaRichiesta}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <div>
                  <p className="font-medium text-ink-900">{lead.name}</p>
                  <p className="text-sm text-ink-500">
                    {d.dashboard.su}{' '}
                    <Link href={p(`/annuncio/${lead.listing.slug}`)} className="hover:underline">
                      {lead.listing.title}
                    </Link>
                  </p>
                </div>
                <p className="text-sm text-ink-400">{formatDate(lead.createdAt, lingua)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

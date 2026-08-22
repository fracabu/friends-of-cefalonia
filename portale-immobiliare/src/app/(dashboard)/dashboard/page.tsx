import type { Metadata } from 'next'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/Button'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Pannello', robots: { index: false } }

export default async function DashboardPage() {
  const session = await requireUser('/dashboard')

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

  const cards = [
    { label: 'Annunci pubblicati', value: published },
    { label: 'Bozze', value: drafts },
    { label: 'Richieste da leggere', value: leads },
    { label: 'Visualizzazioni totali', value: views._sum.views ?? 0 },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">Riepilogo</h1>
        <ButtonLink href="/dashboard/annunci/nuovo">Nuovo annuncio</ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <p className="text-sm text-ink-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink-900">
              {card.value.toLocaleString('it-IT')}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-semibold text-ink-900">Ultime richieste</h2>
          <Link href="/dashboard/richieste" className="text-sm text-brand-700 hover:underline">
            Vedi tutte
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-500">
            Nessuna richiesta ricevuta finora.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <div>
                  <p className="font-medium text-ink-900">{lead.name}</p>
                  <p className="text-sm text-ink-500">
                    su{' '}
                    <Link href={`/annuncio/${lead.listing.slug}`} className="hover:underline">
                      {lead.listing.title}
                    </Link>
                  </p>
                </div>
                <p className="text-sm text-ink-400">{formatDate(lead.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

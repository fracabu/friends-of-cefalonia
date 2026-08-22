import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'Agenzie immobiliari',
  description: 'Le agenzie che pubblicano annunci sul portale.',
}

export const revalidate = 600

export default async function AgenciesPage() {
  const agencies = await db.agency.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { listings: { where: { status: 'PUBLISHED' } } } } },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">Agenzie immobiliari</h1>

      {agencies.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Nessuna agenzia registrata" />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agencies.map((agency) => (
            <Link
              key={agency.id}
              href={`/agenzie/${agency.slug}`}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition hover:border-brand-200"
            >
              <p className="font-medium text-ink-900">{agency.name}</p>
              <p className="mt-1 text-sm text-ink-500">
                {agency.city ? `${agency.city} · ` : ''}
                {agency._count.listings} annunci
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

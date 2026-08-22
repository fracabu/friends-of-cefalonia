import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { EmptyState } from '@/components/ui/EmptyState'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lingua: string }>
}): Promise<Metadata> {
  const d = getDizionario(linguaSicura((await params).lingua))
  return { title: d.agenzie.titolo }
}

export default async function AgenciesPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)

  const agencies = await db.agency.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { listings: { where: { status: 'PUBLISHED' } } } } },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">{d.agenzie.titolo}</h1>

      {agencies.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={d.agenzie.nessuna} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agencies.map((agency) => (
            <Link
              key={agency.id}
              href={percorso(lingua, `/agenzie/${agency.slug}`)}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition hover:border-brand-200"
            >
              <p className="font-medium text-ink-900">{agency.name}</p>
              <p className="mt-1 text-sm text-ink-500">
                {agency.city ? `${agency.city} · ` : ''}
                {agency._count.listings} {d.agenzie.annunci}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

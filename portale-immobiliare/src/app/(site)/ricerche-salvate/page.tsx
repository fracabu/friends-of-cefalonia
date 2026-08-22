import Link from 'next/link'
import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Ricerche salvate', robots: { index: false } }

const FREQUENCY_LABELS = {
  NONE: 'Nessun avviso',
  INSTANT: 'Avviso immediato',
  DAILY: 'Riepilogo giornaliero',
  WEEKLY: 'Riepilogo settimanale',
} as const

export default async function SavedSearchesPage() {
  const session = await requireUser('/ricerche-salvate')
  const searches = await db.savedSearch.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">Ricerche salvate</h1>
      <p className="mt-1 text-sm text-ink-500">
        Ogni ricerca salvata può avvisarti quando esce un immobile che le corrisponde.
      </p>

      {searches.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nessuna ricerca salvata"
            description="Imposta i filtri che ti interessano e premi «Salva questa ricerca»."
            action={<ButtonLink href="/cerca">Vai alla ricerca</ButtonLink>}
          />
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          {searches.map((search) => (
            <li key={search.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <Link
                  href={`/cerca?${String(search.query)}`}
                  className="font-medium text-ink-900 hover:underline"
                >
                  {search.name}
                </Link>
                <p className="mt-1 text-xs text-ink-400">salvata il {formatDate(search.createdAt)}</p>
              </div>
              <Badge tone={search.frequency === 'NONE' ? 'neutral' : 'brand'}>
                {FREQUENCY_LABELS[search.frequency]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

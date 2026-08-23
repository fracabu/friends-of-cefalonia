import Link from 'next/link'
import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/format'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export const metadata: Metadata = { robots: { index: false } }

export default async function SavedSearchesPage({
  params,
}: {
  params: Promise<{ lingua: string }>
}) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const session = await requireUser(percorso(lingua, '/ricerche-salvate'))

  const searches = await db.savedSearch.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">{d.ricercheSalvate.titolo}</h1>
      <p className="mt-1 text-sm text-ink-500">{d.ricercheSalvate.sottotitolo}</p>

      {searches.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={d.ricercheSalvate.vuotoTitolo}
            description={d.ricercheSalvate.vuotoTesto}
            action={<ButtonLink href={percorso(lingua, '/cerca')}>{d.preferiti.vaiRicerca}</ButtonLink>}
          />
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-surface">
          {searches.map((search) => (
            <li key={search.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <Link
                  href={percorso(lingua, `/cerca?${String(search.query)}`)}
                  className="font-medium text-ink-900 hover:underline"
                >
                  {search.name}
                </Link>
                <p className="mt-1 text-xs text-ink-400">
                  {d.ricercheSalvate.salvataIl} {formatDate(search.createdAt, lingua)}
                </p>
              </div>
              <Badge tone={search.frequency === 'NONE' ? 'neutral' : 'brand'}>
                {d.ricercheSalvate[search.frequency]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ListingCard } from '@/components/ListingCard'
import { Badge } from '@/components/ui/Badge'
import { db } from '@/lib/db'
import { listingCardSelect } from '@/lib/listings'
import { getDizionario, interpola } from '@/i18n'
import { linguaSicura } from '@/i18n/config'

type PageProps = { params: Promise<{ lingua: string; slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const agency = await db.agency.findUnique({ where: { slug } })
  if (!agency) return { title: 'Agenzia' }
  return { title: agency.name, description: agency.description ?? undefined }
}

export default async function AgencyPage({ params }: PageProps) {
  const { lingua: grezza, slug } = await params
  const lingua = linguaSicura(grezza)
  const d = getDizionario(lingua)

  const agency = await db.agency.findUnique({
    where: { slug },
    include: {
      listings: {
        where: { status: 'PUBLISHED' },
        select: listingCardSelect,
        orderBy: { publishedAt: 'desc' },
        take: 48,
      },
    },
  })
  if (!agency) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="rounded-2xl border border-ink-100 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">{agency.name}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {[agency.addressLine, agency.city, agency.province].filter(Boolean).join(', ')}
            </p>
          </div>
          {agency.verified ? <Badge tone="success">{d.agenzie.verificata}</Badge> : null}
        </div>

        {agency.description ? <p className="mt-4 max-w-3xl text-ink-700">{agency.description}</p> : null}

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {agency.phone ? (
            <a href={`tel:${agency.phone}`} className="text-brand-700 hover:underline">
              {agency.phone}
            </a>
          ) : null}
          {agency.email ? (
            <a href={`mailto:${agency.email}`} className="text-brand-700 hover:underline">
              {agency.email}
            </a>
          ) : null}
          {agency.website ? (
            <a href={agency.website} target="_blank" rel="noopener" className="text-brand-700 hover:underline">
              {d.agenzie.sito}
            </a>
          ) : null}
        </div>
      </header>

      <h2 className="mt-10 text-xl font-semibold text-ink-900">
        {interpola(d.agenzie.portafoglio, { n: agency.listings.length })}
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {agency.listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}

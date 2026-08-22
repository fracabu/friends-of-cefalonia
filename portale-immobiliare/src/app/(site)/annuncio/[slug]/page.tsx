import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/ContactForm'
import { Gallery } from '@/components/Gallery'
import { ListingCard } from '@/components/ListingCard'
import { ListingMap } from '@/components/ListingMap'
import { Badge } from '@/components/ui/Badge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  formatDate,
  formatFloor,
  formatMonthlyPrice,
  formatPrice,
  formatPricePerSqm,
  formatSurface,
} from '@/lib/format'
import {
  AMENITIES,
  CONDITION_LABELS,
  ENERGY_LABELS,
  FURNISHED_LABELS,
  HEATING_LABELS,
  LISTING_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from '@/lib/labels'
import { getListingBySlug, getSimilarListings, incrementViews } from '@/lib/listings'
import { listingJsonLd } from '@/lib/seo'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getListingBySlug((await params).slug)
  if (!listing) return { title: 'Annuncio non disponibile' }

  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    alternates: { canonical: `/annuncio/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 200),
      images: listing.images[0] ? [listing.images[0].url] : undefined,
    },
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params
  const [listing, session] = await Promise.all([getListingBySlug(slug), getSession()])
  if (!listing) notFound()

  void incrementViews(listing.id)

  const [similar, isFavorite] = await Promise.all([
    getSimilarListings(listing),
    session
      ? db.favorite
          .findUnique({
            where: { userId_listingId: { userId: session.userId, listingId: listing.id } },
          })
          .then(Boolean)
      : Promise.resolve(false),
  ])

  const price =
    listing.contract === 'RENT'
      ? formatMonthlyPrice(listing.price, listing.priceOnRequest)
      : formatPrice(listing.price, listing.priceOnRequest)

  const amenities = AMENITIES.filter((a) => listing[a.key])

  const details: Array<[string, string | null]> = [
    ['Tipologia', PROPERTY_TYPE_LABELS[listing.type]],
    ['Superficie', formatSurface(listing.surface)],
    ['Locali', String(listing.rooms)],
    ['Camere da letto', listing.bedrooms ? String(listing.bedrooms) : null],
    ['Bagni', listing.bathrooms ? String(listing.bathrooms) : null],
    ['Piano', formatFloor(listing.floor, listing.totalFloors)],
    ['Anno di costruzione', listing.yearBuilt ? String(listing.yearBuilt) : null],
    ['Stato', listing.condition ? CONDITION_LABELS[listing.condition] : null],
    ['Arredamento', listing.furnished ? FURNISHED_LABELS[listing.furnished] : null],
    ['Riscaldamento', listing.heating ? HEATING_LABELS[listing.heating] : null],
    ['Classe energetica', listing.energy ? ENERGY_LABELS[listing.energy] : null],
    ['Spese condominiali', listing.condoFees ? `${listing.condoFees} €/mese` : null],
    ['Cauzione', listing.deposit ? `${listing.deposit} €` : null],
    ['Prezzo al metro quadro', formatPricePerSqm(listing.price, listing.surface)],
  ]

  return (
    <article className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd(listing)) }}
      />

      <nav aria-label="Percorso" className="mb-4 text-sm text-ink-500">
        <Link href="/" className="hover:text-ink-900">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link href={`/cerca?comune=${encodeURIComponent(listing.city)}`} className="hover:text-ink-900">
          {listing.city}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-ink-700">{PROPERTY_TYPE_LABELS[listing.type]}</span>
      </nav>

      <Gallery
        photos={listing.images.map((i) => ({ url: i.url, alt: i.alt, width: i.width, height: i.height }))}
        title={listing.title}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{listing.contract === 'SALE' ? 'Vendita' : 'Affitto'}</Badge>
                {listing.status !== 'PUBLISHED' ? (
                  <Badge tone="warning">{LISTING_STATUS_LABELS[listing.status]}</Badge>
                ) : null}
                {listing.featured ? <Badge tone="success">In evidenza</Badge> : null}
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl">{listing.title}</h1>
              <p className="mt-2 text-ink-600">
                {listing.hideAddress || !listing.addressLine
                  ? `${listing.zone ? `${listing.zone}, ` : ''}${listing.city} (${listing.province})`
                  : `${listing.addressLine}, ${listing.city} (${listing.province})`}
              </p>
            </div>
            <FavoriteButton listingId={listing.id} initial={isFavorite} />
          </div>

          <p className="mt-6 text-3xl font-semibold text-ink-900">{price}</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-ink-100 pt-6 sm:grid-cols-3">
            {details
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-ink-500">{label}</dt>
                  <dd className="font-medium text-ink-900">{value}</dd>
                </div>
              ))}
          </dl>

          <section className="mt-10 border-t border-ink-100 pt-6">
            <h2 className="text-lg font-semibold text-ink-900">Descrizione</h2>
            <div className="mt-3 whitespace-pre-line text-ink-700">{listing.description}</div>
          </section>

          {amenities.length || listing.features.length ? (
            <section className="mt-10 border-t border-ink-100 pt-6">
              <h2 className="text-lg font-semibold text-ink-900">Dotazioni</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <li key={a.key}>
                    <Badge>{a.label}</Badge>
                  </li>
                ))}
                {listing.features.map((f) => (
                  <li key={f}>
                    <Badge>{f}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {listing.latitude && listing.longitude ? (
            <section className="mt-10 border-t border-ink-100 pt-6">
              <h2 className="text-lg font-semibold text-ink-900">Dove si trova</h2>
              <p className="mt-1 text-sm text-ink-500">
                {listing.hideAddress
                  ? "La posizione è indicativa: l'indirizzo esatto viene comunicato in fase di contatto."
                  : listing.addressLine}
              </p>
              <ListingMap
                className="mt-4 h-80 w-full overflow-hidden rounded-2xl"
                zoom={15}
                center={[listing.latitude, listing.longitude]}
                points={[
                  {
                    id: listing.id,
                    slug: listing.slug,
                    title: listing.title,
                    price,
                    latitude: listing.latitude,
                    longitude: listing.longitude,
                  },
                ]}
              />
            </section>
          ) : null}

          <p className="mt-8 text-sm text-ink-400">
            Riferimento {listing.reference ?? listing.id.slice(-8)} · pubblicato il{' '}
            {formatDate(listing.publishedAt ?? listing.createdAt)} · {listing.views} visualizzazioni
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {listing.agency ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <p className="text-sm text-ink-500">Annuncio di</p>
              <Link href={`/agenzie/${listing.agency.slug}`} className="mt-1 block font-semibold text-ink-900 hover:underline">
                {listing.agency.name}
              </Link>
              {listing.agency.phone ? (
                <a href={`tel:${listing.agency.phone}`} className="mt-3 block text-sm text-brand-700">
                  {listing.agency.phone}
                </a>
              ) : null}
            </div>
          ) : null}

          <ContactForm listingId={listing.id} agencyName={listing.agency?.name ?? listing.owner.name} />
        </aside>
      </div>

      {similar.length ? (
        <section className="mt-16 border-t border-ink-100 pt-10">
          <h2 className="text-xl font-semibold text-ink-900">Immobili simili</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}

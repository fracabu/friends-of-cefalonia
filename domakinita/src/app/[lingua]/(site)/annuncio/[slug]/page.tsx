import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/ContactForm'
import { Gallery } from '@/components/Gallery'
import { ListingCard } from '@/components/ListingCard'
import { ListingMap } from '@/components/ListingMap'
import { Badge } from '@/components/ui/Badge'
import { IconaBagni, IconaLocali, IconaPiano, IconaSuperficie } from '@/components/ui/Icons'
import { FavoriteButton } from '@/components/FavoriteButton'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  formatDate,
  formatFloor,
  formatMonthlyPrice,
  formatNumber,
  formatPrice,
  formatPricePerSqm,
  formatSurface,
} from '@/lib/format'
import { AMENITIES } from '@/lib/labels'
import { getListingBySlug, getSimilarListings, incrementViews, testoAnnuncio } from '@/lib/listings'
import { listingJsonLd } from '@/lib/seo'
import { getDizionario } from '@/i18n'
import { LINGUE, linguaSicura, percorso } from '@/i18n/config'

type PageProps = { params: Promise<{ lingua: string; slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lingua: grezza, slug } = await params
  const lingua = linguaSicura(grezza)
  const listing = await getListingBySlug(slug)
  if (!listing) return { title: 'Annuncio non disponibile' }

  const testo = testoAnnuncio(listing, lingua)

  return {
    title: testo.title,
    description: testo.description.slice(0, 160),
    alternates: {
      canonical: percorso(lingua, `/annuncio/${listing.slug}`),
      // Ogni lingua ha il suo indirizzo, e lo dichiara alle altre.
      languages: Object.fromEntries(
        LINGUE.map((l) => [l, percorso(l, `/annuncio/${listing.slug}`)]),
      ),
    },
    openGraph: {
      title: testo.title,
      description: testo.description.slice(0, 200),
      images: listing.images[0] ? [listing.images[0].url] : undefined,
    },
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { lingua: grezza, slug } = await params
  const lingua = linguaSicura(grezza)
  const d = getDizionario(lingua)

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

  const testo = testoAnnuncio(listing, lingua)

  const price =
    listing.contract === 'RENT'
      ? formatMonthlyPrice(
          listing.price,
          listing.priceOnRequest,
          lingua,
          d.annuncio.trattativaRiservata,
          d.annuncio.alMese,
        )
      : formatPrice(listing.price, listing.priceOnRequest, lingua, d.annuncio.trattativaRiservata)

  const amenities = AMENITIES.filter((a) => listing[a.key])

  const dettagli: Array<[string, string | null]> = [
    [d.annuncio.tipologia, d.et.tipo[listing.type]],
    [d.annuncio.superficie, formatSurface(listing.surface, lingua)],
    [d.annuncio.locali, listing.type === 'LAND' ? null : formatNumber(listing.rooms, lingua)],
    [d.annuncio.camere, listing.bedrooms ? formatNumber(listing.bedrooms, lingua) : null],
    [d.annuncio.bagni, listing.bathrooms ? formatNumber(listing.bathrooms, lingua) : null],
    [d.annuncio.piano, formatFloor(listing.floor, listing.totalFloors, d.annuncio, lingua)],
    [d.annuncio.anno, listing.yearBuilt ? String(listing.yearBuilt) : null],
    [d.annuncio.stato, listing.condition ? d.et.condizione[listing.condition] : null],
    [d.annuncio.arredamento, listing.furnished ? d.et.arredamento[listing.furnished] : null],
    [d.annuncio.riscaldamento, listing.heating ? d.et.riscaldamento[listing.heating] : null],
    [d.annuncio.classe, listing.energy ?? null],
    [d.annuncio.spese, listing.condoFees ? `${listing.condoFees} €` : null],
    [d.annuncio.cauzione, listing.deposit ? `${listing.deposit} €` : null],
    [d.annuncio.prezzoMq, formatPricePerSqm(listing.price, listing.surface, lingua)],
  ]

  return (
    <article className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listingJsonLd({ ...listing, title: testo.title, description: testo.description })),
        }}
      />

      <nav aria-label={d.annuncio.percorso} className="mb-4 text-sm text-ink-500">
        <Link href={percorso(lingua, '/')} className="hover:text-ink-900">
          {d.nav.homeBreve}
        </Link>
        <span className="px-1.5">/</span>
        <Link
          href={percorso(lingua, `/cerca?comune=${encodeURIComponent(listing.city)}`)}
          className="hover:text-ink-900"
        >
          {listing.city}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-ink-700">{d.et.tipo[listing.type]}</span>
      </nav>

      <Gallery
        photos={listing.images.map((i) => ({ url: i.url, alt: i.alt, width: i.width, height: i.height }))}
        title={testo.title}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{d.et.contratto[listing.contract]}</Badge>
                {listing.status !== 'PUBLISHED' ? (
                  <Badge tone="warning">{d.et.statoAnnuncio[listing.status]}</Badge>
                ) : null}
                {listing.featured ? <Badge tone="success">{d.annuncio.inEvidenza}</Badge> : null}
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-[28px]">{testo.title}</h1>
              <p className="mt-2 text-ink-600">
                {listing.hideAddress || !listing.addressLine
                  ? `${listing.zone ? `${listing.zone}, ` : ''}${listing.city} (${listing.province})`
                  : `${listing.addressLine}, ${listing.city} (${listing.province})`}
              </p>
            </div>
            <FavoriteButton listingId={listing.id} initial={isFavorite} />
          </div>

          <p className="mt-5 text-[32px] font-bold leading-none tracking-tight text-ink-900">{price}</p>

          {/* La riga che si guarda per prima: metri quadri, locali, bagni. */}
          <div className="mt-5 flex flex-wrap gap-6 rounded-xl border border-ink-100 bg-white px-5 py-4">
            <span className="flex items-center gap-2 text-ink-800">
              <IconaSuperficie className="h-5 w-5 text-ink-400" />
              {formatSurface(listing.surface, lingua)}
            </span>
            {listing.type !== 'LAND' ? (
              <span className="flex items-center gap-2 text-ink-800">
                <IconaLocali className="h-5 w-5 text-ink-400" />
                {listing.rooms} {listing.rooms === 1 ? d.annuncio.locale : d.annuncio.localiPl}
              </span>
            ) : null}
            {listing.bathrooms ? (
              <span className="flex items-center gap-2 text-ink-800">
                <IconaBagni className="h-5 w-5 text-ink-400" />
                {listing.bathrooms} {listing.bathrooms === 1 ? d.annuncio.bagno : d.annuncio.bagniPl}
              </span>
            ) : null}
            {listing.floor != null ? (
              <span className="flex items-center gap-2 text-ink-800">
                <IconaPiano className="h-5 w-5 text-ink-400" />
                {formatFloor(listing.floor, listing.totalFloors, d.annuncio, lingua)}
              </span>
            ) : null}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-ink-100 pt-6 sm:grid-cols-3">
            {dettagli
              .filter(([, valore]) => valore)
              .map(([etichetta, valore]) => (
                <div key={etichetta}>
                  <dt className="text-sm text-ink-500">{etichetta}</dt>
                  <dd className="font-medium text-ink-900">{valore}</dd>
                </div>
              ))}
          </dl>

          <section className="mt-10 border-t border-ink-100 pt-6">
            <h2 className="text-lg font-semibold text-ink-900">{d.annuncio.descrizione}</h2>
            {testo.tradotto ? (
              <p className="mt-2 text-sm text-ink-500">{d.annuncio.tradottoAutomaticamente}</p>
            ) : null}
            <div className="mt-3 whitespace-pre-line text-ink-700">{testo.description}</div>
          </section>

          {amenities.length || listing.features.length ? (
            <section className="mt-10 border-t border-ink-100 pt-6">
              <h2 className="text-lg font-semibold text-ink-900">{d.annuncio.dotazioni}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <li key={a.key}>
                    <Badge>{d.et.dotazione[a.key]}</Badge>
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
              <h2 className="text-lg font-semibold text-ink-900">{d.annuncio.dove}</h2>
              <p className="mt-1 text-sm text-ink-500">
                {listing.hideAddress ? d.annuncio.doveNascosto : listing.addressLine}
              </p>
              <ListingMap
                className="mt-4 h-80 w-full overflow-hidden rounded-2xl"
                zoom={14}
                center={[listing.latitude, listing.longitude]}
                points={[
                  {
                    id: listing.id,
                    slug: listing.slug,
                    title: testo.title,
                    price,
                    latitude: listing.latitude,
                    longitude: listing.longitude,
                  },
                ]}
              />
            </section>
          ) : null}

          <p className="mt-8 text-sm text-ink-400">
            {d.annuncio.riferimento} {listing.reference ?? listing.id.slice(-8)} ·{' '}
            {d.annuncio.pubblicatoIl} {formatDate(listing.publishedAt ?? listing.createdAt, lingua)} ·{' '}
            {listing.views} {d.annuncio.visualizzazioni}
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {listing.agency ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <p className="text-sm text-ink-500">{d.annuncio.annuncioDi}</p>
              <Link
                href={percorso(lingua, `/agenzie/${listing.agency.slug}`)}
                className="mt-1 block font-semibold text-ink-900 hover:underline"
              >
                {listing.agency.name}
              </Link>
              {listing.agency.phone ? (
                <a href={`tel:${listing.agency.phone}`} className="mt-3 block text-sm text-brand-700">
                  {listing.agency.phone}
                </a>
              ) : null}
            </div>
          ) : null}

          <ContactForm
            listingId={listing.id}
            agencyName={listing.agency?.name ?? listing.owner.name}
          />
        </aside>
      </div>

      {similar.length ? (
        <section className="mt-16 border-t border-ink-100 pt-10">
          <h2 className="text-xl font-semibold text-ink-900">{d.annuncio.simili}</h2>
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

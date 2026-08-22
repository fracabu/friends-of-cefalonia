'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { formatMonthlyPrice, formatPrice, formatRelative, formatSurface } from '@/lib/format'
import type { ListingCard as ListingCardData } from '@/lib/listings'
import { useI18n, useHref } from '@/i18n/client'
import { testoAnnuncio } from '@/lib/listings-testo'

export function ListingCard({
  listing,
  isFavorite = false,
  priority = false,
}: {
  listing: ListingCardData
  isFavorite?: boolean
  priority?: boolean
}) {
  const { lingua, d } = useI18n()
  const href = useHref()
  const cover = listing.images[0]
  const { title } = testoAnnuncio(listing, lingua)
  const price =
    listing.contract === 'RENT'
      ? formatMonthlyPrice(listing.price, listing.priceOnRequest, lingua, d.annuncio.trattativaRiservata, d.annuncio.alMese)
      : formatPrice(listing.price, listing.priceOnRequest, lingua, d.annuncio.trattativaRiservata)

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-ink-100">
        {cover ? (
          <Image
            src={cover.thumbUrl ?? cover.url}
            alt={cover.alt ?? title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">
            {d.annuncio.nessunaFoto}
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.featured ? (
            <Badge tone="brand" className="bg-white/95 backdrop-blur">
              {d.annuncio.inEvidenza}
            </Badge>
          ) : null}
          {listing.isNewBuild ? (
            <Badge tone="success" className="bg-white/95 backdrop-blur">
              {d.annuncio.nuovaCostruzione}
            </Badge>
          ) : null}
          {listing.isAuction ? (
            <Badge tone="warning" className="bg-white/95 backdrop-blur">
              {d.annuncio.asta}
            </Badge>
          ) : null}
          {listing.virtualTourUrl ? (
            <Badge className="bg-white/95 backdrop-blur">{d.annuncio.tourVirtuale}</Badge>
          ) : null}
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton listingId={listing.id} initial={isFavorite} />
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-semibold text-ink-900">{price}</p>

        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-ink-800">
          <Link href={href(`/annuncio/${listing.slug}`)} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-ink-500">
          {listing.zone ? `${listing.zone}, ` : ''}
          {listing.city} ({listing.province})
        </p>

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
          <div>
            <dt className="sr-only">{d.annuncio.tipologia}</dt>
            <dd>{d.et.tipo[listing.type]}</dd>
          </div>
          {listing.type === 'LAND' ? null : (
            <div>
              <dt className="sr-only">{d.annuncio.locali}</dt>
              <dd>
                {listing.rooms} {listing.rooms === 1 ? d.annuncio.locale : d.annuncio.localiPl}
              </dd>
            </div>
          )}
          <div>
            <dt className="sr-only">{d.annuncio.superficie}</dt>
            <dd>{formatSurface(listing.surface, lingua)}</dd>
          </div>
          {listing.bathrooms ? (
            <div>
              <dt className="sr-only">{d.annuncio.bagni}</dt>
              <dd>
                {listing.bathrooms} {listing.bathrooms === 1 ? d.annuncio.bagno : d.annuncio.bagniPl}
              </dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-3 flex items-center justify-between text-xs text-ink-400">
          <span>{listing.agency?.name ?? d.annuncio.privato}</span>
          {listing.publishedAt ? <span>{formatRelative(listing.publishedAt, lingua)}</span> : null}
        </p>
      </div>
    </article>
  )
}

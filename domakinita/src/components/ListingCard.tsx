import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { formatMonthlyPrice, formatPrice, formatRelative, formatSurface } from '@/lib/format'
import { PROPERTY_TYPE_LABELS } from '@/lib/labels'
import type { ListingCard as ListingCardData } from '@/lib/listings'

export function ListingCard({
  listing,
  isFavorite = false,
  priority = false,
}: {
  listing: ListingCardData
  isFavorite?: boolean
  priority?: boolean
}) {
  const cover = listing.images[0]
  const price =
    listing.contract === 'RENT'
      ? formatMonthlyPrice(listing.price, listing.priceOnRequest)
      : formatPrice(listing.price, listing.priceOnRequest)

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-ink-100">
        {cover ? (
          <Image
            src={cover.thumbUrl ?? cover.url}
            alt={cover.alt ?? listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">
            Nessuna fotografia
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.featured ? (
            <Badge tone="brand" className="bg-white/95 backdrop-blur">
              In evidenza
            </Badge>
          ) : null}
          {listing.isNewBuild ? (
            <Badge tone="success" className="bg-white/95 backdrop-blur">
              Nuova costruzione
            </Badge>
          ) : null}
          {listing.isAuction ? (
            <Badge tone="warning" className="bg-white/95 backdrop-blur">
              Asta
            </Badge>
          ) : null}
          {listing.virtualTourUrl ? (
            <Badge className="bg-white/95 backdrop-blur">Tour virtuale</Badge>
          ) : null}
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton listingId={listing.id} initial={isFavorite} />
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-semibold text-ink-900">{price}</p>

        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-ink-800">
          <Link href={`/annuncio/${listing.slug}`} className="after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-ink-500">
          {listing.zone ? `${listing.zone}, ` : ''}
          {listing.city} ({listing.province})
        </p>

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
          <div>
            <dt className="sr-only">Tipologia</dt>
            <dd>{PROPERTY_TYPE_LABELS[listing.type]}</dd>
          </div>
          {listing.type === 'LAND' ? null : (
            <div>
              <dt className="sr-only">Locali</dt>
              <dd>
                {listing.rooms} {listing.rooms === 1 ? 'locale' : 'locali'}
              </dd>
            </div>
          )}
          <div>
            <dt className="sr-only">Superficie</dt>
            <dd>{formatSurface(listing.surface)}</dd>
          </div>
          {listing.bathrooms ? (
            <div>
              <dt className="sr-only">Bagni</dt>
              <dd>
                {listing.bathrooms} {listing.bathrooms === 1 ? 'bagno' : 'bagni'}
              </dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-3 flex items-center justify-between text-xs text-ink-400">
          <span>{listing.agency?.name ?? 'Privato'}</span>
          {listing.publishedAt ? <span>{formatRelative(listing.publishedAt)}</span> : null}
        </p>
      </div>
    </article>
  )
}

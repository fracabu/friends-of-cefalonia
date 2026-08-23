'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FavoriteButton } from '@/components/FavoriteButton'
import { IconaBagni, IconaLocali, IconaPiano, IconaSuperficie } from '@/components/ui/Icons'
import { formatMonthlyPrice, formatPrice, formatRelative, formatSurface } from '@/lib/format'
import type { ListingCard as ListingCardData } from '@/lib/listings'
import { testoAnnuncio } from '@/lib/listings-testo'
import { useI18n, useHref } from '@/i18n/client'

/**
 * La scheda dei portali: fotografia grande, prezzo in evidenza sotto, e una
 * riga di caratteristiche con le icone. Chi scorre cento annunci non legge i
 * titoli — guarda foto, prezzo e metri quadri, in quest'ordine.
 */
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
      ? formatMonthlyPrice(
          listing.price,
          listing.priceOnRequest,
          lingua,
          d.annuncio.trattativaRiservata,
          d.annuncio.alMese,
        )
      : formatPrice(listing.price, listing.priceOnRequest, lingua, d.annuncio.trattativaRiservata)

  const distintivi = [
    listing.featured && { testo: d.annuncio.inEvidenza, classe: 'bg-brand-700 text-white' },
    listing.isNewBuild && { testo: d.annuncio.nuovaCostruzione, classe: 'bg-emerald-600 text-white' },
    listing.isAuction && { testo: d.annuncio.asta, classe: 'bg-amber-600 text-white' },
    listing.virtualTourUrl && { testo: d.annuncio.tourVirtuale, classe: 'bg-ink-900/85 text-white' },
  ].filter(Boolean) as Array<{ testo: string; classe: string }>

  return (
    <article className="group relative overflow-hidden rounded-xl border border-ink-100 bg-surface transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/11] bg-ink-100">
        {cover ? (
          <Image
            src={cover.thumbUrl ?? cover.url}
            alt={cover.alt ?? title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">
            {d.annuncio.nessunaFoto}
          </div>
        )}

        <div className="absolute left-2.5 right-14 top-2.5 flex flex-wrap gap-1">
          {distintivi.slice(0, 2).map((distintivo) => (
            <span
              key={distintivo.testo}
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${distintivo.classe}`}
            >
              {distintivo.testo}
            </span>
          ))}
        </div>

        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton listingId={listing.id} initial={isFavorite} />
        </div>

        {listing.images.length > 1 ? (
          <span className="absolute bottom-2.5 right-2.5 rounded bg-ink-900/70 px-2 py-0.5 text-[11px] font-medium text-white">
            {listing.images.length}
          </span>
        ) : null}
      </div>

      <div className="p-3.5">
        <p className="text-xl font-bold tracking-tight text-ink-900">{price}</p>

        <h3 className="mt-1 line-clamp-1 text-[15px] font-semibold text-ink-800">
          <Link href={href(`/annuncio/${listing.slug}`)} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">
          {listing.zone ? `${listing.zone}, ` : ''}
          {listing.city}
        </p>

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-100 pt-3 text-sm text-ink-700">
          {listing.type !== 'LAND' ? (
            <div className="flex items-center gap-1.5">
              <IconaLocali className="h-4 w-4 text-ink-400" />
              <dt className="sr-only">{d.annuncio.locali}</dt>
              <dd>{listing.rooms}</dd>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5">
            <IconaSuperficie className="h-4 w-4 text-ink-400" />
            <dt className="sr-only">{d.annuncio.superficie}</dt>
            <dd>{formatSurface(listing.surface, lingua)}</dd>
          </div>

          {listing.bathrooms ? (
            <div className="flex items-center gap-1.5">
              <IconaBagni className="h-4 w-4 text-ink-400" />
              <dt className="sr-only">{d.annuncio.bagni}</dt>
              <dd>{listing.bathrooms}</dd>
            </div>
          ) : null}

          {listing.floor != null && listing.type !== 'LAND' ? (
            <div className="flex items-center gap-1.5">
              <IconaPiano className="h-4 w-4 text-ink-400" />
              <dt className="sr-only">{d.annuncio.piano}</dt>
              <dd>{listing.floor === 0 ? d.annuncio.pianoTerra : `${listing.floor}°`}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-3 flex items-center justify-between gap-2 text-xs text-ink-400">
          <span className="truncate">{listing.agency?.name ?? d.annuncio.privato}</span>
          {listing.publishedAt ? (
            <span className="shrink-0" suppressHydrationWarning>
              {formatRelative(listing.publishedAt, lingua)}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  )
}

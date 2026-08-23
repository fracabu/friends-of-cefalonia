'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/client'

type Photo = { url: string; alt: string | null; width: number | null; height: number | null }

/** Galleria della scheda: griglia, poi visore a schermo intero con frecce. */
export function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const { d } = useI18n()
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    if (index === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIndex(null)
      if (e.key === 'ArrowRight') setIndex((i) => (i === null ? null : (i + 1) % photos.length))
      if (e.key === 'ArrowLeft') setIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, photos.length])

  if (!photos.length) {
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-2xl bg-ink-100 text-sm text-ink-400">
        {d.annuncio.nessunaFotoLunga}
      </div>
    )
  }

  const [first, ...rest] = photos

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setIndex(0)}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:col-span-2 sm:row-span-2 sm:aspect-auto"
        >
          <Image src={first.url} alt={first.alt ?? title} fill priority sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
        </button>

        {rest.slice(0, 4).map((photo, i) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setIndex(i + 1)}
            className="relative hidden aspect-[4/3] overflow-hidden rounded-xl sm:block"
          >
            <Image src={photo.url} alt={photo.alt ?? title} fill sizes="25vw" className="object-cover" />
            {i === 3 && photos.length > 5 ? (
              <span className="absolute inset-0 grid place-items-center bg-ink-900/60 text-sm font-medium text-white">
                +{photos.length - 5} {d.annuncio.altreFoto}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {index !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${d.annuncio.fotografieDi} ${title}`}
          className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 p-4"
          onClick={() => setIndex(null)}
        >
          <div className="flex justify-between text-sm text-white">
            <span>
              {index + 1} {d.annuncio.di} {photos.length}
            </span>
            <button type="button" onClick={() => setIndex(null)} className="rounded px-2 py-1 hover:bg-white/10">
              {d.annuncio.chiudi}
            </button>
          </div>

          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[index].url}
              alt={photos[index].alt ?? title}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <button
              type="button"
              aria-label={d.annuncio.fotoPrecedente}
              onClick={() => setIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 px-3 py-2 text-lg"
            >
              &#8249;
            </button>
            <button
              type="button"
              aria-label={d.annuncio.fotoSuccessiva}
              onClick={() => setIndex((i) => (i === null ? null : (i + 1) % photos.length))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 px-3 py-2 text-lg"
            >
              &#8250;
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

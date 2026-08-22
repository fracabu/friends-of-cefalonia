'use client'

import dynamic from 'next/dynamic'

/**
 * Leaflet tocca `window` all'import: va caricato solo nel browser.
 * Il wrapper esiste per questo, la mappa vera sta in MapCanvas.
 */
const MapCanvas = dynamic(() => import('./MapCanvas').then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-ink-100" />,
})

export type MapPoint = {
  id: string
  slug: string
  title: string
  price: string
  latitude: number
  longitude: number
}

export function ListingMap({
  points,
  center,
  zoom = 12,
  className = 'h-[520px] w-full overflow-hidden rounded-2xl',
}: {
  points: MapPoint[]
  center?: [number, number]
  zoom?: number
  className?: string
}) {
  return (
    <div className={className}>
      <MapCanvas points={points} center={center} zoom={zoom} />
    </div>
  )
}

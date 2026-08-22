'use client'

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import type { MapPoint } from './ListingMap'

// Le icone di default di Leaflet puntano a file che il bundler non copia:
// meglio un segnaposto disegnato a mano, che resta coerente col resto.
const icon = L.divIcon({
  className: '',
  html: `<span style="display:grid;place-items:center;width:28px;height:28px;border-radius:999px;background:#1d63f0;color:#fff;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(15,20,33,.35)">&#8962;</span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const CENTRO_ITALIA: [number, number] = [41.9028, 12.4964]

export function MapCanvas({
  points,
  center,
  zoom,
}: {
  points: MapPoint[]
  center?: [number, number]
  zoom: number
}) {
  const start = center ?? (points[0] ? [points[0].latitude, points[0].longitude] : CENTRO_ITALIA)

  return (
    <MapContainer center={start as [number, number]} zoom={zoom} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.latitude, p.longitude]} icon={icon}>
          <Popup>
            <Link href={`/annuncio/${p.slug}`} className="block max-w-52 text-sm font-medium text-brand-700">
              {p.title}
            </Link>
            <p className="mt-1 text-sm text-ink-600">{p.price}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

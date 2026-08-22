'use client'

import { useEffect, useRef } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import { simplifyPolygon, type Area, type Bounds, type LatLng } from '@/lib/geo'
import type { MapPoint } from './ListingMap'

const CENTRO_ITALIA: LatLng = [41.9028, 12.4964]

const AREA_STYLE = { color: '#1d63f0', weight: 2, fillColor: '#1d63f0', fillOpacity: 0.08 }

/** Segnaposto col prezzo: si legge la mappa senza aprire ogni annuncio. */
function priceIcon(label: string) {
  return L.divIcon({
    className: '',
    html: `<span style="display:inline-block;transform:translate(-50%,-50%);white-space:nowrap;padding:3px 8px;border-radius:999px;background:#1d63f0;color:#fff;font:600 12px/1.4 system-ui,sans-serif;box-shadow:0 2px 8px rgba(15,20,33,.35)">${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

/**
 * Disegno dell'area a mano libera.
 *
 * Si ascoltano i pointer event sul contenitore, non i click di Leaflet: così
 * funzionano allo stesso modo il mouse e il dito, e il tracciato segue la mano
 * invece di richiedere un vertice per volta. Mentre si disegna il
 * trascinamento della mappa è disattivato, altrimenti si sposterebbe la vista.
 */
function DrawLayer({ active, onDone }: { active: boolean; onDone: (points: LatLng[]) => void }) {
  const map = useMap()
  const doneRef = useRef(onDone)

  // La funzione di ritorno cambia a ogni render; il disegno però si allestisce
  // una volta sola, quindi la legge da qui invece di ricrearsi ogni volta.
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!active) return

    const container = map.getContainer()
    const previousCursor = container.style.cursor
    const previousTouch = container.style.touchAction

    map.dragging.disable()
    map.doubleClickZoom.disable()
    container.style.cursor = 'crosshair'
    container.style.touchAction = 'none'

    let drawing = false
    let points: LatLng[] = []
    let trace: L.Polyline | null = null

    const toLatLng = (event: PointerEvent): LatLng => {
      const rect = container.getBoundingClientRect()
      const latlng = map.containerPointToLatLng(
        L.point(event.clientX - rect.left, event.clientY - rect.top),
      )
      return [latlng.lat, latlng.lng]
    }

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return
      drawing = true
      points = [toLatLng(event)]
      trace = L.polyline([points[0]], { color: '#1d63f0', weight: 3 }).addTo(map)
      container.setPointerCapture(event.pointerId)
      event.preventDefault()
    }

    const onMove = (event: PointerEvent) => {
      if (!drawing || !trace) return
      const point = toLatLng(event)
      points.push(point)
      trace.addLatLng(point)
      event.preventDefault()
    }

    const onUp = (event: PointerEvent) => {
      if (!drawing) return
      drawing = false
      container.releasePointerCapture?.(event.pointerId)
      trace?.remove()
      trace = null

      // Meno di tre punti non è un'area: probabilmente è stato un click.
      if (points.length >= 3) doneRef.current(simplifyPolygon(points))
      points = []
    }

    container.addEventListener('pointerdown', onDown)
    container.addEventListener('pointermove', onMove)
    container.addEventListener('pointerup', onUp)
    container.addEventListener('pointercancel', onUp)

    return () => {
      container.removeEventListener('pointerdown', onDown)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup', onUp)
      container.removeEventListener('pointercancel', onUp)
      trace?.remove()
      map.dragging.enable()
      map.doubleClickZoom.enable()
      container.style.cursor = previousCursor
      container.style.touchAction = previousTouch
    }
  }, [active, map])

  return null
}

/** Riporta il riquadro visibile: serve al «cerca mentre sposto la mappa». */
function BoundsWatcher({ onChange }: { onChange: (bounds: Bounds) => void }) {
  const map = useMapEvents({
    moveend: () => report(),
    zoomend: () => report(),
  })

  function report() {
    const b = map.getBounds()
    onChange({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast(),
    })
  }

  return null
}

/** Inquadra l'area disegnata quando si arriva sulla pagina con un URL condiviso. */
function FitArea({ area }: { area: Area | null }) {
  const map = useMap()
  const done = useRef(false)

  useEffect(() => {
    if (!area || done.current) return
    done.current = true

    if (area.kind === 'polygon') {
      map.fitBounds(L.latLngBounds(area.points.map(([lat, lng]) => L.latLng(lat, lng))), {
        padding: [24, 24],
      })
    } else if (area.kind === 'circle') {
      map.fitBounds(
        L.latLng(area.center[0], area.center[1]).toBounds(area.radiusKm * 2000),
      )
    }
  }, [area, map])

  return null
}

export function MapCanvas({
  points,
  center,
  zoom,
  area = null,
  drawing = false,
  onAreaDrawn,
  onBoundsChange,
}: {
  points: MapPoint[]
  center?: LatLng
  zoom: number
  area?: Area | null
  drawing?: boolean
  onAreaDrawn?: (points: LatLng[]) => void
  onBoundsChange?: (bounds: Bounds) => void
}) {
  const start = center ?? (points[0] ? ([points[0].latitude, points[0].longitude] as LatLng) : CENTRO_ITALIA)

  return (
    <MapContainer center={start} zoom={zoom} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {area?.kind === 'polygon' ? <Polygon positions={area.points} pathOptions={AREA_STYLE} /> : null}
      {area?.kind === 'circle' ? (
        <Circle center={area.center} radius={area.radiusKm * 1000} pathOptions={AREA_STYLE} />
      ) : null}
      {area?.kind === 'bounds' ? (
        <Rectangle
          bounds={[
            [area.bounds.south, area.bounds.west],
            [area.bounds.north, area.bounds.east],
          ]}
          pathOptions={AREA_STYLE}
        />
      ) : null}

      {points.map((p) => (
        <Marker key={p.id} position={[p.latitude, p.longitude]} icon={priceIcon(p.price)}>
          <Popup>
            <Link href={`/annuncio/${p.slug}`} className="block max-w-52 text-sm font-medium text-brand-700">
              {p.title}
            </Link>
            <p className="mt-1 text-sm text-ink-600">{p.price}</p>
          </Popup>
        </Marker>
      ))}

      {onAreaDrawn ? <DrawLayer active={drawing} onDone={onAreaDrawn} /> : null}
      {onBoundsChange ? <BoundsWatcher onChange={onBoundsChange} /> : null}
      <FitArea area={area} />
    </MapContainer>
  )
}

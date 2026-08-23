'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListingMap } from '@/components/ListingMap'
import { Button } from '@/components/ui/Button'
import { encodePolyline, type Area, type Bounds, type LatLng } from '@/lib/geo'
import type { MapPoint } from '@/components/ListingMap'
import { useI18n } from '@/i18n/client'

const RADII = [1, 3, 5, 10, 20]

/**
 * La mappa della pagina di ricerca, con i tre modi di cercare per posizione:
 * l'area disegnata a mano, il raggio attorno al centro della vista e il
 * riquadro visibile che si aggiorna mentre si sposta la mappa.
 *
 * Il risultato finisce sempre nell'URL, come ogni altro filtro: l'area
 * disegnata si può condividere, salvare fra le ricerche e ricaricare.
 */
export function SearchMap({
  points,
  area,
  className,
}: {
  points: MapPoint[]
  area: Area | null
  className?: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const { lingua, d } = useI18n()
  const [drawing, setDrawing] = useState(false)
  const [followMap, setFollowMap] = useState(params.get('bbox') != null)
  const [radius, setRadius] = useState(Number(params.get('raggio')) || 5)
  const bounds = useRef<Bounds | null>(null)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Le tre forme si escludono: impostarne una toglie le altre. */
  const applyGeo = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const key of ['area', 'centro', 'raggio', 'bbox']) next.delete(key)
      for (const [key, value] of Object.entries(changes)) {
        if (value !== null) next.set(key, value)
      }
      next.delete('pagina')
      router.push(`/${lingua}/cerca?${next.toString()}`, { scroll: false })
    },
    [lingua, params, router],
  )

  const onAreaDrawn = useCallback(
    (drawn: LatLng[]) => {
      setDrawing(false)
      setFollowMap(false)
      applyGeo({ area: encodePolyline(drawn) })
    },
    [applyGeo],
  )

  const onBoundsChange = useCallback(
    (next: Bounds) => {
      bounds.current = next
      if (!followMap) return

      // Si aspetta che la mappa si fermi: altrimenti parte una ricerca per
      // ogni fotogramma del trascinamento.
      if (pending.current) clearTimeout(pending.current)
      pending.current = setTimeout(() => {
        const { south, west, north, east } = next
        applyGeo({ bbox: [south, west, north, east].map((n) => n.toFixed(5)).join(',') })
      }, 600)
    },
    [applyGeo, followMap],
  )

  function searchRadius() {
    const b = bounds.current
    if (!b) return
    const center: LatLng = [(b.south + b.north) / 2, (b.west + b.east) / 2]
    setFollowMap(false)
    applyGeo({ centro: center.map((n) => n.toFixed(5)).join(','), raggio: String(radius) })
  }

  function clearArea() {
    setDrawing(false)
    setFollowMap(false)
    applyGeo({})
  }

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={drawing ? 'primary' : 'secondary'}
          onClick={() => setDrawing((v) => !v)}
        >
          {drawing ? d.mappa.disegnando : area?.kind === 'polygon' ? d.mappa.ridisegna : d.mappa.disegna}
        </Button>

        <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-surface px-2 py-1">
          <label htmlFor="raggio" className="text-xs text-ink-500">
            {d.mappa.raggio}
          </label>
          <select
            id="raggio"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-transparent text-sm focus:outline-none"
          >
            {RADII.map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
          <Button size="sm" variant="ghost" onClick={searchRadius}>
            {d.mappa.applica}
          </Button>
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3 py-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={followMap}
            onChange={(e) => {
              const on = e.target.checked
              setFollowMap(on)
              if (on && bounds.current) {
                const { south, west, north, east } = bounds.current
                applyGeo({ bbox: [south, west, north, east].map((n) => n.toFixed(5)).join(',') })
              } else if (!on) {
                applyGeo({})
              }
            }}
            className="h-4 w-4 rounded border-ink-300 text-brand-600"
          />
          {d.mappa.segui}
        </label>

        {area ? (
          <Button size="sm" variant="ghost" onClick={clearArea}>
            {d.mappa.togliArea}
          </Button>
        ) : null}
      </div>

      {drawing ? (
        <p className="mb-2 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800">
          {d.mappa.istruzioni}
        </p>
      ) : null}

      <ListingMap
        points={points}
        area={area}
        drawing={drawing}
        onAreaDrawn={onAreaDrawn}
        onBoundsChange={onBoundsChange}
        className="h-[calc(100vh-13rem)] min-h-[420px] w-full overflow-hidden rounded-xl border border-ink-100"
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { FilterBar } from '@/components/FilterBar'
import { FilterPanel } from '@/components/FilterPanel'

/**
 * La barra dei filtri e il pannello esteso condividono un solo interruttore:
 * «Altri filtri» apre sotto la barra tutto quello che non sta nelle pillole.
 */
export function SearchControls({ total }: { total: number }) {
  const [aperti, setAperti] = useState(false)

  return (
    <div className="sticky top-16 z-30 bg-white shadow-sm">
      <FilterBar total={total} tuttiAperti={aperti} onApriTutti={() => setAperti((v) => !v)} />

      {aperti ? (
        <div className="border-b border-ink-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <FilterPanel total={total} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

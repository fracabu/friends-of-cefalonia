'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Su schermo largo elenco e mappa stanno affiancati; sul telefono si alternano,
 * perché una mappa alta metà schermo sopra i risultati non la usa nessuno.
 */
export function SearchLayout({ results, map }: { results: React.ReactNode; map: React.ReactNode }) {
  const [view, setView] = useState<'lista' | 'mappa'>('lista')

  return (
    <>
      <div className="mb-4 inline-flex rounded-xl bg-ink-100 p-1 lg:hidden">
        {(['lista', 'mappa'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            aria-pressed={view === value}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium capitalize',
              view === value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600',
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_460px]">
        <div className={cn(view === 'mappa' && 'hidden lg:block')}>{results}</div>
        <aside className={cn(view === 'lista' && 'hidden lg:block')}>
          <div className="lg:sticky lg:top-24">{map}</div>
        </aside>
      </div>
    </>
  )
}

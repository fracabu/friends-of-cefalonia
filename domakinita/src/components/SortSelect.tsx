'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SORT_LABELS } from '@/lib/search'

export function SortSelect() {
  const router = useRouter()
  const params = useSearchParams()

  return (
    <label className="flex items-center gap-2 text-sm text-ink-600">
      Ordina per
      <select
        value={params.get('ordina') ?? 'recenti'}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString())
          next.set('ordina', e.target.value)
          next.delete('pagina')
          router.push(`/cerca?${next.toString()}`)
        }}
        className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}

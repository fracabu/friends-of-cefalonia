'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/i18n/client'

export function SortSelect() {
  const router = useRouter()
  const params = useSearchParams()
  const { lingua, d } = useI18n()

  return (
    <label className="flex items-center gap-2 text-sm text-ink-600">
      {d.ricerca.ordina}
      <select
        value={params.get('ordina') ?? 'rilevanza'}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString())
          next.set('ordina', e.target.value)
          next.delete('pagina')
          router.push(`/${lingua}/cerca?${next.toString()}`)
        }}
        className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        {Object.entries(d.et.ordina).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}

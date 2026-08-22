'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/client'

/** Paginazione con link veri: i motori di ricerca devono poterla percorrere. */
export function Pagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number
  pageCount: number
  buildHref: (page: number) => string
}) {
  const { d } = useI18n()
  if (pageCount <= 1) return null

  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1])
  const visible = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)

  return (
    <nav aria-label={d.ricerca.paginazione} className="flex flex-wrap items-center justify-center gap-1 py-8">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} rel="prev" className="rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100">
          {d.ricerca.precedente}
        </Link>
      ) : null}

      {visible.map((p, index) => (
        <span key={p} className="flex items-center">
          {index > 0 && p - visible[index - 1] > 1 ? (
            <span className="px-2 text-ink-400">…</span>
          ) : null}
          <Link
            href={buildHref(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3.5 py-2 text-sm',
              p === page ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-ink-100',
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      {page < pageCount ? (
        <Link href={buildHref(page + 1)} rel="next" className="rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100">
          {d.ricerca.successiva}
        </Link>
      ) : null}
    </nav>
  )
}

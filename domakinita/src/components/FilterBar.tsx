'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Field'
import { IconaFreccia, IconaLente } from '@/components/ui/Icons'
import { PROPERTY_TYPE_SLUGS } from '@/lib/labels'
import { useI18n } from '@/i18n/client'
import { cn } from '@/lib/utils'

/**
 * La barra dei filtri dei portali: una riga sola, sempre visibile, con le
 * pillole che si aprono in un riquadro sotto. Il valore scelto resta scritto
 * sulla pillola, così si legge lo stato della ricerca senza aprire niente.
 *
 * Tutto finisce nell'URL, come ogni altro filtro: la barra non tiene stato
 * suo, lo legge da lì e ce lo riscrive.
 */
export function FilterBar({
  total,
  onApriTutti,
  tuttiAperti,
}: {
  total: number
  onApriTutti: () => void
  tuttiAperti: boolean
}) {
  const router = useRouter()
  const params = useSearchParams()
  const { lingua, d } = useI18n()
  const [aperta, setAperta] = useState<string | null>(null)
  const barra = useRef<HTMLDivElement>(null)

  const current = useMemo(() => new URLSearchParams(params.toString()), [params])

  // Il campo è modificabile, ma la verità sta nell'URL: quando quello cambia
  // — un chip tolto, il tasto indietro — il campo si riallinea. Si fa durante
  // il render, non in un effetto, per non innescare un secondo giro.
  const comuneUrl = current.get('comune') ?? ''
  const [comune, setComune] = useState(comuneUrl)
  const [comuneVisto, setComuneVisto] = useState(comuneUrl)
  if (comuneUrl !== comuneVisto) {
    setComuneVisto(comuneUrl)
    setComune(comuneUrl)
  }

  useEffect(() => {
    function fuori(e: MouseEvent) {
      if (barra.current && !barra.current.contains(e.target as Node)) setAperta(null)
    }
    document.addEventListener('mousedown', fuori)
    return () => document.removeEventListener('mousedown', fuori)
  }, [])

  const applica = useCallback(
    (cambi: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [chiave, valore] of Object.entries(cambi)) {
        if (valore === null || valore === '') next.delete(chiave)
        else next.set(chiave, valore)
      }
      next.delete('pagina')
      router.push(`/${lingua}/cerca?${next.toString()}`)
      setAperta(null)
    },
    [lingua, params, router],
  )

  const contratto = current.get('contratto') ?? 'vendita'
  const tipiScelti = (current.get('tipo') ?? '').split(',').filter(Boolean)

  /** L'etichetta della pillola: il valore scelto, o il nome del filtro. */
  const etichetta = (nome: string, valori: Array<string | null>, formato: (v: string[]) => string) => {
    const presenti = valori.filter(Boolean) as string[]
    return presenti.length ? formato(presenti) : nome
  }

  const prezzoAttivo = [current.get('prezzoMin'), current.get('prezzoMax')]
  const superficieAttiva = [current.get('superficieMin'), current.get('superficieMax')]
  const localiAttivi = current.get('localiMin')

  return (
    <div ref={barra} className="relative z-30 border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
        <div className="inline-flex rounded-lg bg-ink-100 p-1">
          {(['vendita', 'affitto'] as const).map((valore) => (
            <button
              key={valore}
              type="button"
              onClick={() => applica({ contratto: valore })}
              aria-pressed={contratto === valore}
              className={cn(
                'rounded-md px-3.5 py-1.5 text-sm font-medium transition',
                contratto === valore ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600',
              )}
            >
              {valore === 'vendita' ? d.nav.vendita : d.nav.affitto}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            applica({ comune: comune.trim() || null })
          }}
          className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-ink-200 px-3 focus-within:border-brand-500"
        >
          <IconaLente className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            value={comune}
            onChange={(e) => setComune(e.target.value)}
            placeholder={d.ricerca.cercaQui}
            aria-label={d.ricerca.localitaEtichetta}
            className="w-full bg-transparent py-2 text-sm focus:outline-none"
          />
        </form>

        <Pillola
          nome={etichetta(d.ricerca.prezzo, prezzoAttivo, (v) =>
            `${d.ricerca.prezzo}: ${v.map((n) => Number(n).toLocaleString(lingua)).join(' – ')} €`,
          )}
          attiva={prezzoAttivo.some(Boolean)}
          aperta={aperta === 'prezzo'}
          onToggle={() => setAperta(aperta === 'prezzo' ? null : 'prezzo')}
        >
          <IntervalloNumerico
            etichette={[d.ricerca.da, d.ricerca.a]}
            valori={[current.get('prezzoMin') ?? '', current.get('prezzoMax') ?? '']}
            passo={5000}
            suffisso="€"
            azione={d.ricerca.applica}
            onApplica={([min, max]) => applica({ prezzoMin: min, prezzoMax: max })}
          />
        </Pillola>

        <Pillola
          nome={etichetta(d.ricerca.superficie, superficieAttiva, (v) =>
            `${d.ricerca.superficie}: ${v.join(' – ')} m²`,
          )}
          attiva={superficieAttiva.some(Boolean)}
          aperta={aperta === 'superficie'}
          onToggle={() => setAperta(aperta === 'superficie' ? null : 'superficie')}
        >
          <IntervalloNumerico
            etichette={[d.ricerca.da, d.ricerca.a]}
            valori={[current.get('superficieMin') ?? '', current.get('superficieMax') ?? '']}
            passo={10}
            suffisso="m²"
            azione={d.ricerca.applica}
            onApplica={([min, max]) => applica({ superficieMin: min, superficieMax: max })}
          />
        </Pillola>

        <Pillola
          nome={localiAttivi ? `${d.ricerca.locali}: ${localiAttivi}+` : d.ricerca.locali}
          attiva={Boolean(localiAttivi)}
          aperta={aperta === 'locali'}
          onToggle={() => setAperta(aperta === 'locali' ? null : 'locali')}
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applica({ localiMin: null })}
              className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm hover:border-brand-400"
            >
              {d.ricerca.qualsiasi}
            </button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => applica({ localiMin: String(n) })}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm',
                  localiAttivi === String(n)
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-ink-200 hover:border-brand-400',
                )}
              >
                {n}+
              </button>
            ))}
          </div>
        </Pillola>

        <Pillola
          nome={
            tipiScelti.length
              ? `${d.ricerca.tipologia}: ${tipiScelti.length}`
              : d.ricerca.tipologia
          }
          attiva={tipiScelti.length > 0}
          aperta={aperta === 'tipo'}
          onToggle={() => setAperta(aperta === 'tipo' ? null : 'tipo')}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const scelti = new FormData(e.currentTarget).getAll('tipo').map(String)
              applica({ tipo: scelti.length ? scelti.join(',') : null })
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PROPERTY_TYPE_SLUGS).map(([chiave, slug]) => (
                <Checkbox
                  key={slug}
                  name="tipo"
                  value={slug}
                  defaultChecked={tipiScelti.includes(slug)}
                  label={d.et.tipo[chiave as keyof typeof d.et.tipo]}
                />
              ))}
            </div>
            <Button type="submit" size="sm" className="mt-3 w-full">
              {d.ricerca.applica}
            </Button>
          </form>
        </Pillola>

        <button
          type="button"
          onClick={onApriTutti}
          aria-expanded={tuttiAperti}
          className={cn(
            'rounded-lg border px-3.5 py-2 text-sm font-medium transition',
            tuttiAperti
              ? 'border-brand-500 bg-brand-50 text-brand-800'
              : 'border-ink-200 text-ink-700 hover:border-brand-400',
          )}
        >
          {d.ricerca.altriFiltri}
        </button>

        <p className="ml-auto hidden text-sm text-ink-500 lg:block">
          <strong className="text-ink-900">{total.toLocaleString(lingua)}</strong>{' '}
          {d.ricerca.risultati}
        </p>
      </div>
    </div>
  )
}

function Pillola({
  nome,
  attiva,
  aperta,
  onToggle,
  children,
}: {
  nome: string
  attiva: boolean
  aperta: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={aperta}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition',
          attiva || aperta
            ? 'border-brand-500 bg-brand-50 text-brand-800'
            : 'border-ink-200 text-ink-700 hover:border-brand-400',
        )}
      >
        {nome}
        <IconaFreccia className={cn('h-3.5 w-3.5 transition-transform', aperta && 'rotate-180')} />
      </button>

      {aperta ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-72 rounded-xl border border-ink-100 bg-white p-4 shadow-xl">
          {children}
        </div>
      ) : null}
    </div>
  )
}

function IntervalloNumerico({
  etichette,
  valori,
  passo,
  suffisso,
  azione,
  onApplica,
}: {
  etichette: [string, string]
  valori: [string, string]
  passo: number
  suffisso: string
  azione: string
  onApplica: (valori: [string | null, string | null]) => void
}) {
  const [min, setMin] = useState(valori[0])
  const [max, setMax] = useState(valori[1])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            [etichette[0], min, setMin],
            [etichette[1], max, setMax],
          ] as const
        ).map(([etichetta, valore, imposta]) => (
          <label key={etichetta} className="block">
            <span className="mb-1 block text-xs text-ink-500">
              {etichetta} ({suffisso})
            </span>
            <input
              type="number"
              min={0}
              step={passo}
              inputMode="numeric"
              value={valore}
              onChange={(e) => imposta(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>
        ))}
      </div>
      <Button size="sm" className="w-full" onClick={() => onApplica([min || null, max || null])}>
        {azione}
      </Button>
    </div>
  )
}

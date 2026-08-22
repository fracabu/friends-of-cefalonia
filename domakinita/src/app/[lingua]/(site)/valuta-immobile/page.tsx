import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/Button'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lingua: string }>
}): Promise<Metadata> {
  const d = getDizionario(linguaSicura((await params).lingua))
  return { title: d.nav.valuta, description: d.valuta.sottotitolo }
}

export default async function ValutaPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)

  const passi = [
    { titolo: d.valuta.passo1, testo: d.valuta.passo1Testo },
    { titolo: d.valuta.passo2, testo: d.valuta.passo2Testo },
    { titolo: d.valuta.passo3, testo: d.valuta.passo3Testo },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-ink-900">{d.valuta.titolo}</h1>
      <p className="mt-3 max-w-2xl text-ink-600">{d.valuta.sottotitolo}</p>

      <ol className="mt-10 space-y-4">
        {passi.map((passo, indice) => (
          <li key={passo.titolo} className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {indice + 1}
            </span>
            <div>
              <h2 className="font-medium text-ink-900">{passo.titolo}</h2>
              <p className="mt-1 text-sm text-ink-600">{passo.testo}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl bg-ink-900 p-8 text-white">
        <h2 className="text-xl font-semibold">{d.valuta.prontoTitolo}</h2>
        <p className="mt-2 max-w-xl text-ink-200">{d.valuta.prontoTesto}</p>
        <div className="mt-5">
          <ButtonLink href={percorso(lingua, '/registrati?ruolo=agente')}>
            {d.valuta.iniziaOra}
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

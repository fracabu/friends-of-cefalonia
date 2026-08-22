import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Valuta il tuo immobile',
  description: 'Scopri quanto vale la tua casa e mettila sul mercato con un annuncio curato.',
}

const STEPS = [
  {
    title: 'Descrivi l’immobile',
    body: 'Comune, zona, superficie, piano e stato di conservazione: sono i dati che pesano di più sul valore.',
  },
  {
    title: 'Confronto con il mercato',
    body: 'La stima parte dagli immobili simili venduti in zona e dai prezzi degli annunci attivi sul portale.',
  },
  {
    title: 'Pubblica quando vuoi',
    body: 'Se il valore ti convince, l’annuncio è già pronto: bastano le fotografie.',
  },
]

export default function ValutaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-ink-900">Quanto vale il tuo immobile?</h1>
      <p className="mt-3 max-w-2xl text-ink-600">
        Una stima indicativa in tre passaggi, gratuita e senza impegno. Per una perizia con valore
        legale serve comunque un tecnico abilitato.
      </p>

      <ol className="mt-10 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {index + 1}
            </span>
            <div>
              <h2 className="font-medium text-ink-900">{step.title}</h2>
              <p className="mt-1 text-sm text-ink-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl bg-ink-900 p-8 text-white">
        <h2 className="text-xl font-semibold">Pronto a partire?</h2>
        <p className="mt-2 max-w-xl text-ink-200">
          Crea un account e inserisci l’immobile: la scheda resta in bozza finché non decidi di
          pubblicarla.
        </p>
        <div className="mt-5">
          <ButtonLink href="/registrati?ruolo=agente">Inizia adesso</ButtonLink>
        </div>
      </div>
    </div>
  )
}

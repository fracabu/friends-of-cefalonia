import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contatti' }

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-ink-900">Contatti</h1>
      <div className="prose mt-6 space-y-4 text-ink-700">
        <p>
          Per informazioni sul portale, segnalazioni su un annuncio o richieste commerciali scrivi a
          <a className="text-brand-700 underline" href="mailto:info@example.it"> info@example.it</a>.
        </p>
        <p>
          Le richieste su un immobile specifico vanno inviate dalla scheda dell&apos;annuncio: arrivano
          direttamente all&apos;agenzia che lo gestisce.
        </p>
      </div>
    </div>
  )
}

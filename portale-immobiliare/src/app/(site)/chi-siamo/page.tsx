import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Chi siamo' }

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-ink-900">Chi siamo</h1>
      <div className="prose mt-6 space-y-4 text-ink-700">
        <p>
          Questo portale nasce come progetto dimostrativo: un annuncio immobiliare completo, dalla
          ricerca per zona alla richiesta di visita, con un pannello per chi gli annunci li pubblica.
        </p>
        <p>
          Il codice è aperto e pensato per essere adattato: cambiare il modello dati, il tema o le
          regole di pubblicazione richiede di toccare pochi file, tutti documentati nel README.
        </p>
      </div>
    </div>
  )
}

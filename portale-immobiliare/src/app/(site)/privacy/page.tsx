import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy policy' }

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-ink-900">Privacy policy</h1>
      <div className="prose mt-6 space-y-4 text-ink-700">
        <p>
          <strong>Testo di esempio, da sostituire prima della messa online.</strong> Un portale che
          raccoglie richieste di contatto tratta dati personali e ha bisogno di un&apos;informativa
          redatta sul trattamento reale.
        </p>
        <p>
          I dati raccolti dai moduli di contatto (nome, email, telefono, messaggio) vengono trasmessi
          all&apos;agenzia titolare dell&apos;annuncio per rispondere alla richiesta.
        </p>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Termini di servizio' }

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-ink-900">Termini di servizio</h1>
      <div className="prose mt-6 space-y-4 text-ink-700">
        <p>
          <strong>Testo di esempio.</strong> Chi pubblica un annuncio dichiara di avere titolo per
          farlo e risponde della veridicità delle informazioni inserite.
        </p>
        <p>
          Il portale può sospendere gli annunci che risultano ingannevoli, duplicati o non più
          disponibili.
        </p>
      </div>
    </div>
  )
}

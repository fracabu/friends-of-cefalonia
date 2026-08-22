import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-medium text-brand-700">Errore 404</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900">Pagina non trovata</h1>
        <p className="mt-3 text-ink-600">
          L&apos;annuncio potrebbe essere stato ritirato o l&apos;indirizzo non è corretto.
        </p>
        <Link
          href="/cerca"
          className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700"
        >
          Torna alla ricerca
        </Link>
      </div>
    </div>
  )
}

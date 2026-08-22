import Link from 'next/link'
import { headers } from 'next/headers'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export default async function NonTrovata() {
  // Il segmento [lingua] non arriva alle pagine di errore: si usa quella che
  // il middleware ha già riconosciuto.
  const lingua = linguaSicura((await headers()).get('x-lingua'))
  const d = getDizionario(lingua)

  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-medium text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900">{d.errori.nonTrovataTitolo}</h1>
        <p className="mt-3 text-ink-600">{d.errori.nonTrovataTesto}</p>
        <Link
          href={percorso(lingua, '/cerca')}
          className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700"
        >
          {d.errori.tornaRicerca}
        </Link>
      </div>
    </div>
  )
}

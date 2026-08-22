import type { Metadata } from 'next'
import { getDizionario } from '@/i18n'
import { linguaSicura } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lingua: string }>
}): Promise<Metadata> {
  const d = getDizionario(linguaSicura((await params).lingua))
  return { title: d.statiche.chiSiamoTitolo }
}

export default async function Pagina({ params }: { params: Promise<{ lingua: string }> }) {
  const d = getDizionario(linguaSicura((await params).lingua))

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-ink-900">{d.statiche.chiSiamoTitolo}</h1>
      <div className="mt-6 space-y-4 text-ink-700">
        <p>{d.statiche.chiSiamo1}</p>
        <p>{d.statiche.chiSiamo2}</p>
      </div>
    </div>
  )
}

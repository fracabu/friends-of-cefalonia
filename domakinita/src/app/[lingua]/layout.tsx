import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProvvedituraLingua } from '@/i18n/client'
import { getDizionario } from '@/i18n'
import { LINGUE, isLingua, linguaSicura, percorso } from '@/i18n/config'
import { SITE_NAME } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lingua: string }>
}): Promise<Metadata> {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)

  return {
    title: { default: `${SITE_NAME} — ${d.meta.titolo}`, template: `%s | ${SITE_NAME}` },
    description: d.meta.descrizione,
    alternates: {
      canonical: percorso(lingua),
      languages: Object.fromEntries(LINGUE.map((l) => [l, percorso(l)])),
    },
    openGraph: { locale: lingua, title: `${SITE_NAME} — ${d.meta.titolo}`, description: d.meta.descrizione },
  }
}

/** Le tre lingue esistono in anticipo: Next può generarle senza attendere. */
export function generateStaticParams() {
  return LINGUE.map((lingua) => ({ lingua }))
}

export default async function LayoutLingua({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lingua: string }>
}) {
  const { lingua } = await params
  if (!isLingua(lingua)) notFound()

  return (
    <ProvvedituraLingua lingua={lingua} dizionario={getDizionario(lingua)}>
      {children}
    </ProvvedituraLingua>
  )
}

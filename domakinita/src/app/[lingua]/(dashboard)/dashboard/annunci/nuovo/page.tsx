import type { Metadata } from 'next'
import { ListingForm } from '@/components/ListingForm'
import { requireAgent } from '@/lib/auth'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export const metadata: Metadata = { robots: { index: false } }

export default async function NewListingPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  await requireAgent(percorso(lingua, '/dashboard/annunci/nuovo'))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">{d.dashboard.nuovoAnnuncio}</h1>
      <ListingForm />
    </div>
  )
}

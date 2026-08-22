import type { Metadata } from 'next'
import { ListingForm } from '@/components/ListingForm'
import { requireAgent } from '@/lib/auth'

export const metadata: Metadata = { title: 'Nuovo annuncio', robots: { index: false } }

export default async function NewListingPage() {
  await requireAgent('/dashboard/annunci/nuovo')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink-900">Nuovo annuncio</h1>
      <ListingForm />
    </div>
  )
}

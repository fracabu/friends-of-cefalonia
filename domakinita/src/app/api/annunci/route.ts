import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { searchListings } from '@/lib/listings'
import { parseSearchParams } from '@/lib/search'
import { listingSlug } from '@/lib/utils'
import { listingSchema } from '@/lib/validation'

/** Ricerca pubblica in JSON: stessi filtri di /cerca, per app e integrazioni. */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams)
  const results = await searchListings(parseSearchParams(params))
  return NextResponse.json(results)
}

/** Creazione annuncio. Solo agenzie e amministratori. */
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  if (session.role === 'USER') return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 })

  const payload = await request.json().catch(() => null)
  const parsed = listingSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { traduzioni, ...data } = parsed.data
  const created = await db.listing.create({
    data: {
      ...data,
      translations: {
        create: traduzioni
          .filter((t) => t.locale !== data.locale)
          .map((t) => ({ locale: t.locale, title: t.title, description: t.description })),
      },
      slug: 'provvisorio', // sostituito subito sotto: serve l'id per renderlo unico
      ownerId: session.userId,
      agencyId: session.agencyId,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    },
  })

  const listing = await db.listing.update({
    where: { id: created.id },
    data: { slug: listingSlug(data.title, data.city, created.id) },
  })

  return NextResponse.json(listing, { status: 201 })
}

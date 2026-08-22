import { NextResponse } from 'next/server'
import { canEditListing, getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { listingSchema } from '@/lib/validation'

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Context) {
  const listing = await db.listing.findUnique({
    where: { id: (await params).id },
    include: { images: { orderBy: { position: 'asc' } }, agency: true },
  })
  if (!listing) return NextResponse.json({ error: 'Annuncio non trovato' }, { status: 404 })
  return NextResponse.json(listing)
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await getSession()
  const listing = await db.listing.findUnique({
    where: { id: (await params).id },
    select: { id: true, ownerId: true, agencyId: true, publishedAt: true, locale: true },
  })
  if (!listing) return NextResponse.json({ error: 'Annuncio non trovato' }, { status: 404 })
  if (!canEditListing(session, listing)) {
    return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 })
  }

  const parsed = listingSchema.partial().safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { traduzioni, ...data } = parsed.data

  // Ogni lingua ha una riga sola: si aggiorna quella, non se ne accumulano.
  for (const t of traduzioni ?? []) {
    if (t.locale === (data.locale ?? listing.locale)) continue
    await db.listingTranslation.upsert({
      where: { listingId_locale: { listingId: listing.id, locale: t.locale } },
      create: { listingId: listing.id, locale: t.locale, title: t.title, description: t.description },
      update: { title: t.title, description: t.description },
    })
  }

  const updated = await db.listing.update({
    where: { id: listing.id },
    data: {
      ...data,
      // La data di pubblicazione si scrive una volta sola, alla prima uscita.
      publishedAt:
        data.status === 'PUBLISHED' && !listing.publishedAt ? new Date() : listing.publishedAt,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await getSession()
  const listing = await db.listing.findUnique({
    where: { id: (await params).id },
    select: { id: true, ownerId: true, agencyId: true },
  })
  if (!listing) return NextResponse.json({ error: 'Annuncio non trovato' }, { status: 404 })
  if (!canEditListing(session, listing)) {
    return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 })
  }

  // Si archivia, non si cancella: le richieste ricevute restano collegate.
  await db.listing.update({ where: { id: listing.id }, data: { status: 'ARCHIVED' } })
  return NextResponse.json({ ok: true })
}

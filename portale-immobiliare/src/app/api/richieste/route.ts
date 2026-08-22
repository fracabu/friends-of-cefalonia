import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leadSchema } from '@/lib/validation'

/**
 * Riceve una richiesta di contatto dalla scheda annuncio.
 * Qui si innesterà l'invio email all'agenzia: la riga è segnata più sotto.
 */
export async function POST(request: Request) {
  const form = await request.formData()
  const parsed = leadSchema.safeParse(Object.fromEntries(form))

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    const errors = Object.fromEntries(
      Object.entries(flat).map(([key, messages]) => [key, messages?.[0] ?? 'Campo non valido']),
    )
    return NextResponse.json({ errors }, { status: 400 })
  }

  const listing = await db.listing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true, agency: { select: { email: true, name: true } }, owner: { select: { email: true } } },
  })
  if (!listing) {
    return NextResponse.json({ errors: { form: 'Annuncio non trovato' } }, { status: 404 })
  }

  const lead = await db.lead.create({
    data: {
      listingId: listing.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    },
  })

  // TODO invio email: notificare listing.agency?.email ?? listing.owner.email
  // con un provider transazionale (Resend, Postmark, SES).

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

const bodySchema = z.object({ listingId: z.string().min(1) })

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })

  await db.favorite.upsert({
    where: { userId_listingId: { userId: session.userId, listingId: parsed.data.listingId } },
    create: { userId: session.userId, listingId: parsed.data.listingId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })

  await db.favorite
    .delete({
      where: { userId_listingId: { userId: session.userId, listingId: parsed.data.listingId } },
    })
    .catch(() => undefined) // togliere due volte lo stesso preferito non è un errore

  return NextResponse.json({ ok: true })
}

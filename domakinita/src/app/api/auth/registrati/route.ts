import { NextResponse } from 'next/server'
import { createSession, hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { registerSchema } from '@/lib/validation'

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password, phone, role, agencyName } = parsed.data

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return NextResponse.json(
      { errors: { email: 'Esiste già un account con questa email' } },
      { status: 409 },
    )
  }

  // Chi si registra come agenzia si porta dietro la sua scheda: senza, non
  // avrebbe dove appoggiare gli annunci.
  const agency =
    role === 'AGENT' && agencyName
      ? await db.agency.create({
          data: { name: agencyName, slug: `${slugify(agencyName)}-${Date.now().toString(36)}`, email },
        })
      : null

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      phone: phone || null,
      role,
      agencyId: agency?.id ?? null,
    },
  })

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    agencyId: user.agencyId,
  })

  return NextResponse.json({ ok: true, role: user.role }, { status: 201 })
}

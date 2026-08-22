import { NextResponse } from 'next/server'
import { createSession, verifyPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validation'

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } })
  // Stesso messaggio in entrambi i casi: non si rivela quali email esistono.
  const ok = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false
  if (!user || !ok) {
    return NextResponse.json({ errors: { form: 'Email o password non corretti' } }, { status: 401 })
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    agencyId: user.agencyId,
  })

  return NextResponse.json({ ok: true, role: user.role })
}

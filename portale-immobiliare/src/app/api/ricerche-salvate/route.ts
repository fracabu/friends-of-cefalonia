import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { savedSearchSchema } from '@/lib/validation'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const searches = await db.savedSearch.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(searches)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const parsed = savedSearchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const saved = await db.savedSearch.create({
    data: {
      userId: session.userId,
      name: parsed.data.name,
      query: parsed.data.query,
      frequency: parsed.data.frequency,
    },
  })

  return NextResponse.json(saved, { status: 201 })
}

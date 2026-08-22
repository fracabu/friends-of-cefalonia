import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Autocomplete della barra di ricerca: comuni e zone che iniziano per `q`. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const locations = await db.location.findMany({
    where: { name: { startsWith: q, mode: 'insensitive' } },
    select: { slug: true, name: true, type: true, province: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    take: 8,
  })

  return NextResponse.json(locations, {
    headers: { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' },
  })
}

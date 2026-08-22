import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { canEditListing, getSession } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * Upload delle fotografie di un annuncio.
 *
 * In sviluppo scrive su public/uploads. In produzione questa route va
 * sostituita da un upload firmato verso S3 o simile: il filesystem di un
 * server Next non è un posto dove tenere le immagini.
 */

const MAX_BYTES = 8 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  // Su Vercel il disco è di sola lettura e sparisce a ogni richiesta: meglio
  // dirlo chiaro che scrivere file che nessuno ritroverà.
  if (process.env.VERCEL || process.env.UPLOAD_DRIVER !== 'local') {
    return NextResponse.json(
      {
        error:
          'Il caricamento delle fotografie su disco funziona solo in sviluppo. In produzione va collegato uno spazio esterno (S3, Cloudflare R2, UploadThing): vedi il README.',
      },
      { status: 501 },
    )
  }

  const form = await request.formData()
  const listingId = String(form.get('listingId') ?? '')
  const files = form.getAll('file').filter((f): f is File => f instanceof File)

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true, agencyId: true, _count: { select: { images: true } } },
  })
  if (!listing) return NextResponse.json({ error: 'Annuncio non trovato' }, { status: 404 })
  if (!canEditListing(session, listing)) {
    return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 })
  }
  if (!files.length) return NextResponse.json({ error: 'Nessun file ricevuto' }, { status: 400 })

  const dir = join(process.cwd(), 'public', 'uploads', listing.id)
  await mkdir(dir, { recursive: true })

  const created = []
  let position = listing._count.images

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `${file.name} supera gli 8 MB` }, { status: 413 })
    }
    if (!ACCEPTED.includes(file.type)) {
      return NextResponse.json({ error: `${file.name}: formato non ammesso` }, { status: 415 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const name = randomUUID()

    // Due versioni: una per la scheda, una per le liste. Le foto dei telefoni
    // pesano quanto una pagina intera se pubblicate come sono.
    const full = await sharp(buffer).rotate().resize(1600, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
    const thumb = await sharp(buffer).rotate().resize(640, 480, { fit: 'cover' }).webp({ quality: 74 }).toBuffer()

    await writeFile(join(dir, `${name}.webp`), full)
    await writeFile(join(dir, `${name}-thumb.webp`), thumb)

    const meta = await sharp(full).metadata()
    const image = await db.listingImage.create({
      data: {
        listingId: listing.id,
        url: `/uploads/${listing.id}/${name}.webp`,
        thumbUrl: `/uploads/${listing.id}/${name}-thumb.webp`,
        width: meta.width ?? null,
        height: meta.height ?? null,
        position: position,
        isCover: position === 0,
      },
    })
    position += 1
    created.push(image)
  }

  return NextResponse.json(created, { status: 201 })
}

import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { popola } from '../../../../../prisma/dati-esempio'

/**
 * Riempie il database con gli annunci di esempio, aprendo un indirizzo.
 *
 * Serve a chi mette online il portale senza avere un computer sotto mano: da
 * riga di comando basterebbe `pnpm db:seed`, dal telefono no.
 *
 * Tre chiavistelli, perché questa route cancella e riscrive le tabelle:
 *  - senza la variabile SEED_TOKEN la route non esiste (404): finita la
 *    messa online, si toglie la variabile e il portello è murato;
 *  - la chiave si confronta a tempo costante, così non la si indovina
 *    misurando quanto ci mette a rispondere;
 *  - se il database ha già annunci si ferma, a meno di dirlo apposta:
 *    l'errore che non si vuole fare è azzerare annunci veri.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function chiaveGiusta(fornita: string, attesa: string) {
  const a = Buffer.from(fornita)
  const b = Buffer.from(attesa)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(request: Request) {
  const attesa = process.env.SEED_TOKEN

  // Senza chiave configurata la route si comporta come se non ci fosse.
  if (!attesa || attesa.length < 16) {
    return new NextResponse('Not found', { status: 404 })
  }

  const url = new URL(request.url)
  const fornita = url.searchParams.get('chiave') ?? ''

  if (!chiaveGiusta(fornita, attesa)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const esistenti = await db.listing.count()
  const sovrascrivi = url.searchParams.get('sovrascrivi') === 'si'

  if (esistenti > 0 && !sovrascrivi) {
    return NextResponse.json(
      {
        stato: 'fermo',
        annunciPresenti: esistenti,
        spiegazione:
          'Il database ha già annunci. Popolarlo di nuovo cancellerebbe tutto. Per farlo comunque, aggiungi &sovrascrivi=si all’indirizzo.',
      },
      { status: 409 },
    )
  }

  const righe: string[] = []
  const iniziato = Date.now()

  try {
    const riepilogo = await popola(db, (messaggio) => righe.push(messaggio))

    return NextResponse.json({
      stato: 'fatto',
      ...riepilogo,
      secondi: Math.round((Date.now() - iniziato) / 100) / 10,
      registro: righe,
      adesso:
        'Entra con agente1@example.gr e password123, cambia la password, e togli SEED_TOKEN dalle variabili di Vercel.',
    })
  } catch (errore) {
    return NextResponse.json(
      {
        stato: 'errore',
        messaggio: errore instanceof Error ? errore.message : String(errore),
        registro: righe,
      },
      { status: 500 },
    )
  }
}

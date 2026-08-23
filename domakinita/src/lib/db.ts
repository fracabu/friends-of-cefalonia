import { PrismaClient } from '@prisma/client'

/**
 * Da dove arriva la connessione al database.
 *
 * Lo stesso database si presenta con nomi diversi a seconda di come lo si
 * collega: chi incolla la stringa a mano usa DATABASE_URL, l'integrazione
 * Neon-Vercel ne pubblica una mezza dozzina con altri nomi. E capita che una
 * variabile esista ma sia vuota — un nome aggiunto nel pannello senza
 * incollarci dentro il valore: quella va scavalcata, non usata.
 *
 * Il controllo sta anche qui e non solo nel build, perché il client Prisma
 * legge l'ambiente quando viene costruito, cioè dentro la funzione che serve
 * la richiesta: un build passato non garantisce niente al momento buono.
 */
const CANDIDATI = ['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL', 'NEON_DATABASE_URL']

function connessione() {
  for (const nome of CANDIDATI) {
    const valore = process.env[nome]?.trim()
    if (valore) return valore
  }
  return undefined
}

// In sviluppo Next ricarica i moduli a ogni salvataggio: senza questo
// singleton si aprirebbe una connessione nuova a ogni hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: connessione(),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

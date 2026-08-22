import { PrismaClient } from '@prisma/client'

// In sviluppo Next ricarica i moduli a ogni salvataggio: senza questo
// singleton si aprirebbe una connessione nuova a ogni hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

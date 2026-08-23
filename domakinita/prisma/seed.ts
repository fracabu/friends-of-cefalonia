import { PrismaClient } from '@prisma/client'
import { popola } from './dati-esempio'

/** `pnpm db:seed`: apre una connessione, riempie, chiude. */
const db = new PrismaClient()

popola(db)
  .catch((errore) => {
    console.error(errore)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

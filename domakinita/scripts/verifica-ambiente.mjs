/*
 * Controlla le variabili d'ambiente prima che parta la compilazione.
 *
 * Senza, un valore mancante si manifesta come un errore di validazione dello
 * schema Prisma in mezzo al registro di Vercel — «(get-config wasm)», codice
 * P1012 — che non dice a chi sta pubblicando né quale variabile manca né dove
 * prenderne il valore. Qui invece lo dice.
 */

import { readFileSync } from 'node:fs'

// In locale le variabili stanno in .env, che Prisma e Next leggono da sé ma
// questo script no: gira prima di entrambi. Su Vercel il file non esiste e i
// valori arrivano dall'ambiente.
try {
  for (const riga of readFileSync('.env', 'utf8').split('\n')) {
    const trovato = riga.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
    if (!trovato) continue
    const [, nome, grezzo] = trovato
    if (process.env[nome] === undefined) {
      process.env[nome] = grezzo.replace(/^["']|["']$/g, '')
    }
  }
} catch {
  // nessun .env: siamo in produzione, e va bene così
}

const RICHIESTE = [
  {
    nome: 'DATABASE_URL',
    spiegazione:
      'la stringa di connessione dell’applicazione. Su Neon è quella CON «-pooler» nel nome: regge le tante connessioni brevi delle funzioni serverless.',
  },
  {
    nome: 'DIRECT_URL',
    spiegazione:
      'la stringa per le migrazioni. Su Neon è quella SENZA «-pooler»: il pooler non sa gestire le transazioni con cui Prisma applica le migrazioni.',
  },
  {
    nome: 'AUTH_SECRET',
    spiegazione:
      'la chiave che firma il cookie di sessione, almeno 32 caratteri. Generala con: openssl rand -base64 32',
    minimo: 32,
  },
]

const problemi = []

for (const variabile of RICHIESTE) {
  const valore = process.env[variabile.nome]

  if (valore === undefined) problemi.push({ ...variabile, causa: 'non è definita' })
  else if (valore.trim() === '') problemi.push({ ...variabile, causa: 'è definita ma vuota' })
  else if (variabile.minimo && valore.length < variabile.minimo) {
    problemi.push({ ...variabile, causa: `è lunga ${valore.length} caratteri invece di ${variabile.minimo}` })
  }
}

if (problemi.length) {
  console.error('\nNon posso compilare: mancano variabili d’ambiente.\n')
  for (const problema of problemi) {
    console.error(`  ${problema.nome} — ${problema.causa}`)
    console.error(`     ${problema.spiegazione}\n`)
  }
  console.error(
    'Su Vercel si impostano in Settings → Environment Variables, e vanno\n' +
      'abilitate per Production, Preview e Development. Il valore si incolla\n' +
      'nudo, senza virgolette intorno. Dopo averle aggiunte serve un Redeploy.\n',
  )
  process.exit(1)
}

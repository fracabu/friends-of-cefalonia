/*
 * Il build di produzione, in un processo solo.
 *
 * Perché non una catena di comandi in package.json: le variabili d'ambiente
 * vanno normalizzate *prima* che Prisma legga lo schema, e da uno script
 * separato non si può cambiare l'ambiente dei comandi che seguono. Qui invece
 * i tre passi vengono lanciati da qui, con l'ambiente già a posto.
 *
 * La normalizzazione serve perché lo stesso database si presenta con nomi
 * diversi a seconda di come è stato collegato: chi incolla le stringhe a mano
 * usa DATABASE_URL e DIRECT_URL, l'integrazione Neon-Vercel ne pubblica una
 * mezza dozzina con altri nomi. Invece di pretendere i nostri, li accettiamo
 * tutti e li ricopiamo dove Prisma li cerca.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { delimiter, join } from 'node:path'

// I comandi del progetto stanno in node_modules/.bin: lanciato da «pnpm build»
// il percorso c'è già, lanciato a mano no.
process.env.PATH = [join(process.cwd(), 'node_modules', '.bin'), process.env.PATH].join(delimiter)

// --- .env, in locale ------------------------------------------------------
// Prisma e Next lo leggono per conto loro, ma questo script gira prima.
try {
  for (const riga of readFileSync('.env', 'utf8').split('\n')) {
    const trovato = riga.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
    if (!trovato) continue
    const [, nome, grezzo] = trovato
    if (!process.env[nome]) process.env[nome] = grezzo.replace(/^["']|["']$/g, '')
  }
} catch {
  // nessun .env: siamo in produzione
}

const pieno = (nome) => {
  const valore = process.env[nome]
  return typeof valore === 'string' && valore.trim() !== '' ? valore.trim() : null
}

/** Il primo nome che porta davvero un valore. */
function primoDisponibile(nomi) {
  for (const nome of nomi) {
    const valore = pieno(nome)
    if (valore) return { nome, valore }
  }
  return null
}

// --- normalizzazione ------------------------------------------------------

const ALIAS = {
  // L'applicazione: connessione con il pooler, tante connessioni brevi.
  DATABASE_URL: ['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL', 'NEON_DATABASE_URL'],
  // Le migrazioni: connessione diretta, il pooler non regge le transazioni DDL.
  DIRECT_URL: [
    'DIRECT_URL',
    'DATABASE_URL_UNPOOLED',
    'POSTGRES_URL_NON_POOLING',
    'DIRECT_DATABASE_URL',
  ],
}

const provenienza = {}

for (const [atteso, candidati] of Object.entries(ALIAS)) {
  const trovato = primoDisponibile(candidati)
  if (trovato) {
    process.env[atteso] = trovato.valore
    provenienza[atteso] = trovato.nome
  }
}

// Senza connessione diretta si può ancora migrare attraverso il pooler: va
// più piano e in casi rari fallisce, ma è meglio di un build che non parte.
if (!pieno('DIRECT_URL') && pieno('DATABASE_URL')) {
  process.env.DIRECT_URL = process.env.DATABASE_URL
  provenienza.DIRECT_URL = 'DATABASE_URL (ripiego)'
}

// --- controllo ------------------------------------------------------------

const RICHIESTE = [
  {
    nome: 'DATABASE_URL',
    spiegazione:
      'la stringa di connessione del database. Su Neon è quella CON «-pooler» nel nome.',
  },
  {
    nome: 'AUTH_SECRET',
    minimo: 32,
    spiegazione:
      'la chiave che firma il cookie di sessione, almeno 32 caratteri. Generala con: openssl rand -base64 32',
  },
]

const problemi = RICHIESTE.flatMap((variabile) => {
  const valore = process.env[variabile.nome]
  if (valore === undefined) return [{ ...variabile, causa: 'non è definita' }]
  if (valore.trim() === '') return [{ ...variabile, causa: 'è definita ma vuota' }]
  if (variabile.minimo && valore.length < variabile.minimo) {
    return [{ ...variabile, causa: `è lunga ${valore.length} caratteri invece di ${variabile.minimo}` }]
  }
  return []
})

if (problemi.length) {
  console.error('\nNon posso compilare: mancano variabili d’ambiente.\n')
  for (const problema of problemi) {
    console.error(`  ${problema.nome} — ${problema.causa}`)
    console.error(`     ${problema.spiegazione}\n`)
  }

  // Che cosa è arrivato davvero: senza questo elenco si tira a indovinare.
  const interessanti = Object.keys(process.env)
    .filter((nome) => /^(DATABASE|DIRECT|POSTGRES|PG|NEON|AUTH|NEXT_PUBLIC)/.test(nome))
    .sort()

  console.error(`Ambiente Vercel: ${process.env.VERCEL_ENV ?? 'non è un build Vercel'}`)
  console.error('Variabili viste dal build:')
  if (interessanti.length === 0) console.error('  nessuna: al build non ne è arrivata neanche una')
  for (const nome of interessanti) {
    const valore = process.env[nome] ?? ''
    console.error(`  ${nome} = ${valore.trim() === '' ? 'VUOTA' : `${valore.trim().length} caratteri`}`)
  }

  console.error(
    '\nSu Vercel: Settings → Environment Variables. Ogni variabile va abilitata\n' +
      'per Production, Preview e Development, e il valore si incolla nudo,\n' +
      'senza virgolette. Dopo averle corrette serve un Redeploy.\n',
  )
  process.exit(1)
}

for (const [nome, da] of Object.entries(provenienza)) {
  if (da !== nome) console.log(`${nome} preso da ${da}`)
}

// --- i tre passi ----------------------------------------------------------

for (const comando of [
  ['prisma', ['generate']],
  ['prisma', ['migrate', 'deploy']],
  ['next', ['build']],
]) {
  const [programma, argomenti] = comando
  const esito = spawnSync(programma, argomenti, { stdio: 'inherit', env: process.env, shell: true })
  if (esito.status !== 0) process.exit(esito.status ?? 1)
}

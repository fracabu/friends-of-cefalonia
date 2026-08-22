# Portale immobiliare

Portale di annunci immobiliari sul modello dei grandi portali italiani: ricerca
per comune e zona con filtri e mappa, scheda immobile con galleria e richiesta
di visita, pannello per le agenzie che pubblicano.

**Stack**: Next.js 15 (App Router) · TypeScript · PostgreSQL con Prisma ·
Tailwind CSS · Leaflet · Zod.

---

## Avvio in locale

```bash
cp .env.example .env      # e genera AUTH_SECRET: openssl rand -base64 32
docker compose up -d      # PostgreSQL 16 sulla porta 5432
pnpm install
pnpm db:push              # crea le tabelle
pnpm db:seed              # 60 annunci, 3 agenzie, utenti di prova
pnpm dev
```

Il sito risponde su <http://localhost:3000>.

Accessi creati dal seed (password `password123` per tutti):

| Email | Ruolo | Cosa vede |
|---|---|---|
| `agente1@example.it` | agenzia | pannello annunci e richieste di Studio Casa Roma |
| `utente@example.it` | privato | preferiti e ricerche salvate |
| `admin@example.it` | amministratore | tutti gli annunci |

## Comandi

| Comando | Cosa fa |
|---|---|
| `pnpm dev` | sviluppo con hot reload |
| `pnpm build` / `pnpm start` | build di produzione e avvio |
| `pnpm typecheck` | TypeScript senza emettere file |
| `pnpm lint` | ESLint (regole Next) |
| `pnpm db:push` | allinea il database allo schema, senza migrazioni |
| `pnpm db:migrate` | crea una migrazione versionata |
| `pnpm db:seed` | svuota e ripopola con dati di esempio |
| `pnpm db:studio` | interfaccia grafica sul database |

---

## Le pagine

| Percorso | Cosa fa |
|---|---|
| `/` | barra di ricerca, annunci in evidenza, città, ultimi inserimenti |
| `/cerca` | risultati con filtri, ordinamento, paginazione e mappa affiancata |
| `/annuncio/[slug]` | scheda: galleria, caratteristiche, mappa, modulo di contatto, simili |
| `/agenzie`, `/agenzie/[slug]` | elenco agenzie e vetrina con il portafoglio |
| `/preferiti`, `/ricerche-salvate` | area di chi cerca casa |
| `/accedi`, `/registrati` | accesso come privato o come agenzia |
| `/valuta-immobile` | pagina di acquisizione per chi vende |
| `/dashboard` | riepilogo: annunci, bozze, richieste, visualizzazioni |
| `/dashboard/annunci` | tabella del portafoglio, con inserimento e modifica |
| `/dashboard/richieste` | le richieste ricevute, per annuncio |

Tutte le API stanno sotto `/api`, con nomi in italiano coerenti con le pagine:
`/api/annunci`, `/api/richieste`, `/api/preferiti`, `/api/ricerche-salvate`,
`/api/luoghi`, `/api/upload`, `/api/auth/*`.

---

## Come è fatto dentro

```
src/
  app/
    (site)/          pagine pubbliche, con header e footer
    (dashboard)/     area riservata, con la sua barra laterale
    api/             route handler
  components/        componenti di dominio (ListingCard, FilterPanel, …)
    ui/              primitive: Button, Field, Badge, EmptyState
  lib/
    db.ts            client Prisma (singleton)
    search.ts        filtri: URL -> tipi -> query Prisma
    listings.ts      accesso ai dati degli annunci
    auth.ts          sessione, hash password, permessi
    validation.ts    schemi Zod condivisi fra moduli e API
    labels.ts        etichette italiane degli enum
    format.ts        prezzi, superfici, date
    seo.ts           titoli e dati strutturati schema.org
prisma/
  schema.prisma      modello dati
  seed.ts            dati di esempio
```

Tre scelte spiegano quasi tutto il resto.

**I filtri vivono nell'URL.** `src/lib/search.ts` è l'unico posto dove un
parametro come `prezzoMax` diventa una condizione Prisma. La pagina di ricerca,
la route `/api/annunci` e le ricerche salvate passano tutte da lì, quindi un
filtro nuovo si aggiunge in un file solo. Il risultato è anche un URL
condivisibile e indicizzabile.

**Il dominio parla italiano in un posto solo.** Gli enum del database restano in
inglese, `src/lib/labels.ts` tiene le etichette. Nessun componente scrive
«Appartamento» a mano.

**La sessione è un JWT in un cookie httpOnly.** `src/lib/auth.ts` sta in un
centinaio di righe: il resto dell'applicazione conosce solo `getSession()`,
`requireUser()`, `requireAgent()` e `canEditListing()`. Per passare a Auth.js,
Google o SPID si riscrive quel file, non le pagine.

### Il modello dati

`User` (privato, agente, amministratore) appartiene facoltativamente a una
`Agency`. `Listing` è l'annuncio, con `ListingImage` per le fotografie, e
raccoglie i `Lead`, cioè le richieste di contatto. `Favorite` e `SavedSearch`
sono il lato di chi cerca. `Location` alimenta l'autocomplete dei comuni.

Gli indici su `Listing` sono scelti sui filtri realmente usati dalla pagina di
ricerca: stato + contratto + tipologia, stato + città, stato + prezzo, stato +
data di pubblicazione.

---

## Cosa manca prima della produzione

Il progetto è completo come struttura e funziona da cima a fondo, ma queste voci
vanno affrontate prima di mettere online un portale vero.

1. **Immagini su storage esterno.** `/api/upload` scrive in `public/uploads`:
   va bene in sviluppo, non su un server con più istanze. Sostituire con upload
   firmato verso S3, Cloudflare R2 o UploadThing.
2. **Invio email.** In `/api/richieste` c'è il punto segnato dove notificare
   l'agenzia (Resend, Postmark, SES). Servono anche gli avvisi delle ricerche
   salvate, con un job schedulato.
3. **Geocodifica degli indirizzi.** Oggi latitudine e longitudine si inseriscono
   a mano nel modulo. Un servizio di geocoding (Nominatim, Mapbox) le ricava
   dall'indirizzo al salvataggio.
4. **Antispam sui moduli di contatto.** Un portale senza protezione raccoglie
   più spam che clienti: rate limit per IP e un captcha invisibile.
5. **Moderazione.** Il ruolo `ADMIN` esiste nel modello ma non ha ancora le sue
   pagine: coda di approvazione, segnalazioni, sospensione degli annunci.
6. **Privacy e termini.** I testi in `/privacy` e `/termini` sono segnaposto. Un
   sito che raccoglie recapiti ha bisogno di un'informativa scritta sul
   trattamento reale.
7. **Test.** Non ce ne sono. I primi da scrivere sono su `lib/search.ts`, che è
   il punto dove un errore si vede meno e costa di più.

## Distribuzione

Il progetto gira su qualunque piattaforma che supporti Next.js in modalità
server (Vercel, Railway, Fly.io, un container). Servono `DATABASE_URL`,
`AUTH_SECRET` e `NEXT_PUBLIC_SITE_URL`; `pnpm build` lancia già
`prisma generate`. Le migrazioni si applicano con `prisma migrate deploy`.

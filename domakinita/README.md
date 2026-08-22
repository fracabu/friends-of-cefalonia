# Domakinita · Δομακίνητα

Portale di annunci immobiliari **per Cefalonia**: case, ville e terreni
edificabili dell'isola, con la ricerca dei grandi portali — filtri, mappa e
**area disegnata a mano** — e il pannello per le agenzie che pubblicano.

Il pubblico sono gli italiani che comprano nelle Ionie e le agenzie che stanno
sull'isola: l'interfaccia è in italiano, i luoghi e i prezzi sono quelli di
Cefalonia. Niente nel codice è legato all'isola: per estendersi a Itaca, Zante
o al resto della Grecia bastano nuovi dati.

Il nome tiene insieme le due lingue del portale: **domo**, la casa, che un
italiano legge senza pensarci, e **ακίνητα** (*akinita*), che in Grecia è la
parola dell'immobiliare — alla lettera «i beni che non si spostano», ed è il
termine con cui si cerca casa lì, come da noi si cerca «immobiliare». Sotto il
nome, nel piè di pagina, il descrittore lo dice per esteso in greco: «αγγελίες
ακινήτων», annunci immobiliari.

Il marchio è una casa ridotta a tre tratti, con la porta a forma di **Π**:
insieme una porta e una lettera greca, e il prospetto di un tempio senza doverlo
disegnare. È in `currentColor`, quindi vive su fondo chiaro e scuro senza una
seconda versione, e regge a sedici pixel — la misura in cui un marchio si vede
davvero, nella linguetta del browser.

Il nome sta in una sola variabile (`NEXT_PUBLIC_SITE_NAME`) e il marchio in tre
file (`src/components/Logo.tsx`, `src/app/icon.svg`, `public/logo.svg`):
cambiarli è questione di minuti.

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
| `agente1@example.gr` | agenzia | pannello annunci e richieste di Ionian Home Argostoli |
| `utente@example.gr` | privato | preferiti e ricerche salvate |
| `admin@example.gr` | amministratore | tutti gli annunci |

## Comandi

| Comando | Cosa fa |
|---|---|
| `pnpm dev` | sviluppo con hot reload |
| `pnpm build` / `pnpm start` | build di produzione e avvio |
| `pnpm typecheck` | TypeScript senza emettere file |
| `pnpm lint` | ESLint (regole Next) |
| `pnpm db:push` | allinea il database allo schema, senza migrazioni |
| `pnpm db:migrate` | crea una migrazione versionata |
| `pnpm db:seed` | svuota e ripopola con 60 annunci di esempio a Cefalonia |
| `pnpm db:studio` | interfaccia grafica sul database |

---

## Le pagine

| Percorso | Cosa fa |
|---|---|
| `/` | barra di ricerca, annunci in evidenza, città, ultimi inserimenti |
| `/cerca` | risultati con tutti i filtri, ordinamento, paginazione e mappa con ricerca per area |
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

## La demo statica

`docs/index.html` è una versione della pagina di ricerca che gira **senza
server**: gli stessi sessanta annunci, gli stessi filtri, lo stesso disegno
dell'area, con i dati incorporati nella pagina e un profilo schematico
dell'isola al posto delle mappe di OpenStreetMap.

Serve a due cose: far provare la ricerca a chi non ha voglia di installare
niente, e stare su **GitHub Pages**, che ospita solo file statici e non
potrebbe mai far girare l'applicazione vera.

Si pubblica da sé: il workflow `.github/workflows/pages.yml` accende Pages alla
prima esecuzione (`configure-pages` con `enablement: true`) e ripubblica a ogni
push che tocchi `docs/`. L'indirizzo è `https://<utente>.github.io/domakinita/`.

Se l'esecuzione fallisce con un errore di permessi, il repository ha le Actions
limitate: in quel caso vale la strada manuale, *Settings → Pages → Source:
Deploy from a branch → `main` / `docs`*.

Va rigenerata quando cambiano i dati di esempio: la demo li porta dentro di sé,
non li legge dal database.

---

## La ricerca

È la parte che un portale deve fare meglio di tutte, quindi ha la sua sezione.

### Cercare per posizione

Tre modi, tutti scritti nell'URL e quindi condivisibili, salvabili fra le
ricerche e ricaricabili:

| Come | Parametro | Che cosa fa |
|---|---|---|
| **Zona disegnata a mano** | `area=` | si tiene premuto sulla mappa e si traccia il contorno: dentro quella forma, e solo lì |
| **Raggio da un punto** | `centro=` + `raggio=` | tutti gli immobili entro N km dal centro della vista |
| **Riquadro visibile** | `bbox=` | «cerca mentre sposto la mappa»: i risultati seguono la vista |

Il tracciato a mano libera produce centinaia di punti quasi uguali:
`simplifyPolygon` (Ramer-Douglas-Peucker) li riduce a qualche decina, e
`encodePolyline` li comprime nella codifica polyline di Google. Un poligono da
quaranta vertici sta in una sessantina di caratteri: l'URL resta un URL.

Il filtro si applica in due passaggi (`src/lib/listings.ts`): prima il
rettangolo che contiene la forma, che l'indice su `(latitude, longitude)` copre
bene, poi il punto-dentro-poligono esatto in memoria. Sopra il milione di
annunci questo secondo passaggio va spostato in PostGIS (`ST_Contains` con
indice GiST) senza cambiare la firma della funzione.

### Tutti i filtri

- **dove**: paese (anche più d'uno), zona, testo libero
- **cosa**: vendita o affitto, dodici tipologie selezionabili insieme
- **prezzo**: minimo, massimo, trattativa riservata, spese incluse, cauzione massima
- **consistenza**: superficie, locali da/a, camere, bagni, piano da/a, solo piano terra, solo ultimo piano, anno di costruzione
- **caratteristiche**: stato, arredamento, riscaldamento, classe energetica minima, tipo di proprietà (intera, nuda, multi), disponibilità
- **dotazioni**: ascensore, giardino, terrazzo, balcone, box, cantina, piscina, aria condizionata, animali ammessi
- **annuncio**: solo con fotografie, con planimetria, con tour virtuale, nuova costruzione, aste, pubblicati negli ultimi N giorni, agenzia o privato, codice di riferimento
- **ordinamento**: rilevanza, più recenti, prezzo crescente e decrescente, superficie

I filtri attivi compaiono come chip richiudibili sopra i risultati. Le aste
restano fuori dai risultati normali finché non si spuntano: chi cerca casa non
vuole trovarsi in mezzo una procedura giudiziaria.

«Solo ultimo piano» confronta due colonne fra loro (`floor` con `totalFloors`):
lo fa `completeWhere` in `lib/listings.ts` con il riferimento di campo di
Prisma, perché quella condizione ha bisogno del client.

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
    geo.ts           poligoni, raggi, riquadri: codifica e geometria
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
parametro come `prezzoMax` — o un poligono disegnato a mano — diventa una
condizione Prisma. La pagina di ricerca, la route `/api/annunci` e le ricerche
salvate passano tutte da lì, quindi un filtro nuovo si aggiunge in un file solo.
Il risultato è anche un URL condivisibile e indicizzabile.

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
3. **PostGIS per l'area disegnata.** Il filtro per poligono oggi rifinisce in
   memoria fino a cinquemila candidati per pagina di risultati. Regge un
   portale regionale; per uno nazionale serve una colonna `geography` con
   indice GiST.
4. **Geocodifica degli indirizzi.** Oggi latitudine e longitudine si inseriscono
   a mano nel modulo. Un servizio di geocoding (Nominatim, Mapbox) le ricava
   dall'indirizzo al salvataggio.
5. **Antispam sui moduli di contatto.** Un portale senza protezione raccoglie
   più spam che clienti: rate limit per IP e un captcha invisibile.
6. **Moderazione.** Il ruolo `ADMIN` esiste nel modello ma non ha ancora le sue
   pagine: coda di approvazione, segnalazioni, sospensione degli annunci.
7. **Privacy e termini.** I testi in `/privacy` e `/termini` sono segnaposto. Un
   sito che raccoglie recapiti ha bisogno di un'informativa scritta sul
   trattamento reale.
8. **Test.** Non ce ne sono. I primi da scrivere sono su `lib/search.ts` e
   `lib/geo.ts`: sono i punti dove un errore si vede meno e costa di più.

## Metterlo online: Neon e Vercel

Il progetto gira su qualunque piattaforma che esegua Next.js in modalità server.
Quella che segue è la strada più corta — database su **Neon**, applicazione su
**Vercel** — e sono una decina di minuti in tutto. Entrambi hanno un piano
gratuito che regge un portale agli inizi.

### 1. Il database

Su [neon.tech](https://neon.tech) crea un progetto (regione **Frankfurt**, la
più vicina alle Ionie). Nella pagina *Connection Details* trovi due stringhe:
quella con `-pooler` nel nome e quella senza. Servono entrambe.

### 2. L'applicazione

Su [vercel.com](https://vercel.com) fai *Add New → Project* e scegli questo
repository. Vercel riconosce Next.js da solo; prima di premere *Deploy*
aggiungi le variabili d'ambiente:

| Variabile | Valore |
|---|---|
| `DATABASE_URL` | la stringa Neon **con** `-pooler` |
| `DIRECT_URL` | la stringa Neon **senza** `-pooler` |
| `AUTH_SECRET` | `openssl rand -base64 32` — una chiave nuova, non quella di sviluppo |
| `NEXT_PUBLIC_SITE_URL` | l'indirizzo del sito, per esempio `https://domakinita.vercel.app` |
| `NEXT_PUBLIC_SITE_NAME` | `Domakinita` |

Il comando di build è già quello giusto: `prisma generate && prisma migrate
deploy && next build`. Le tabelle nascono quindi da sole alla prima
pubblicazione, e `migrate deploy` non fa danni se le trova già.

### 3. I primi annunci

Il database esce vuoto. Per riempirlo con i sessanta annunci di esempio, da
locale, con le stringhe di Neon al posto di quelle di sviluppo:

```bash
DATABASE_URL="…-pooler…" DIRECT_URL="…" pnpm db:seed
```

Poi entra con `agente1@example.gr` e password `password123` — **e cambiala
subito**, o cancella gli utenti di prova prima di dare l'indirizzo a qualcuno.

### 4. Il dominio

In *Settings → Domains* di Vercel aggiungi il dominio quando ce l'hai, e
aggiorna `NEXT_PUBLIC_SITE_URL`: da quella variabile dipendono i link canonici,
la sitemap e i dati strutturati degli annunci.

### Quello che non funziona finché non lo colleghi

**Il caricamento delle fotografie.** Su Vercel il disco è di sola lettura e
sparisce a ogni richiesta, quindi `/api/upload` risponde 501 con un messaggio
esplicito invece di fingere. Serve uno spazio esterno — S3, Cloudflare R2,
UploadThing — e la route va riscritta per firmare l'upload verso quello. Gli
annunci del seed non ne risentono: le loro immagini sono già remote.

**L'invio delle email.** Le richieste di contatto finiscono nel database e si
leggono dal pannello, ma nessuno riceve una notifica finché non colleghi un
servizio transazionale nel punto segnato in `src/app/api/richieste/route.ts`.

# Stato del progetto

Ultimo aggiornamento: 23 agosto 2026. Questo file racconta **dove siamo**: il
README spiega com'è fatto il portale, qui c'è cosa è fatto, cosa manca e cosa
resta da decidere. Va aggiornato quando cambia qualcosa di sostanziale.

---

## Dov'è il codice

| Cosa | Dove |
|---|---|
| Repository | `fracabu/domakinita`, ramo `main` |
| Applicazione online | `https://domakinita.vercel.app` (deploy automatico a ogni push) |
| Demo statica | `https://fracabu.github.io/domakinita/`, generata da `demo/pagina.html` in `docs/` |
| Copia di lavoro storica | `fracabu/friends-of-cefalonia`, ramo `claude/real-estate-site-structure-8vso4o` — serviva da ponte prima che il repo vero esistesse, si può ignorare |

`fracabu/domoktima` è rimasto vuoto: si può cancellare.

---

## Che cos'è

Portale di annunci immobiliari **per Cefalonia**. Il pubblico sono gli italiani
che comprano nelle Ionie, le agenzie dell'isola che vendono, e i nordeuropei
che arrivano d'estate.

Next.js 15 App Router, TypeScript, PostgreSQL con Prisma, Tailwind, Leaflet,
Zod. Niente nel codice è legato all'isola: per estendersi a Itaca, Zante o al
resto della Grecia bastano dati nuovi.

---

## Fatto

**Ricerca.** Filtri completi in una barra a pillole sempre visibile (contratto,
luogo, prezzo, superficie, locali, tipologia) più il pannello esteso. Tre modi
di cercare per posizione: **area disegnata a mano** sulla mappa, raggio in
chilometri, riquadro visibile. Tutto vive nell'URL, quindi si condivide, si
salva fra le ricerche e si ricarica. Il poligono viene semplificato con
Ramer-Douglas-Peucker e compresso in codifica polyline; il filtro lavora in due
passaggi — rettangolo dall'indice, poi forma esatta in memoria. Il passaggio a
PostGIS non cambia la firma pubblica delle funzioni.

**Tre lingue.** Italiano, inglese, greco, sotto `/it`, `/en`, `/el`. Chi arriva
senza prefisso viene mandato alla propria: cookie, poi intestazione del
browser, infine italiano. Il dizionario italiano fa **anche da tipo**: una voce
aggiunta e non tradotta non compila. Gli annunci hanno una lingua propria
(`Listing.locale`) e traduzioni per le altre (`ListingTranslation`); dove manca
la traduzione si mostra l'originale e la scheda lo dichiara.

**Aspetto.** Convenzioni dei portali: fascia blu, schede fotografiche con
prezzo grande e icone, scheda immobile a due colonne con contatti che seguono
lo scorrimento. Tema **chiaro / sistema / scuro** applicato prima del primo
disegno, menù hamburger sul telefono, selettore lingua.

**Dati.** 60 annunci di esempio in 18 località vere dell'isola, con prezzi al
metro quadro differenziati, tipologie del posto (ville, case indipendenti,
appartamenti, terreni edificabili) e tre agenzie. Tutti in tre lingue.

**Messa online.** `scripts/build.mjs` normalizza le variabili, applica le
migrazioni e compila; se qualcosa manca si ferma dicendo **quale variabile,
a che cosa serve e che cosa gli è arrivato davvero**. Riconosce sia i nomi
nostri (`DATABASE_URL`, `DIRECT_URL`) sia quelli dell'integrazione Neon-Vercel
(`POSTGRES_PRISMA_URL`, `DATABASE_URL_UNPOOLED`…), durante il build **e a
runtime**; le variabili vuote vengono scavalcate. L'indirizzo pubblico si
ricava da Vercel: `NEXT_PUBLIC_SITE_URL` serve solo con un dominio proprio.

---

## Da fare, in ordine

### 1. Finire la messa online — tocca all'utente

Il sito è pubblicato ma il **database è vuoto**: le migrazioni hanno creato le
tabelle, nessuno ci ha messo dentro gli annunci.

- **Database**: da Vercel, *Storage → Create Database → Neon*, regione
  Frankfurt. L'integrazione inietta le variabili da sé: niente da incollare.
  In alternativa, le due stringhe di Neon a mano.
- **Una variabile a mano**: `AUTH_SECRET` (`openssl rand -base64 32`).
- **Cancellare le variabili vuote** create nei tentativi precedenti.
- **Redeploy**: le variabili non entrano in un deploy già fatto.
- **Popolare**: `DATABASE_URL="…" DIRECT_URL="…" pnpm db:seed` dal computer,
  oppure — senza computer — impostare `SEED_TOKEN` e aprire
  `/api/admin/popola?chiave=…`, poi **togliere la variabile**: senza, quella
  route non esiste (404).

### 2. Decidere il nome

L'utente ha proposto **Aegean Nest**. Obiezione già sollevata, e non risolta:
Cefalonia è nel mar **Ionio**, l'Egeo è dall'altra parte della Grecia, e in
Grecia *Aegean* significa prima di tutto la compagnia aerea. Alternative:
**Ionian Nest**, **Nest Kefalonia**. Il nome sta in una sola variabile
(`NEXT_PUBLIC_SITE_NAME`) e il marchio in tre file — `src/components/Logo.tsx`,
`src/app/icon.svg`, `public/logo.svg`: cambiarlo è questione di minuti.

Per il logo c'era un'idea già abbozzata: un **nido** (due archi) che contiene
una casa in tre tratti, dove l'arco superiore del nido è anche la linea di
terra della casa.

### 3. Spegnere il doppio

Quando l'app è viva e popolata, la pagina su GitHub Pages diventa un **rimando**
all'indirizzo vero. Da lì in avanti esiste una sola interfaccia. Fino ad allora
la demo resta com'è: uno scatto fermo, **non va tenuta al passo con l'app**.

### 4. Poi, per valore decrescente

1. **Messaggi e notifiche** — oggi la richiesta di contatto finisce nel
   database e muore lì: nessuno riceve un avviso, e chi ha scritto non ha
   risposta. È il buco più grave.
2. **Valutazione immobile vera** — la pagina esiste ma non calcola niente. È
   l'amo per farsi dare immobili da vendere.
3. **Fotografie su spazio esterno** — su Vercel il disco è di sola lettura, e
   `/api/upload` risponde 501 con un messaggio esplicito. Serve S3 o simili.
4. **Invio email** — punto segnato in `src/app/api/richieste/route.ts`.
5. Moderazione per il ruolo `ADMIN`, antispam sui moduli, testi veri di privacy
   e termini, primi test su `lib/search.ts` e `lib/geo.ts`.

---

## Come si lavora qui

```bash
# database locale (nel contenitore della sessione)
su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /tmp/pgdata \
  -o '-p 5432 -k /tmp/pgrun -c listen_addresses=127.0.0.1' -l /tmp/pgdata/log start"

pnpm install && pnpm db:push && pnpm db:seed
pnpm build && pnpm start          # oppure pnpm dev
```

**Verificare col browser, non solo con il compilatore.** Playwright è
disponibile, il binario sta in `/opt/pw-browsers/chromium`. Gli ultimi difetti
veri — una funzione passata da componente server a client, e un'idratazione che
falliva perché Node e Chromium raggruppano diversamente i numeri di quattro
cifre — sono usciti solo aprendo la pagina.

**Il proxy della sessione blocca** `api.vercel.com`, `console.neon.tech`,
`*.vercel.app`, `*.github.io` e `picsum.photos`: il deploy lo fa l'utente, il
sito online non lo si può aprire da qui, e in locale le fotografie di esempio
non si vedono.

**Non duplicare.** Quello che l'app ha già non va riscritto nella demo statica.

# 🏝 Friends of Cefalonia

Landing informativa per chi visita Cefalonia, collegata al gruppo Facebook.
Raccoglie link e risorse verificate, spiega come comportarsi con le tartarughe
di Argostoli, e contiene un quiz sull'isola.

Rimanda a **Capra Ionia**, il portale sui terreni edificabili, per chi arriva
qui pensando di comprare.

**Stack**: React + TypeScript + Vite + Tailwind. La build produce un unico file
HTML autonomo, come per Capra Ionia.

## Struttura dei contenuti

Tutto il testo modificabile sta in tre file, senza toccare i componenti:

| File | Cosa contiene |
|---|---|
| `src/data/links.ts` | Le sezioni di risorse e i link, con la loro descrizione |
| `src/data/quiz.ts` | Le domande del quiz, la risposta esatta e la spiegazione |
| `src/data/site.ts` | URL del gruppo Facebook, di Capra Ionia, numero di iscritti |
| `src/data/cucina.ts` | Piatti, prodotti, la Robola e i consigli a tavola |

Aggiungere un link significa aggiungere una riga a `links.ts`. Aggiungere una
domanda, un blocco a `quiz.ts`.

## Fotografie e video

| Dove metti il file | Cosa succede |
|---|---|
| `foto/hero.jpg` | Diventa la fotografia d'apertura, ridotta a 2000 px |
| `foto/vini.jpg` | Apre il blocco sulla Robola, dentro «A tavola» |
| `foto/tartarughe.jpg` | Apre la sezione delle tartarughe |
| `foto/galleria/*.jpg` | Entrano nella galleria, ridotte e firmate |
| `public/video/tartarughe.mp4` | Compare nella sezione delle tartarughe |

Vale una regola sola: **le fotografie si caricano in `foto/`, come vengono dal
telefono.** Il resto lo fa la build.

L'apertura non porta il marchio stampato, perché la pagina glielo disegna già
sopra; le foto della galleria sì, perché escono dal sito. Se `foto/hero.jpg`
non c'è, resta l'apertura già pubblicata: non si finisce mai senza.

Le foto della galleria vanno messe **negli originali**, in `foto/galleria/`,
con qualsiasi nome e alla dimensione che hanno: quelle appena scaricate dal
telefono vanno bene. A ogni pubblicazione `scripts/build-gallery.mjs` le
raddrizza secondo l'EXIF, le porta al lato lungo di 1600 px, ne ricava una
miniatura e stampa su entrambe il marchio in basso a destra. Il risultato
finisce in `public/foto/galleria/`, che è generato e non va versionato:
togliendo una foto dagli originali sparisce anche dal sito.

Serve perché le foto dei telefoni pesano 2-5 MB l'una: pubblicate così com'erano
farebbero una pagina da decine di megabyte, letta quasi sempre da un telefono in
vacanza. Una foto tipica esce a 70-130 kB.

Le didascalie stanno in `foto/galleria/didascalie.json`, che associa il nome del
file al testo; servono anche a chi naviga con un lettore di schermo.

Finché una cartella è vuota la pagina non mostra buchi: la galleria sparisce, e
al posto del video resta una scena animata.

## Animazioni

Tartarughe e capre attraversano lo sfondo di alcune sezioni: tartarughe dove si
parla di mare, capre dove si parla di terra. Sono in `src/components/Fauna.tsx`,
disegnate a mano, e si muovono solo con `transform` e `opacity` — le due
proprietà che il browser affida alla scheda grafica.

Ogni strato si ferma quando esce dallo schermo, e tutto sparisce per chi ha
chiesto meno movimento nelle impostazioni del sistema. Sono decorazione: nessun
contenuto dipende da loro.

## Sviluppo

```bash
pnpm install
pnpm dev       # server locale
pnpm build     # produce dist/index.html
pnpm lint
```

## Pubblicazione

Il workflow in `.github/workflows/deploy.yml` compila a ogni push su `main` e
pubblica sul branch `gh-pages`, che GitHub Pages serve. Non serve configurare
nulla a mano: il primo push del branch attiva Pages da solo.

Sito: `https://<utente>.github.io/friends-of-cefalonia/`

## Dominio personalizzato e HTTPS

Il dominio sta in `public/CNAME`, una riga sola. Deve stare lì e non solo nelle
impostazioni di GitHub: Pages tiene il dominio come file `CNAME` sul branch
pubblicato, e il workflow riscrive quel branch da zero a ogni deploy. Senza
`public/CNAME` ogni push su `main` cancella il dominio, il certificato HTTPS
smette di essere emesso e il browser segnala «sito non sicuro».

Nel DNS del registrar servono, per il dominio `friendsofcefalonia.it`:

| Nome | Tipo | Valore |
|---|---|---|
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `www` | CNAME | `<utente>.github.io` |

Il valore del record `www` va scritto senza punto finale: i pannelli web dei
registrar lo trattano già come nome assoluto e il punto lo aggiungono da sé.
Serve scriverlo solo modificando a mano un file di zona in formato BIND. Il
file `public/CNAME`, invece, non porta mai il punto: contiene il dominio e
nient'altro.

Vanno tolti gli A record di parcheggio del registrar, altrimenti restano
insieme a quelli di GitHub e il certificato non viene emesso. Il record `www`
non va aggiunto anche fra le impostazioni di Pages: con l'apex configurato,
GitHub lo associa già da sé e rispondere «già registrato» è il comportamento
atteso, non un errore.

Dopo che il DNS si è propagato, in *Settings → Pages* il certificato viene
emesso in un tempo che va da qualche minuto a 24 ore; solo allora si può
spuntare **Enforce HTTPS**.

## Note sui contenuti

I link sono stati verificati alla scrittura, ma orari e tratte dei traghetti
cambiano di stagione: il testo lo dichiara in pagina, e vanno ricontrollati
periodicamente.

Non ci sono affiliazioni né commissioni: è dichiarato nel piè di pagina e va
mantenuto vero.

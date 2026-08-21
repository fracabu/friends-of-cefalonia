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

Aggiungere un link significa aggiungere una riga a `links.ts`. Aggiungere una
domanda, un blocco a `quiz.ts`.

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

## Note sui contenuti

I link sono stati verificati alla scrittura, ma orari e tratte dei traghetti
cambiano di stagione: il testo lo dichiara in pagina, e vanno ricontrollati
periodicamente.

Non ci sono affiliazioni né commissioni: è dichiarato nel piè di pagina e va
mantenuto vero.

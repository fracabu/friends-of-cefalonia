# Friends of Cefalonia

Landing informativa per chi visita Cefalonia, collegata al gruppo Facebook
omonimo. Raccoglie risorse verificate, spiega come comportarsi con le
tartarughe di Argostoli, e porta chi è interessato a comprare verso **Capra
Ionia**, il portale sui terreni edificabili. Il funnel è dichiarato in pagina,
non nascosto: va tenuto così.

Il README copre struttura dei file e comandi. Qui sta il contesto che dal
codice non si deduce.

## Dove vive il sito

Dominio: **https://friendsofcefalonia.it**

Aruba è il **registrar del dominio, non l'hosting**. Il DNS punta a GitHub
Pages, che serve il branch `gh-pages`. Non esiste nessun upload FTP e non c'è
niente da caricare a mano: il workflow `deploy.yml` compila a ogni push su
`main` e pubblica da solo.

Due trappole, entrambe già costate tempo:

- **Il `CNAME` sta in `public/`, mai su `gh-pages`.** Il workflow ricrea quel
  branch da un `git init` vuoto e lo force-pusha, quindi qualsiasi file
  aggiunto lì a mano sparisce al deploy successivo — dominio compreso. Vite
  copia `public/` in `dist/`, ed è così che il file sopravvive.
- **Il DNS del dominio nudo aveva un record A verso Aruba** (`62.149.128.40`)
  accanto ai quattro di GitHub Pages, che mandava circa una visita su cinque
  sulla pagina sbagliata. Va tenuto rimosso: servono solo i quattro
  `185.199.108–111.153`, più il CNAME `www` verso `<utente>.github.io`.

## Cosa non è automatizzabile

- **`GROUP_MEMBERS` in `src/data/site.ts` si aggiorna a mano.** Meta ha chiuso
  l'API dei gruppi il 22 aprile 2024, `member_count` compreso: non esiste modo
  lecito di leggerlo. Il prefisso `"oltre"` con una cifra tonda regge la
  crescita senza manutenzione.
- **I link a traghetti e voli vanno ricontrollati a stagione.** Orari e tratte
  cambiano; la pagina lo dichiara, il controllo resta umano.
- **Nessuna affiliazione, nessuna commissione.** È scritto nel piè di pagina e
  va mantenuto vero.

## Fotografie

`public/foto/hero.jpg` è l'apertura. Devono essere foto vostre: quelle prese
dal web sono quasi sempre coperte da copyright. Orizzontali, almeno 1600 px.
La `hero.jpg` attuale pesa 1 MB e non viene inlinata nel file singolo: resta un
asset a parte, e comprimerla gioverebbe a chi arriva in 4G.

## Aperto

- **Un form**, creato fuori da questo repo e non ancora integrato. GitHub Pages
  serve solo file statici e non può processare un POST: serve un endpoint
  esterno (Formspree, Web3Forms) oppure uno script sull'hosting Aruba, se il
  piano lo include.

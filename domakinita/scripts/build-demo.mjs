/*
 * Costruisce docs/index.html, la demo che GitHub Pages pubblica.
 *
 * La sorgente (demo/pagina.html) è un frammento: <title>, stili, marcatura e
 * script, senza involucro. Serve così all'anteprima su Claude, che la incapsula
 * da sé. Pages invece serve il file com'è, e un documento senza <!doctype>
 * manda il browser in quirks mode: da lì in poi i margini e le altezze in
 * percentuale non si comportano più come previsto.
 *
 * Questo script mette l'involucro: doctype, lingua, viewport, descrizione e
 * l'icona nella linguetta del browser.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const radice = join(dirname(fileURLToPath(import.meta.url)), '..')
const frammento = await readFile(join(radice, 'demo', 'pagina.html'), 'utf8')

const titolo = frammento.match(/<title>(.*?)<\/title>/)?.[1] ?? 'Domakinita'
const corpo = frammento.replace(/<title>.*?<\/title>\s*/, '')

/*
 * Il marchio come icona: la casa in tre tratti con la porta a forma di Pi.
 * L'SVG usa apici singoli e viene codificato: dentro un attributo HTML
 * delimitato da virgolette doppie, una virgoletta doppia nel dato chiude
 * l'attributo in anticipo e il resto finisce stampato in pagina.
 */
const svgIcona = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>",
  "<rect width='32' height='32' rx='7' fill='#1d63f0'/>",
  "<g fill='none' stroke='#fff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'>",
  "<path d='M6.2 14.6 16 7l9.8 7.6'/><path d='M8.6 13.6v11.6h14.8V13.6'/><path d='M13.4 25.2v-6.4h5.2v6.4'/>",
  '</g></svg>',
].join('')
const icona = encodeURIComponent(svgIcona)

const descrizione =
  'Demo del portale immobiliare per Cefalonia: sessanta annunci, filtri completi e ricerca per area disegnata a mano sulla mappa.'

const pagina = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titolo} — demo</title>
<meta name="description" content="${descrizione}">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="${titolo}">
<meta property="og:description" content="${descrizione}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,${icona}">
</head>
<body>
${corpo}
</body>
</html>
`

await writeFile(join(radice, 'docs', 'index.html'), pagina)
console.log(`docs/index.html scritto: ${Math.round(pagina.length / 1024)} kB`)

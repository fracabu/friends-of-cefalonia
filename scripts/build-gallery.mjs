/**
 * Prepara la galleria a ogni build.
 *
 * Legge gli originali da `foto/galleria/`, e per ognuno scrive in
 * `public/foto/galleria/` due file: la versione grande e la miniatura, tutte
 * e due ridotte, ricompresse e firmate col marchio. Poi genera l'elenco in
 * `src/data/gallery.ts`, che la pagina importa.
 *
 * Serve a una cosa sola: che caricare una foto sia tutto quello che c'è da
 * fare. Gli originali restano intatti nel repository, e nulla di ciò che
 * viene generato va versionato — si rifà da sé al push successivo.
 *
 * Le foto dei telefoni pesano 2-5 MB l'una: pubblicarle così com'erano
 * significherebbe una pagina da decine di megabyte su una connessione in
 * vacanza.
 */
import { mkdir, readdir, writeFile, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ORIGINALI = "foto/galleria";
const ORIGINALE_PAGINA = "foto";            // hero.jpg, cucina.jpg, ... accanto a galleria/
const USCITA_PAGINA = "public/foto";
const USCITA = "public/foto/galleria";
const MANIFESTO = "src/data/gallery.ts";
const DIDASCALIE = path.join(ORIGINALI, "didascalie.json");

const LARGA = 1600;   // il lato lungo della versione grande
const PAGINA_LARGA = 2000;    // le foto di pagina si vedono più grandi di quelle in griglia
const MINIATURA = 700;
const ESTENSIONI = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif"]);

/* Il marchio, ridisegnato qui perché lo script non può importare il TSX.
   Se cambia il logo in App.tsx va cambiato anche qui: è l'unico punto in cui
   il disegno è ripetuto, ed è a ragion veduta — il resto della pagina lo
   compone il browser, questo lo compone sharp. */
function filigrana(larghezza) {
  const w = Math.round(larghezza * 0.26);
  const h = Math.round(w * 0.42);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 260 110">
    <defs><filter id="o" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#000" flood-opacity=".55"/>
    </filter></defs>
    <g filter="url(#o)" fill="none" stroke="#fff" stroke-opacity=".92"
       transform="translate(4,20) scale(1.05)">
      <ellipse cx="32" cy="34" rx="16" ry="14" stroke-width="2.6"/>
      <path d="M32 20.5 V47.5 M18.5 29 H45.5 M20 40 H44" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
      <path d="M32 21 C27.5 19, 26 14, 28.5 11 C31.5 8, 35.5 9, 36.5 12.5 C37.5 16, 35.5 19.5, 32 21 Z"
            stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="34" cy="13.5" r="1.5" fill="#fff" stroke="none"/>
      <path d="M18 27 C12 21, 7 21, 5 25 C7 29, 13 30, 18 29" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M46 27 C52 21, 57 21, 59 25 C57 29, 51 30, 46 29" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M21 44 C17 48, 15 52, 17 55 C21 54, 24 50, 25 46" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M43 44 C47 48, 49 52, 47 55 C43 54, 40 50, 39 46" stroke-width="2.6" stroke-linejoin="round"/>
    </g>
    <g filter="url(#o)" fill="#fff" fill-opacity=".92" font-family="sans-serif">
      <text x="78" y="52" font-size="17" letter-spacing="3.4">FRIENDS OF</text>
      <text x="78" y="76" font-size="23" letter-spacing="1.8" font-weight="600">CEFALONIA</text>
    </g>
  </svg>`);
}

/* Il marchio senza scritte: rete di sicurezza se il sistema su cui gira la
   build non ha font installati e librsvg non sa disegnare il testo. */
function filigranaSoloMarchio(larghezza) {
  const w = Math.round(larghezza * 0.13);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 64 64">
    <g fill="none" stroke="#fff" stroke-opacity=".9">
      <ellipse cx="32" cy="34" rx="16" ry="14" stroke-width="2.6"/>
      <path d="M32 20.5 V47.5 M18.5 29 H45.5 M20 40 H44" stroke-width="1.6" opacity=".55"/>
      <path d="M32 21 C27.5 19, 26 14, 28.5 11 C31.5 8, 35.5 9, 36.5 12.5 C37.5 16, 35.5 19.5, 32 21 Z" stroke-width="2.6"/>
      <path d="M18 27 C12 21, 7 21, 5 25 C7 29, 13 30, 18 29" stroke-width="2.6"/>
      <path d="M46 27 C52 21, 57 21, 59 25 C57 29, 51 30, 46 29" stroke-width="2.6"/>
    </g></svg>`);
}

async function marchioPer(larghezza) {
  try {
    return await sharp(filigrana(larghezza)).png().toBuffer();
  } catch {
    return await sharp(filigranaSoloMarchio(larghezza)).png().toBuffer();
  }
}

const slug = (nome) =>
  path.parse(nome).name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "foto";

/**
 * Le fotografie di pagina: quelle che stanno dentro `foto/`, accanto a
 * `galleria/`. Il nome del file decide dove finiscono — `hero.jpg` in
 * apertura, `cucina.jpg` nella sezione della cucina, e così via, secondo i
 * percorsi scritti in `src/data/site.ts`.
 *
 * Non portano il marchio stampato: queste stanno dentro una pagina che è già
 * marchiata da sé, mentre quelle della galleria escono dal sito e vanno
 * firmate. Qui si tratta solo di ridurle, perché uno scatto da telefono pesa
 * 2-5 MB e chi legge è quasi sempre in vacanza, con la rete di un'isola.
 */
async function fotoDiPagina() {
  const file = (await readdir(ORIGINALE_PAGINA))
    .filter((f) => ESTENSIONI.has(path.extname(f).toLowerCase()));

  /* Le uscite si rifanno da zero, così togliere un originale toglie davvero
     la fotografia dal sito invece di lasciarla pubblicata per sempre. */
  for (const vecchia of await readdir(USCITA_PAGINA)) {
    if (vecchia.endsWith(".jpg")) await rm(path.join(USCITA_PAGINA, vecchia), { force: true });
  }

  for (const f of file) {
    const nome = slug(f);
    try {
      const info = await sharp(path.join(ORIGINALE_PAGINA, f))
        .rotate()
        .resize({ width: PAGINA_LARGA, height: PAGINA_LARGA, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 84, progressive: true, mozjpeg: true })
        .toFile(path.join(USCITA_PAGINA, `${nome}.jpg`));
      console.log(`  pagina: ${f} → ${nome}.jpg (${info.width}×${info.height})`);
    } catch (e) {
      console.warn(`  ${f} saltata: ${e.message}`);
    }
  }
}

async function main() {
  await fotoDiPagina();

  if (!existsSync(ORIGINALI)) {
    await scriviManifesto([]);
    console.log(`Nessuna cartella ${ORIGINALI}/: galleria vuota.`);
    return;
  }

  const file = (await readdir(ORIGINALI))
    .filter((f) => ESTENSIONI.has(path.extname(f).toLowerCase()))
    .sort();

  /* La cartella d'uscita si rifà da zero: così una foto tolta dagli originali
     sparisce davvero, invece di restare pubblicata per sempre. */
  await rm(USCITA, { recursive: true, force: true });
  await mkdir(USCITA, { recursive: true });

  let didascalie = {};
  if (existsSync(DIDASCALIE)) {
    try { didascalie = JSON.parse(await readFile(DIDASCALIE, "utf8")); }
    catch (e) { console.warn(`didascalie.json illeggibile, ignorato: ${e.message}`); }
  }

  const usati = new Set();
  const voci = [];

  for (const f of file) {
    let nome = slug(f);
    while (usati.has(nome)) nome += "-1";
    usati.add(nome);

    const sorgente = path.join(ORIGINALI, f);
    try {
      /* `rotate()` senza argomenti raddrizza secondo l'EXIF: senza, metà
         delle foto scattate col telefono uscirebbe coricata. */
      const base = sharp(sorgente).rotate();
      const meta = await base.metadata();

      const grande = await base
        .clone()
        .resize({ width: LARGA, height: LARGA, fit: "inside", withoutEnlargement: true })
        .toBuffer();
      const dimGrande = await sharp(grande).metadata();
      const marchio = await marchioPer(dimGrande.width);
      const dimMarchio = await sharp(marchio).metadata();
      const margine = Math.round(dimGrande.width * 0.028);

      await sharp(grande)
        .composite([{ input: marchio, top: dimGrande.height - dimMarchio.height - margine, left: dimGrande.width - dimMarchio.width - margine }])
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(path.join(USCITA, `${nome}.jpg`));

      const mini = await sharp(grande)
        .resize({ width: MINIATURA, height: MINIATURA, fit: "inside", withoutEnlargement: true })
        .toBuffer();
      const dimMini = await sharp(mini).metadata();
      const marchioMini = await marchioPer(dimMini.width);
      const dimMarchioMini = await sharp(marchioMini).metadata();
      const margineMini = Math.round(dimMini.width * 0.028);

      await sharp(mini)
        .composite([{ input: marchioMini, top: dimMini.height - dimMarchioMini.height - margineMini, left: dimMini.width - dimMarchioMini.width - margineMini }])
        .jpeg({ quality: 78, progressive: true, mozjpeg: true })
        .toFile(path.join(USCITA, `${nome}-mini.jpg`));

      voci.push({
        file: `foto/galleria/${nome}.jpg`,
        mini: `foto/galleria/${nome}-mini.jpg`,
        w: dimGrande.width,
        h: dimGrande.height,
        alt: didascalie[f] || didascalie[nome] || "",
      });
      console.log(`  ${f} → ${nome}.jpg (${meta.width}×${meta.height} → ${dimGrande.width}×${dimGrande.height})`);
    } catch (e) {
      /* Un file illeggibile non deve far fallire la pubblicazione di tutti
         gli altri: si salta, e lo si dice. */
      console.warn(`  ${f} saltata: ${e.message}`);
    }
  }

  await scriviManifesto(voci);
  console.log(`Galleria: ${voci.length} foto su ${file.length} file.`);
}

async function scriviManifesto(voci) {
  await mkdir(path.dirname(MANIFESTO), { recursive: true });
  await writeFile(MANIFESTO,
`/* GENERATO da scripts/build-gallery.mjs — non modificare a mano.
   Le foto si aggiungono mettendo i file in foto/galleria/. */
export type Shot = { file: string; mini: string; w: number; h: number; alt: string };

export const GALLERY: Shot[] = ${JSON.stringify(voci, null, 2)};
`);
}

main().catch((e) => { console.error(e); process.exit(1); });

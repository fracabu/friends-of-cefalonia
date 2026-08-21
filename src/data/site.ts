/** Riferimenti esterni del progetto, in un posto solo. */
export const FACEBOOK_URL = "https://www.facebook.com/share/g/1T2jFjmEmb/";
export const CAPRA_IONIA_URL = "https://fracabu.github.io/capra-ionia/";
/**
 * Iscritti al gruppo.
 *
 * Va aggiornato a mano: Meta ha rimosso l'API dei gruppi il 22 aprile 2024,
 * compreso il campo con il numero di membri, quindi non esiste modo lecito di
 * leggerlo in automatico. Si cambia qui e il sito si aggiorna al primo push.
 *
 * Se preferisci non pensarci più, usa una formula che invecchia bene:
 * porta GROUP_MEMBERS a "33.000" e GROUP_MEMBERS_PREFIX a "oltre" — resterà
 * vera anche quando sarete quarantamila.
 */
export const GROUP_MEMBERS = "33.345";
export const GROUP_MEMBERS_PREFIX = "";

/** Da quanti anni il fondatore frequenta l'isola: è da lì che nasce il gruppo. */
export const FOUNDER_YEARS = "trentacinque";

/** Nome del fondatore, se vuole comparire. Vuoto = si parla di lui senza nominarlo. */
export const FOUNDER_NAME = "";

/**
 * Fotografia di apertura. Metti il file in `public/foto/` e scrivi qui il
 * percorso, per esempio "foto/hero.jpg". Finché è vuoto la pagina mostra un
 * riquadro grafico al suo posto, che non finge di essere una fotografia.
 *
 * Usa una foto vostra: orizzontale, almeno 1600 px di larghezza. Le immagini
 * prese dal web sono quasi sempre protette da copyright.
 */
export const HERO_PHOTO = "";
export const HERO_PHOTO_CREDIT = "";

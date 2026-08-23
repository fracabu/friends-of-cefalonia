/** Riferimenti esterni del progetto, in un posto solo. */
export const FACEBOOK_URL = "https://www.facebook.com/share/g/1T2jFjmEmb/";
/**
 * Portale immobiliare, ancora in costruzione: non è pubblicato e dal sito non
 * ci sono link che ci portino. L'indirizzo resta qui perché il giorno in cui
 * apre basta rimetterlo nei pulsanti della sezione «Terreni».
 */
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
export const GROUP_MEMBERS = "33.000";
export const GROUP_MEMBERS_PREFIX = "oltre";

/** Da quanti anni il fondatore frequenta l'isola: è da lì che nasce il gruppo. */
export const FOUNDER_YEARS = "trentacinque";

/** Nome del fondatore, se vuole comparire. Vuoto = si parla di lui senza nominarlo. */
export const FOUNDER_NAME = "";

/**
 * Fotografia di apertura: il file `public/foto/hero.jpg`.
 *
 * Finché quel file non c'è — o se qui il percorso resta vuoto — la pagina
 * mostra un riquadro grafico al suo posto, che non finge di essere una
 * fotografia. Caricare la foto con quel nome basta a farla comparire, senza
 * toccare il codice; per usare un altro nome, cambiare il percorso qui.
 *
 * Usa una foto vostra: orizzontale, almeno 1600 px di larghezza. Le immagini
 * prese dal web sono quasi sempre protette da copyright.
 */
export const HERO_PHOTO = "foto/hero.jpg";
export const HERO_PHOTO_CREDIT = "";

/**
 * Video della sezione tartarughe: il file `public/video/tartarughe.mp4`.
 *
 * Come per la fotografia, il percorso può stare qui prima che il file
 * esista: finché manca, la pagina mostra al suo posto una scena animata
 * invece di un riquadro rotto. Tenerlo corto — dieci, quindici secondi in
 * ciclo — perché parte da solo e chi guarda spesso è in vacanza, con la
 * connessione di un'isola.
 */
export const VIDEO_TARTARUGHE = "video/tartarughe.mp4";
export const VIDEO_TARTARUGHE_POSTER = "";
export const VIDEO_TARTARUGHE_CREDIT = "";

/**
 * Fotografie delle sezioni: i file stanno in `foto/`, con questi nomi, e la
 * build ne pubblica la versione ridotta. Come per l'apertura, il percorso può
 * essere scritto prima che il file esista: finché manca, la sezione si limita
 * a non mostrarla.
 */
export const FOTO_VINI = "foto/vini.jpg";
export const FOTO_TARTARUGHE = "foto/tartarughe.jpg";
export const FOTO_VINI_CREDITO = "";
export const FOTO_TARTARUGHE_CREDITO = "";

/**
 * Casella su cui arrivano le richieste di chi ci scrive dal sito.
 *
 * Compare nel piè di pagina ed è la destinazione del modulo «Scrivici».
 * Cambiarlo qui basta: non è ripetuto da nessun'altra parte.
 */
export const EMAIL_CONTATTO = "info@pianzacefalonia.it";

/**
 * Chiave del servizio che inoltra il modulo sulla casella qui sopra.
 *
 * Il sito è statico — su GitHub Pages non gira codice nostro — quindi da solo
 * non può spedire posta: serve qualcuno che riceva il modulo e lo giri via
 * email. Web3Forms fa questo e basta questo, gratis fino a 250 messaggi al
 * mese, senza account a pagamento e senza mettere pubblicità nelle mail.
 *
 * Come ottenerla, una volta sola:
 *   1. https://web3forms.com  →  incolla EMAIL_CONTATTO nel campo
 *   2. arriva una mail di conferma con dentro la chiave (access key)
 *   3. incolla la chiave qui sotto e fai il deploy
 *
 * La chiave non è un segreto: sta nel codice della pagina, è pensata per
 * stare lì. Serve solo a dire al servizio su quale casella inoltrare, e non
 * dà accesso a nulla. Per questo non ha senso metterla in una variabile
 * d'ambiente.
 *
 * Finché resta vuota il modulo non viene mostrato: al suo posto compare il
 * pulsante che apre la posta del visitatore, così la pagina non pubblica mai
 * un modulo che non spedisce da nessuna parte.
 */
export const WEB3FORMS_KEY = "";

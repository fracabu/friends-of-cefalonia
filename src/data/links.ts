/**
 * Risorse esterne. Ogni voce è stata verificata: niente link inventati, e
 * dove l'informazione cambia (orari, tratte) il testo lo dichiara.
 */
export type Link = { name: string; url: string; note: string };
export type Section = { id: string; icon: string; title: string; intro: string; links: Link[] };

export const SECTIONS: Section[] = [
  {
    id: "arrivare",
    icon: "⛴",
    title: "Arrivare dall'Italia",
    intro:
      "Non c'è un modo solo, e quello più comodo dipende da dove parti e se porti l'auto in Grecia.",
    links: [
      {
        name: "Ferryhopper",
        url: "https://www.ferryhopper.com/it/traghetti/grecia/cefalonia",
        note: "Confronta tutte le tratte per Cefalonia in un colpo solo. Il punto di partenza più semplice.",
      },
      {
        name: "Levante Ferries — Kyllini › Poros",
        url: "https://www.levanteferries.com/en/routes/kyllini-poros/",
        note: "La traversata più breve per l'isola: circa 1 ora e 30 dal Peloponneso.",
      },
      {
        name: "Ferries.gr — Patrasso e Kyllini",
        url: "https://www.ferries.gr/en/ferry-routes/kilinipatras-cefalonia/",
        note: "Da Patrasso a Sami c'è una corsa al giorno, circa 3 ore e mezza.",
      },
      {
        name: "Anek Lines Italia",
        url: "https://anekitalia.com/it/traghetti-grecia/",
        note: "Traghetti dall'Italia: da Ancona si arriva a Igoumenitsa in 17–18 ore, a Patrasso in circa 22.",
      },
      {
        name: "Aeroporto di Cefalonia (EFL)",
        url: "https://www.efl-airport.gr/en/flight-list",
        note: "Arrivi e partenze in tempo reale. D'estate ci sono voli diretti dall'Italia, d'inverno si passa da Atene.",
      },
    ],
  },
  {
    id: "tartarughe",
    icon: "🐢",
    title: "Le tartarughe di Argostoli",
    intro:
      "Nel porto di Argostoli e nella laguna di Koutavos vivono tartarughe marine Caretta caretta. Vederle è una delle esperienze che segnano una vacanza qui — ma c'è un modo giusto e uno sbagliato di starci vicino.",
    links: [
      {
        name: "Wildlife Sense",
        url: "https://wildlifesense.com/",
        note: "L'organizzazione che le studia e le protegge. Monitora il porto ogni giorno e in dieci anni ha identificato oltre 600 esemplari. Accoglie volontari.",
      },
      {
        name: "Diventare volontario",
        url: "https://wildlifesense.com/en/volunteer/",
        note: "Programmi di volontariato sul campo: monitoraggio delle spiagge, pulizia, protezione dei nidi.",
      },
    ],
  },
  {
    id: "natura",
    icon: "⛰",
    title: "Natura e luoghi",
    intro:
      "Cefalonia è la più grande delle Ionie e la più varia: il monte più alto dell'arcipelago, grotte, spiagge che finiscono su tutte le cartoline.",
    links: [
      {
        name: "Parco Nazionale del Monte Ainos",
        url: "https://www.ainosnp.gr/en/",
        note: "1.628 metri, la vetta più alta delle Ionie. Parco nazionale dal 1962 e area Natura 2000: ci cresce l'abete di Cefalonia, e nei boschi vivono cavallini semi-selvatici.",
      },
      {
        name: "Comune di Argostoli — turismo",
        url: "https://www.argostoli.gov.gr/",
        note: "Informazioni ufficiali del comune capoluogo.",
      },
    ],
  },
  {
    id: "pratico",
    icon: "🛟",
    title: "Numeri e cose pratiche",
    intro:
      "Le informazioni che cerchi di fretta, quando serve. Il numero unico di emergenza in Grecia è il 112, lo stesso di tutta l'Unione europea, e risponde anche in inglese.",
    links: [
      {
        name: "112 — Emergenze",
        url: "tel:112",
        note: "Numero unico europeo, valido in Grecia. Ambulanza, polizia, vigili del fuoco, soccorso in mare.",
      },
      {
        name: "Ambasciata d'Italia ad Atene",
        url: "https://ambatene.esteri.it/it/",
        note: "Assistenza consolare per i cittadini italiani in Grecia. Utile salvarne il contatto prima di partire.",
      },
      {
        name: "Viaggiare Sicuri — Grecia",
        url: "https://www.viaggiaresicuri.it/find-country/country/GRC",
        note: "La scheda ufficiale della Farnesina: documenti, sanità, avvisi.",
      },
    ],
  },
];

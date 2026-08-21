/**
 * Quiz sull'isola. Ogni risposta si appoggia a un fatto verificato, e la
 * spiegazione lo racconta: chi sbaglia impara qualcosa, chi indovina scopre
 * il perché. Niente domande a trabocchetto.
 */
export type Question = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

export const QUESTIONS: Question[] = [
  {
    q: "Qual è il capoluogo di Cefalonia?",
    options: ["Lixouri", "Argostoli", "Sami"],
    answer: 1,
    why: "Argostoli, sul golfo omonimo. Lixouri è la seconda città, sulla penisola di Paliki, collegata da un traghetto che attraversa il golfo. Sami è il porto verso l'Italia e la terraferma.",
  },
  {
    q: "Che tartarughe vivono nel porto di Argostoli?",
    options: ["Caretta caretta", "Tartarughe verdi", "Tartarughe liuto"],
    answer: 0,
    why: "Sono quasi tutte Caretta caretta, con qualche rara tartaruga verde giovane. Wildlife Sense ne ha identificate oltre 600 nel golfo in dieci anni di monitoraggio.",
  },
  {
    q: "Puoi dare da mangiare alle tartarughe del porto?",
    options: [
      "Sì, se è pesce fresco",
      "No, ne altera il comportamento naturale",
      "Solo insieme ai pescatori",
    ],
    answer: 1,
    why: "È la cosa più importante di questa pagina. Nutrirle le abitua a cercare cibo dalle barche invece che in mare, cambiando il loro comportamento naturale e tenendole in una zona trafficata. Guardale, fotografale, non darle da mangiare.",
  },
  {
    q: "Che evento ha ridisegnato i paesi dell'isola nel Novecento?",
    options: [
      "Il terremoto del 1953",
      "Un incendio negli anni Settanta",
      "Un'alluvione nel 1962",
    ],
    answer: 0,
    why: "Il terremoto del 1953 rase al suolo gran parte dell'isola. Per questo molti paesi hanno case ricostruite e non centri storici antichi, e in alcuni posti — come la vecchia Valsamata — si vedono ancora le rovine.",
  },
  {
    q: "La Robola è…",
    options: [
      "Un vitigno bianco della valle di Omala",
      "Una danza tradizionale",
      "Un formaggio di capra locale",
    ],
    answer: 0,
    why: "Un'uva bianca che cresce sulle terrazze calcaree alle pendici del monte Ainos, nella valle di Omala. La cooperativa dei produttori sta a 410 metri di quota, poco sotto il monastero di Agios Gerasimos.",
  },
  {
    q: "Chi è Agios Gerasimos per l'isola?",
    options: ["Un antico re", "Il santo patrono", "Un pirata leggendario"],
    answer: 1,
    why: "Il patrono di Cefalonia. Il suo monastero, nella valle di Omala, è il luogo di pellegrinaggio più importante dell'isola.",
  },
  {
    q: "Perché Chavriata è chiamata «il balcone dello Ionio»?",
    options: [
      "Perché ha il campanile più alto",
      "Perché da lì si vedono insieme la piana e il mare",
      "Perché ci si affacciava per avvistare i pirati",
    ],
    answer: 1,
    why: "Sta in cima a una collina della penisola di Paliki, a 8 km da Lixouri, e domina insieme la campagna coltivata e il mare. La sua chiesa, Panagia Chavriata, è del Cinquecento.",
  },
  {
    q: "Cos'è l'AFM, se pensi di comprare casa in Grecia?",
    options: [
      "Il codice fiscale greco",
      "Un permesso di soggiorno",
      "La tassa sull'acquisto",
    ],
    answer: 0,
    why: "Il codice fiscale greco: nove cifre, gratuito, rilasciato dall'Agenzia delle entrate. È il primo documento obbligatorio, senza il quale non si firma nessun rogito.",
  },
];

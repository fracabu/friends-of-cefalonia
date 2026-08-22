/**
 * Cosa si mangia e cosa si beve a Cefalonia.
 *
 * Nessun nome di taverna e nessun indirizzo: la pagina promette che niente qui
 * è sponsorizzato, e l'unico modo di mantenerla è non consigliare locali. I
 * piatti e i prodotti invece si possono nominare — non pagano nessuno per
 * comparire, e chi arriva sa cosa cercare da sé.
 *
 * Si modifica qui: aggiungere un piatto significa aggiungere un blocco.
 */

export type Voce = { nome: string; greco?: string; testo: string };

export const PIATTI: Voce[] = [
  {
    nome: "Kreatopita",
    greco: "κρεατόπιτα",
    testo:
      "La torta salata di carne, il piatto dell'isola. Carne mista tritata con riso, aglio, cipolla e un accenno di cannella e pepe, chiusa nella pasta. Ogni famiglia ha la sua versione, e alle feste di paese è la teglia che si svuota per prima.",
  },
  {
    nome: "Aliada",
    greco: "αλιάδα",
    testo:
      "Purè di patate e aglio, servito col baccalà fritto. L'aglio non è un accento: è l'ingrediente. Va affrontata sapendolo, e vale la pena affrontarla.",
  },
  {
    nome: "Riganada",
    greco: "ριγανάδα",
    testo:
      "Pane raffermo bagnato, pomodoro, origano, olio, a volte feta sopra. È la cosa più semplice della tavola e una delle più buone: nasce per non buttare via il pane.",
  },
  {
    nome: "Sofigado",
    greco: "σοφιγάδο",
    testo:
      "Spezzatino di manzo cotto piano con molto aglio e verdure, finché la carne non si taglia col cucchiaio. Piatto da pranzo lungo, più d'inverno che d'agosto.",
  },
  {
    nome: "Pesce del giorno",
    testo:
      "Si ordina chiedendo cosa c'è oggi, non leggendo il menù. Il pesce fresco si paga al chilo e si sceglie guardandolo: farsi dire il prezzo prima di dire di sì è normale, non scortese.",
  },
];

export const PRODOTTI: Voce[] = [
  {
    nome: "Miele di timo",
    testo:
      "Dalle montagne dell'isola, scuro e forte. Regge il viaggio meglio di qualsiasi altra cosa comprata qui.",
  },
  {
    nome: "Olio d'oliva",
    testo:
      "Gli uliveti sono ovunque, molti vecchissimi. Comprarlo dai produttori invece che al supermercato cambia il prezzo poco e il contenuto molto.",
  },
  {
    nome: "Mandolato e mandole",
    greco: "μαντολάτο",
    testo:
      "Torrone morbido con mandorle, e mandorle caramellate. Dolci ionici, si trovano in ogni panetteria e si portano a casa senza rompersi.",
  },
  {
    nome: "Pastelli",
    greco: "παστέλι",
    testo: "Sesamo e miele in una barretta dura. Costa poco, dura settimane, e riempie una borsa da spiaggia meglio di una merendina.",
  },
  {
    nome: "Formaggi di capra e pecora",
    testo:
      "Le capre sull'isola sono più delle persone, e si vedono. I formaggi freschi vanno mangiati lì; quelli stagionati viaggiano.",
  },
];

/** Il vino ha un blocco suo: è la cosa che l'isola esporta col proprio nome. */
export const VINO = {
  titolo: "La Robola",
  greco: "Ρομπόλα",
  testo:
    "Il vino bianco di Cefalonia, DOP, da un'uva che cresce quasi solo qui: vigne basse sui fianchi calcarei dell'Enos, spesso sopra i cinquecento metri, su un terreno che sembra fatto di pietra. Ne esce un bianco secco, teso, con quel fondo minerale che la pietra spiega da sola.",
  testo2:
    "Si beve giovane e fresco, e sull'isola costa quello che dovrebbe costare. Nella valle di Omala, verso l'interno, c'è la cooperativa dei produttori: la strada per arrivarci vale il viaggio a prescindere dal vino.",
  nota:
    "Sull'isola si fanno anche rossi e passiti — Mavrodaphne e Moscato — ma è la Robola quella che porta fuori il nome di Cefalonia.",
};

export const CONSIGLI: string[] = [
  "Si cena tardi. Alle otto le taverne sono vuote e i greci arrivano dalle nove in poi: mangiare presto significa mangiare da soli.",
  "Diffidare di chi ti invita a entrare dalla strada, e dei menù plastificati con le fotografie dei piatti in sei lingue. Le taverne dove si mangia meglio non hanno bisogno di fermarti.",
  "Chiedere «τι έχετε σήμερα;» — ti échete símera, cosa avete oggi. I piatti del giorno spesso non sono scritti da nessuna parte, e sono quelli buoni.",
  "Il pane e il coperto si pagano, ed è normale. La mancia si lascia arrotondando, non calcolando una percentuale.",
  "In agosto conviene prenotare, anche in un paese piccolo. Fuori stagione succede il contrario: molte taverne chiudono, e conviene chiedere prima di mettersi in strada.",
  "Le porzioni sono grandi e si condividono: ordinare tre o quattro piatti in due e metterli in mezzo è il modo giusto, non un ripiego.",
];

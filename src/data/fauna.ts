/**
 * La fauna dell'isola.
 *
 * Le tartarughe hanno il blocco principale perché sono la ragione per cui
 * questa pagina esiste, e perché sono le uniche con cui un visitatore può
 * fare danno senza accorgersene. Le altre specie stanno in fondo, brevi:
 * servono a far alzare gli occhi, non a fare da manuale.
 *
 * Tutto quello che è scritto qui va confermato a Wildlife Sense prima di
 * essere ampliato: sono loro che stanno nel porto ogni giorno.
 */

export type Specie = { nome: string; latino?: string; testo: string };

export const TARTARUGHE = {
  titolo: "Le Caretta caretta di Argostoli",
  latino: "Caretta caretta",
  apertura:
    "Nel porto di Argostoli le tartarughe marine si avvicinano alle banchine, soprattutto la mattina presto dove i pescatori puliscono il pescato. Vederle a pochi metri, dal molo, senza barca e senza maschera, è l'esperienza che quasi tutti si portano a casa da quest'isola.",
  seconda:
    "Sono quasi tutte Caretta caretta adulte, con qualche rara tartaruga verde giovane. Wildlife Sense, l'organizzazione che le studia qui, ne ha identificate oltre seicento nel golfo in dieci anni di monitoraggio: molte tornano ogni anno, e si riconoscono una per una dal disegno delle squame sulla testa.",
};

/** La regola sta da sola perché è l'unica cosa di questa pagina che, se
    ignorata, fa un danno reale a qualcosa di vivo. */
export const REGOLE: string[] = [
  "Non darle da mangiare. È la cosa più importante scritta in questa pagina: nutrirle le abitua a cercare cibo dalle barche invece che in mare, le trattiene in una zona trafficata e cambia il loro comportamento naturale.",
  "Non toccarle e non nuotarci insieme. Sono animali selvatici e protetti, non un'attrazione: si guardano dal molo.",
  "Niente flash, e di notte niente luci sulle spiagge di nidificazione. La luce disorienta i piccoli appena nati, che cercano il mare seguendo il chiarore dell'orizzonte.",
  "Se ne trovi una ferita, impigliata o arenata, non spostarla: chiama Wildlife Sense e resta lì finché non arrivano.",
];

export const STAGIONE =
  "Le femmine risalgono sulle spiagge a deporre fra fine maggio e agosto, e i piccoli emergono da luglio a ottobre. I nidi sono segnalati con gabbie o paletti: sono lì per proteggerli, non per delimitare uno spazio libero.";

export const ALTRE: Specie[] = [
  {
    nome: "I cavalli dell'Enos",
    testo:
      "Sul massiccio dell'Enos vive una piccola popolazione di cavalli semi-selvatici, discendenti di animali domestici lasciati liberi decenni fa. Non si vedono a comando: si sale per il parco nazionale e, qualche volta, ci sono.",
  },
  {
    nome: "L'abete di Cefalonia",
    latino: "Abies cephalonica",
    testo:
      "Endemico, cresce fitto e scurissimo sulle pendici dell'Enos — al punto che i veneziani chiamavano la montagna Monte Nero. Il parco nazionale nasce per proteggere questo bosco, il primo istituito in Grecia insieme all'Olimpo.",
  },
  {
    nome: "La foca monaca",
    latino: "Monachus monachus",
    testo:
      "Una delle specie più rare del Mediterraneo, presente nelle grotte marine dello Ionio. Avvistarla è questione di fortuna e va lasciata così: se capita, si guarda da lontano e non si entra nella grotta.",
  },
  {
    nome: "Le capre",
    testo:
      "Ovunque, sui muretti e in mezzo alla strada, e più numerose delle persone. Spiegano da sole due cose dell'isola: perché i formaggi sono quelli che sono, e perché guidare di notte richiede attenzione.",
  },
];

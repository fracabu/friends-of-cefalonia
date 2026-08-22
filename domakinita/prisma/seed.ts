import { PrismaClient, type ContractType, type PropertyType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

/*
 * Dati di esempio per Cefalonia.
 *
 * Le localita sono quelle vere, con le coordinate del centro abitato; gli
 * annunci si sparpagliano attorno, cosi la mappa non mostra tutti i segnaposti
 * sovrapposti. I prezzi al metro quadro seguono le differenze reali fra
 * l'isola nord, quella turistica e l'entroterra: Fiskardo e Assos costano piu
 * del doppio di Peratata.
 */

type Localita = {
  nome: string
  lat: number
  lng: number
  cap: string
  /** Prezzo di riferimento al metro quadro, in vendita. */
  base: number
  zone: string[]
}

const LOCALITA: Localita[] = [
  { nome: 'Argostoli', lat: 38.1751, lng: 20.4885, cap: '28100', base: 2300, zone: ['Centro', 'Lassi', 'Fanari', 'Drapano'] },
  { nome: 'Lassi', lat: 38.1652, lng: 20.4652, cap: '28100', base: 2600, zone: ['Makris Gialos', 'Platys Gialos'] },
  { nome: 'Lixouri', lat: 38.2013, lng: 20.4372, cap: '28200', base: 1800, zone: ['Lungomare', 'Lepeda'] },
  { nome: 'Sami', lat: 38.2503, lng: 20.6470, cap: '28080', base: 2000, zone: ['Porto', 'Karavomylos', 'Antisamos'] },
  { nome: 'Agia Efimia', lat: 38.3010, lng: 20.6003, cap: '28081', base: 2600, zone: ['Porto', 'Paradise Beach'] },
  { nome: 'Fiskardo', lat: 38.4570, lng: 20.5752, cap: '28084', base: 3800, zone: ['Porto', 'Emblisi', 'Foki'] },
  { nome: 'Assos', lat: 38.3792, lng: 20.5390, cap: '28084', base: 3400, zone: ['Castello', 'Baia'] },
  { nome: 'Divarata', lat: 38.3203, lng: 20.5600, cap: '28084', base: 3000, zone: ['Myrtos'] },
  { nome: 'Skala', lat: 38.0620, lng: 20.7940, cap: '28082', base: 2600, zone: ['Spiaggia', 'Centro'] },
  { nome: 'Poros', lat: 38.1470, lng: 20.7770, cap: '28086', base: 1900, zone: ['Porto', 'Ragia'] },
  { nome: 'Katelios', lat: 38.0800, lng: 20.7100, cap: '28082', base: 2200, zone: ['Spiaggia'] },
  { nome: 'Lourdata', lat: 38.1130, lng: 20.6120, cap: '28083', base: 2400, zone: ['Trapezaki', 'Collina'] },
  { nome: 'Svoronata', lat: 38.1330, lng: 20.4770, cap: '28100', base: 2200, zone: ['Ammes', 'Aeroporto'] },
  { nome: 'Minies', lat: 38.1470, lng: 20.4790, cap: '28100', base: 2000, zone: [] },
  { nome: 'Peratata', lat: 38.1450, lng: 20.5400, cap: '28100', base: 1700, zone: ['Castello di San Giorgio'] },
  { nome: 'Karavados', lat: 38.1150, lng: 20.5330, cap: '28083', base: 1800, zone: [] },
  { nome: 'Spartia', lat: 38.1030, lng: 20.5170, cap: '28083', base: 2100, zone: ['Avithos'] },
  { nome: 'Kourkoumelata', lat: 38.1200, lng: 20.5000, cap: '28100', base: 2000, zone: [] },
]

const REGIONE = 'Isole Ionie'
const SIGLA = 'KE' // la sigla automobilistica greca di Cefalonia

// A Cefalonia si vendono soprattutto ville, case indipendenti e terreni
// edificabili; gli appartamenti stanno quasi tutti ad Argostoli e Lixouri.
const TIPI: PropertyType[] = [
  'VILLA', 'VILLA', 'APARTMENT', 'APARTMENT', 'TOWNHOUSE', 'LAND', 'LAND', 'ATTIC', 'SHOP',
]

const PROFILI: Record<string, { locali: [number, number]; mq: [number, number] }> = {
  APARTMENT: { locali: [1, 4], mq: [38, 120] },
  ATTIC: { locali: [2, 4], mq: [70, 140] },
  VILLA: { locali: [4, 8], mq: [110, 300] },
  TOWNHOUSE: { locali: [3, 6], mq: [90, 190] },
  LOFT: { locali: [1, 3], mq: [55, 120] },
  OFFICE: { locali: [1, 4], mq: [40, 150] },
  SHOP: { locali: [1, 3], mq: [35, 140] },
  ROOM: { locali: [1, 1], mq: [12, 22] },
  LAND: { locali: [1, 1], mq: [500, 3000] },
}

const NOMI_TIPO: Partial<Record<PropertyType, string>> = {
  ATTIC: 'Attico',
  VILLA: 'Villa',
  TOWNHOUSE: 'Casa indipendente',
  LOFT: 'Loft',
  OFFICE: 'Ufficio',
  SHOP: 'Negozio',
  ROOM: 'Stanza',
  LAND: 'Terreno edificabile',
  BUILDING: 'Stabile',
  GARAGE: 'Box',
  WAREHOUSE: 'Magazzino',
}

// Il portale parla tre lingue: gli annunci di esempio anche. Il testo
// originale è italiano, inglese e greco sono traduzioni dell'agenzia.
type Lingua = 'it' | 'en' | 'el'
const ALTRE_LINGUE: Lingua[] = ['en', 'el']

const NOMI_TIPO_LINGUA: Record<Lingua, Partial<Record<PropertyType, string>>> = {
  it: NOMI_TIPO,
  en: {
    ATTIC: 'Penthouse',
    VILLA: 'Villa',
    TOWNHOUSE: 'Detached house',
    LOFT: 'Loft',
    OFFICE: 'Office',
    SHOP: 'Shop',
    ROOM: 'Room',
    LAND: 'Building plot',
    BUILDING: 'Whole building',
    GARAGE: 'Garage',
    WAREHOUSE: 'Warehouse',
  },
  el: {
    ATTIC: 'Ρετιρέ',
    VILLA: 'Βίλα',
    TOWNHOUSE: 'Μονοκατοικία',
    LOFT: 'Λοφτ',
    OFFICE: 'Γραφείο',
    SHOP: 'Κατάστημα',
    ROOM: 'Δωμάτιο',
    LAND: 'Οικόπεδο',
    BUILDING: 'Κτίριο',
    GARAGE: 'Γκαράζ',
    WAREHOUSE: 'Αποθήκη',
  },
}

const NOMI_LOCALI: Record<Lingua, string[]> = {
  it: ['Monolocale', 'Bilocale', 'Trilocale', 'Quadrilocale', 'Cinque locali'],
  en: ['Studio', 'One-bedroom flat', 'Two-bedroom flat', 'Three-bedroom flat', 'Four-bedroom flat'],
  el: ['Γκαρσονιέρα', 'Δυάρι', 'Τριάρι', 'Τεσσάρι', 'Πενταδωμάτιο'],
}

const A_DOVE: Record<Lingua, string> = { it: 'a', en: 'in', el: 'στο' }

function titoloIn(lingua: Lingua, type: PropertyType, rooms: number, dove: string) {
  const nome =
    NOMI_TIPO_LINGUA[lingua][type] ??
    NOMI_LOCALI[lingua][rooms - 1] ??
    `${rooms} ${lingua === 'it' ? 'locali' : lingua === 'en' ? 'rooms' : 'δωμάτια'}`
  return `${nome} ${A_DOVE[lingua]} ${dove}`
}

function descrizioneIn(
  lingua: Lingua,
  type: PropertyType,
  rooms: number,
  surface: number,
  dove: string,
  mare: boolean,
) {
  if (lingua === 'it') return descrizione(type, rooms, surface, dove, mare)

  if (lingua === 'en') {
    if (type === 'LAND') {
      return `Building plot of ${surface} m² in ${dove}, reached by a surfaced road, with utilities available at the boundary.

${mare ? 'The plot looks out over the Ionian sea and faces south-west, which means sun until sunset.' : 'The plot is level, edged by a dry-stone wall and planted with olive trees.'}

Its size allows a single dwelling under the current planning ratios. Land registry papers are in order: Greek practice asks for a topographic survey and a building certificate, and both are ready.`
    }
    return `In ${dove} we offer a property of ${surface} m² with ${rooms} rooms.

${mare ? 'The main windows face the sea, with the coast opening up in front of the veranda.' : 'The property sits in the quiet part of the village, minutes from the shops.'} The rooms are bright, living and sleeping areas are separate, and the outdoor space is already laid out.

Kefalonia has direct flights from several Italian cities in summer, and is reachable all year through Athens or the port of Patras. Viewings by appointment, video call included.`
  }

  if (type === 'LAND') {
    return `Οικόπεδο ${surface} τ.μ. ${dove}, με πρόσβαση από ασφαλτοστρωμένο δρόμο και παροχές στο όριο.

${mare ? 'Το οικόπεδο έχει ανοιχτή θέα στο Ιόνιο και νοτιοδυτικό προσανατολισμό: ήλιος μέχρι τη δύση.' : 'Το οικόπεδο είναι επίπεδο, με ξερολιθιά στα όρια και ελιές.'}

Η έκταση επιτρέπει την ανέγερση μονοκατοικίας με τους ισχύοντες συντελεστές. Τοπογραφικό και βεβαίωση αρτιότητας είναι έτοιμα.`
  }
  return `${dove} διατίθεται ακίνητο ${surface} τ.μ. με ${rooms} δωμάτια.

${mare ? 'Τα κύρια ανοίγματα βλέπουν στη θάλασσα, με την ακτή να απλώνεται μπροστά από τη βεράντα.' : 'Το ακίνητο βρίσκεται στο ήσυχο τμήμα του χωριού, λίγα λεπτά από τα καταστήματα.'} Οι χώροι είναι φωτεινοί, η ημέρα χωρίζεται από τη νύχτα και ο περιβάλλων χώρος είναι διαμορφωμένος.

Η Κεφαλονιά έχει απευθείας πτήσεις από πολλές ιταλικές πόλεις το καλοκαίρι, και όλο τον χρόνο μέσω Αθήνας ή από το λιμάνι της Πάτρας. Επισκέψεις κατόπιν ραντεβού, ακόμη και με βιντεοκλήση.`
}

const CONDITIONS = ['NEW', 'RENOVATED', 'GOOD', 'TO_RENOVATE'] as const
const HEATINGS = ['AUTONOMOUS', 'CENTRALIZED'] as const
const ENERGIES = ['A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'] as const

const AGENZIE = [
  { name: 'Ionian Home Argostoli', slug: 'ionian-home-argostoli', city: 'Argostoli', province: SIGLA, phone: '+30 26710 25100' },
  { name: 'Kefalonia Properties', slug: 'kefalonia-properties', city: 'Lixouri', province: SIGLA, phone: '+30 26710 92200' },
  { name: 'Fiskardo Estates', slug: 'fiskardo-estates', city: 'Fiskardo', province: SIGLA, phone: '+30 26740 41300' },
]

// Numeri riproducibili: due seed di fila devono dare lo stesso portale.
let seedState = 42
function random() {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296
  return seedState / 4294967296
}
const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)]
const between = (min: number, max: number) => Math.floor(min + random() * (max - min + 1))

function titolo(type: PropertyType, rooms: number) {
  if (NOMI_TIPO[type]) return NOMI_TIPO[type] as string
  const nomi = ['Monolocale', 'Bilocale', 'Trilocale', 'Quadrilocale', 'Cinque locali']
  return nomi[rooms - 1] ?? `${rooms} locali`
}

function descrizione(type: PropertyType, rooms: number, surface: number, dove: string, mare: boolean) {
  if (type === 'LAND') {
    return `Terreno edificabile di ${surface} m² a ${dove}, con accesso da strada asfaltata e allacci disponibili sul confine.

${mare ? 'Il lotto gode di vista aperta sul mare Ionio ed è orientato a sud-ovest, il che significa sole fino al tramonto.' : 'Il lotto è pianeggiante, delimitato da un muretto a secco e piantato a ulivi.'}

La superficie consente l'edificazione di una residenza singola secondo gli indici vigenti. Documentazione catastale disponibile: la pratica greca richiede topografico e certificato di edificabilità, entrambi già predisposti.`
  }

  return `Proponiamo a ${dove} un immobile di ${surface} m² composto da ${rooms} locali.

${mare ? 'Le finestre principali guardano il mare, con la costa che si apre davanti alla veranda.' : "L'immobile si trova nella parte tranquilla del paese, a pochi minuti dai servizi."} Gli ambienti sono luminosi, la zona giorno è separata dalla zona notte e gli esterni sono già sistemati.

Cefalonia è raggiungibile con voli diretti da diverse città italiane nella stagione estiva, e tutto l'anno via Atene o dal porto di Patrasso. Visite su appuntamento, anche in videochiamata.`
}

async function main() {
  console.log('Pulizia delle tabelle…')
  await db.lead.deleteMany()
  await db.favorite.deleteMany()
  await db.savedSearch.deleteMany()
  await db.listingImage.deleteMany()
  await db.listing.deleteMany()
  await db.user.deleteMany()
  await db.agency.deleteMany()
  await db.location.deleteMany()

  console.log('Localita dell isola…')
  const isola = await db.location.create({
    data: {
      slug: 'cefalonia',
      name: 'Cefalonia',
      type: 'PROVINCE',
      province: SIGLA,
      region: REGIONE,
      latitude: 38.2,
      longitude: 20.55,
    },
  })

  for (const l of LOCALITA) {
    const paese = await db.location.create({
      data: {
        slug: l.nome.toLowerCase().replace(/\s+/g, '-'),
        name: l.nome,
        type: 'CITY',
        province: SIGLA,
        region: REGIONE,
        latitude: l.lat,
        longitude: l.lng,
        parentId: isola.id,
      },
    })
    for (const zona of l.zone) {
      await db.location.create({
        data: {
          slug: `${l.nome}-${zona}`.toLowerCase().replace(/\s+/g, '-'),
          name: zona,
          type: 'ZONE',
          province: SIGLA,
          region: REGIONE,
          parentId: paese.id,
        },
      })
    }
  }

  console.log('Agenzie e utenti…')
  const passwordHash = await bcrypt.hash('password123', 12)

  const agenzie = []
  for (const a of AGENZIE) {
    agenzie.push(
      await db.agency.create({
        data: {
          ...a,
          email: `info@${a.slug}.gr`,
          verified: true,
          description: `${a.name} segue la compravendita e l'affitto di case e terreni a Cefalonia, con assistenza in italiano, greco e inglese per l'intera pratica.`,
        },
      }),
    )
  }

  const agenti = []
  for (const [index, agenzia] of agenzie.entries()) {
    agenti.push(
      await db.user.create({
        data: {
          name: ['Eleni Rossolatou', 'Spiros Metaxas', 'Marina Vandorou'][index],
          email: `agente${index + 1}@example.gr`,
          passwordHash,
          role: 'AGENT',
          phone: agenzia.phone,
          agencyId: agenzia.id,
        },
      }),
    )
  }

  const acquirente = await db.user.create({
    data: { name: 'Luca Rossi', email: 'utente@example.gr', passwordHash, role: 'USER' },
  })

  await db.user.create({
    data: { name: 'Amministratore', email: 'admin@example.gr', passwordHash, role: 'ADMIN' },
  })

  console.log('Annunci…')
  const annunci = []
  for (let i = 0; i < 60; i++) {
    const posto = pick(LOCALITA)
    const zona = posto.zone.length ? pick(posto.zone) : null
    const type = pick(TIPI)
    // I terreni non si affittano, e sull'isola l'affitto annuale è una nicchia
    // accanto alla vendita.
    const contract: ContractType = type === 'LAND' ? 'SALE' : random() < 0.78 ? 'SALE' : 'RENT'

    const profilo = PROFILI[type] ?? PROFILI.APARTMENT
    const rooms = between(profilo.locali[0], profilo.locali[1])
    const surface = between(profilo.mq[0], profilo.mq[1])
    const mare = random() < 0.55

    // Un terreno costa una frazione del costruito; la vista mare pesa.
    const fattore = (type === 'LAND' ? 0.035 : 1) * (mare ? 1.25 : 1) * (0.85 + random() * 0.35)
    const vendita = Math.round((surface * posto.base * fattore) / 1000) * 1000
    const affitto = Math.round((surface * (posto.base / 320) * fattore) / 10) * 10

    const agente = agenti[i % agenti.length]
    const dove = zona ? `${zona}, ${posto.nome}` : posto.nome

    const creato = await db.listing.create({
      data: {
        slug: `${titolo(type, rooms).toLowerCase().replace(/\s+/g, '-')}-${posto.nome.toLowerCase()}-${i + 1}`,
        reference: `KE-${1000 + i}`,
        title: `${titolo(type, rooms)} a ${dove}`,
        description: descrizione(type, rooms, surface, dove, mare),
        contract,
        type,
        status: 'PUBLISHED',
        price: contract === 'SALE' ? Math.max(28000, vendita) : Math.max(320, affitto),
        condoFees: type === 'LAND' ? null : random() < 0.35 ? between(20, 90) : null,
        deposit: contract === 'RENT' ? Math.max(320, affitto) * 2 : null,
        surface,
        rooms,
        bedrooms: type === 'LAND' ? null : Math.max(1, rooms - 2),
        bathrooms: type === 'LAND' ? null : rooms > 5 ? 3 : rooms > 3 ? 2 : 1,
        floor: type === 'LAND' || type === 'VILLA' ? null : between(0, 2),
        totalFloors: type === 'LAND' ? null : between(1, 3),
        yearBuilt: type === 'LAND' ? null : between(1975, 2024),
        elevator: type === 'APARTMENT' && random() < 0.3,
        garden: type !== 'APARTMENT' && random() < 0.75,
        terrace: type !== 'LAND' && random() < 0.6,
        balcony: type !== 'LAND' && random() < 0.7,
        parking: random() < 0.7,
        cellar: type !== 'LAND' && random() < 0.35,
        pool: (type === 'VILLA' || type === 'TOWNHOUSE') && random() < 0.45,
        airCon: type !== 'LAND' && random() < 0.8,
        furnished: contract === 'RENT' ? pick(['FURNISHED', 'PARTIALLY', 'UNFURNISHED'] as const) : null,
        condition: type === 'LAND' ? null : pick(CONDITIONS),
        heating: type === 'LAND' ? null : pick(HEATINGS),
        energy: type === 'LAND' ? null : pick(ENERGIES),
        features: [
          mare && 'Vista mare',
          random() < 0.3 && 'Uliveto',
          random() < 0.2 && 'Pozzo',
          random() < 0.25 && 'A piedi dalla spiaggia',
        ].filter(Boolean) as string[],
        isNewBuild: random() < 0.18,
        isAuction: random() < 0.05,
        hasFloorPlan: random() < 0.5,
        virtualTourUrl: random() < 0.2 ? 'https://example.com/tour-virtuale' : null,
        utilitiesIncluded: contract === 'RENT' && random() < 0.3,
        availability: pick(['FREE', 'FREE', 'OCCUPIED', 'RENTED'] as const),
        ownership: random() < 0.94 ? 'FULL' : pick(['BARE', 'SHARED'] as const),
        petsAllowed: contract === 'RENT' ? random() < 0.5 : null,
        addressLine: `${posto.nome}, Cefalonia`,
        hideAddress: random() < 0.4,
        city: posto.nome,
        province: SIGLA,
        region: REGIONE,
        postalCode: posto.cap,
        zone: zona,
        latitude: posto.lat + (random() - 0.5) * 0.02,
        longitude: posto.lng + (random() - 0.5) * 0.025,
        publishedAt: new Date(Date.now() - between(0, 60) * 86_400_000),
        featured: i % 11 === 0,
        views: between(20, 900),
        ownerId: agente.id,
        agencyId: agente.agencyId,
        locale: 'it',
        translations: {
          create: ALTRE_LINGUE.map((lingua) => ({
            locale: lingua,
            title: titoloIn(lingua, type, rooms, dove),
            description: descrizioneIn(lingua, type, rooms, surface, dove, mare),
          })),
        },
      },
    })

    // Fotografie di esempio: immagini remote, così il seed non porta binari
    // dentro il repository. In produzione arrivano dagli upload.
    for (let p = 0; p < 5; p++) {
      await db.listingImage.create({
        data: {
          listingId: creato.id,
          url: `https://picsum.photos/seed/${creato.id}-${p}/1200/900`,
          thumbUrl: `https://picsum.photos/seed/${creato.id}-${p}/640/480`,
          alt: `${creato.title}, fotografia ${p + 1}`,
          width: 1200,
          height: 900,
          position: p,
          isCover: p === 0,
        },
      })
    }

    annunci.push(creato)
  }

  console.log('Preferiti, ricerche salvate e richieste…')
  for (const annuncio of annunci.slice(0, 5)) {
    await db.favorite.create({ data: { userId: acquirente.id, listingId: annuncio.id } })
  }

  await db.savedSearch.create({
    data: {
      userId: acquirente.id,
      name: 'Ville con vista mare fino a 400.000 euro',
      query: 'contratto=vendita&tipo=villa&prezzoMax=400000',
      frequency: 'DAILY',
    },
  })

  for (const annuncio of annunci.slice(0, 8)) {
    await db.lead.create({
      data: {
        listingId: annuncio.id,
        name: pick(['Anna Verdi', 'Paolo Neri', 'Chiara Gallo', 'Davide Riva']),
        email: 'richiesta@example.it',
        phone: '+39 333 1234567',
        message: 'Buongiorno, sono interessato a questo immobile e vorrei organizzare una visita durante il prossimo viaggio sull’isola.',
      },
    })
  }

  console.log(`Fatto: ${annunci.length} annunci a Cefalonia, ${agenzie.length} agenzie.`)
  console.log('Accessi di prova: agente1@example.gr / utente@example.gr — password: password123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

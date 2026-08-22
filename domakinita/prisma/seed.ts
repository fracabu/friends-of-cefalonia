import { PrismaClient, type ContractType, type PropertyType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// Comuni con coordinate del centro: le posizioni degli annunci si sparpagliano
// intorno a queste, così la mappa non mostra tutti i segnaposti sovrapposti.
const CITIES = [
  { city: 'Roma', province: 'RM', region: 'Lazio', lat: 41.9028, lng: 12.4964, zones: ['Trastevere', 'Prati', 'Monteverde', 'San Giovanni', 'EUR'] },
  { city: 'Milano', province: 'MI', region: 'Lombardia', lat: 45.4642, lng: 9.19, zones: ['Navigli', 'Isola', 'Città Studi', 'Porta Romana'] },
  { city: 'Torino', province: 'TO', region: 'Piemonte', lat: 45.0703, lng: 7.6869, zones: ['Crocetta', 'San Salvario', 'Vanchiglia'] },
  { city: 'Bologna', province: 'BO', region: 'Emilia-Romagna', lat: 44.4949, lng: 11.3426, zones: ['Santo Stefano', 'Bolognina', 'Saragozza'] },
  { city: 'Firenze', province: 'FI', region: 'Toscana', lat: 43.7696, lng: 11.2558, zones: ['Oltrarno', 'Campo di Marte', 'Novoli'] },
  { city: 'Napoli', province: 'NA', region: 'Campania', lat: 40.8518, lng: 14.2681, zones: ['Vomero', 'Chiaia', 'Posillipo'] },
  { city: 'Bari', province: 'BA', region: 'Puglia', lat: 41.1171, lng: 16.8719, zones: ['Murat', 'Poggiofranco', 'Japigia'] },
  { city: 'Palermo', province: 'PA', region: 'Sicilia', lat: 38.1157, lng: 13.3615, zones: ['Politeama', 'Libertà', 'Mondello'] },
]

const TYPES: PropertyType[] = ['APARTMENT', 'APARTMENT', 'APARTMENT', 'ATTIC', 'VILLA', 'TOWNHOUSE', 'LOFT', 'OFFICE']
const CONDITIONS = ['NEW', 'RENOVATED', 'GOOD', 'TO_RENOVATE'] as const
const HEATINGS = ['AUTONOMOUS', 'CENTRALIZED'] as const
const ENERGIES = ['A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'] as const

const AGENCIES = [
  { name: 'Studio Casa Roma', slug: 'studio-casa-roma', city: 'Roma', province: 'RM', phone: '06 5555 0100' },
  { name: 'Milano Abitare', slug: 'milano-abitare', city: 'Milano', province: 'MI', phone: '02 5555 0200' },
  { name: 'Tirreno Immobiliare', slug: 'tirreno-immobiliare', city: 'Firenze', province: 'FI', phone: '055 5555 0300' },
]

// Numeri riproducibili: due seed di fila devono dare lo stesso portale.
let seedState = 42
function random() {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296
  return seedState / 4294967296
}
const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)]
const between = (min: number, max: number) => Math.floor(min + random() * (max - min + 1))

function describe(type: PropertyType, rooms: number, surface: number, zone: string, city: string) {
  return `Proponiamo in ${zone}, a ${city}, un immobile di ${surface} m² composto da ${rooms} locali.

L'appartamento si presenta luminoso, con doppia esposizione e affacci sulla corte interna. La zona giorno è separata dalla zona notte, la cucina è abitabile e i serramenti sono stati sostituiti di recente.

Il quartiere è servito da mezzi pubblici, scuole e negozi di vicinato. Possibilità di visita anche nel fine settimana, su appuntamento.`
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

  console.log('Luoghi…')
  for (const c of CITIES) {
    const city = await db.location.create({
      data: {
        slug: c.city.toLowerCase(),
        name: c.city,
        type: 'CITY',
        province: c.province,
        region: c.region,
        latitude: c.lat,
        longitude: c.lng,
      },
    })
    for (const zone of c.zones) {
      await db.location.create({
        data: {
          slug: `${c.city}-${zone}`.toLowerCase().replace(/\s+/g, '-'),
          name: zone,
          type: 'ZONE',
          province: c.province,
          region: c.region,
          parentId: city.id,
        },
      })
    }
  }

  console.log('Agenzie e utenti…')
  const passwordHash = await bcrypt.hash('password123', 12)

  const agencies = []
  for (const a of AGENCIES) {
    agencies.push(
      await db.agency.create({
        data: {
          ...a,
          email: `info@${a.slug}.it`,
          verified: true,
          description: `${a.name} opera da oltre vent'anni sul mercato di ${a.city}, con un portafoglio di immobili residenziali selezionati.`,
        },
      }),
    )
  }

  const agents = []
  for (const [index, agency] of agencies.entries()) {
    agents.push(
      await db.user.create({
        data: {
          name: ['Giulia Ferri', 'Marco Bianchi', 'Sara Conti'][index],
          email: `agente${index + 1}@example.it`,
          passwordHash,
          role: 'AGENT',
          phone: agency.phone,
          agencyId: agency.id,
        },
      }),
    )
  }

  const buyer = await db.user.create({
    data: {
      name: 'Luca Rossi',
      email: 'utente@example.it',
      passwordHash,
      role: 'USER',
    },
  })

  await db.user.create({
    data: { name: 'Amministratore', email: 'admin@example.it', passwordHash, role: 'ADMIN' },
  })

  console.log('Annunci…')
  const listings = []
  for (let i = 0; i < 60; i++) {
    const place = pick(CITIES)
    const zone = pick(place.zones)
    const type = pick(TYPES)
    const contract: ContractType = random() < 0.72 ? 'SALE' : 'RENT'
    const rooms = between(1, 6)
    const surface = rooms * between(22, 38)

    // Prezzi verosimili: base al metro quadro per città, poi lo sconto o il
    // sovrapprezzo dello stato di conservazione.
    const base = { Roma: 3900, Milano: 5200, Firenze: 4200, Bologna: 3400, Torino: 2200, Napoli: 2800, Bari: 2400, Palermo: 1800 }[place.city] ?? 2500
    const salePrice = Math.round((surface * base * (0.85 + random() * 0.4)) / 1000) * 1000
    const rentPrice = Math.round((surface * (base / 220) * (0.85 + random() * 0.4)) / 10) * 10

    const agent = agents[i % agents.length]
    const owner = agent
    const created = await db.listing.create({
      data: {
        slug: `annuncio-${i + 1}-${place.city.toLowerCase()}`,
        reference: `RIF-${1000 + i}`,
        title: `${['Trilocale', 'Bilocale', 'Quadrilocale', 'Attico', 'Villa', 'Loft'][Math.min(rooms - 1, 5)]} in ${zone}, ${place.city}`,
        description: describe(type, rooms, surface, zone, place.city),
        contract,
        type,
        status: 'PUBLISHED',
        price: contract === 'SALE' ? salePrice : rentPrice,
        condoFees: random() < 0.7 ? between(40, 220) : null,
        deposit: contract === 'RENT' ? rentPrice * 3 : null,
        surface,
        rooms,
        bedrooms: Math.max(1, rooms - 2),
        bathrooms: rooms > 3 ? 2 : 1,
        floor: between(0, 7),
        totalFloors: between(3, 9),
        yearBuilt: between(1930, 2022),
        elevator: random() < 0.6,
        garden: random() < 0.2,
        terrace: random() < 0.35,
        balcony: random() < 0.7,
        parking: random() < 0.4,
        cellar: random() < 0.5,
        pool: random() < 0.05,
        airCon: random() < 0.45,
        furnished: contract === 'RENT' ? pick(['FURNISHED', 'PARTIALLY', 'UNFURNISHED'] as const) : null,
        condition: pick(CONDITIONS),
        heating: pick(HEATINGS),
        energy: pick(ENERGIES),
        features: random() < 0.3 ? ['Doppia esposizione', 'Portineria'] : [],
        addressLine: `Via ${['Giulia', 'Verdi', 'Manzoni', 'Dante', 'Garibaldi'][between(0, 4)]} ${between(1, 90)}`,
        hideAddress: random() < 0.3,
        city: place.city,
        province: place.province,
        region: place.region,
        postalCode: String(between(10, 90)).padStart(2, '0') + '100',
        zone,
        latitude: place.lat + (random() - 0.5) * 0.08,
        longitude: place.lng + (random() - 0.5) * 0.1,
        isNewBuild: random() < 0.15,
        isAuction: random() < 0.06,
        hasFloorPlan: random() < 0.55,
        virtualTourUrl: random() < 0.2 ? 'https://example.com/tour-virtuale' : null,
        utilitiesIncluded: contract === 'RENT' && random() < 0.25,
        availability: pick(['FREE', 'FREE', 'OCCUPIED', 'RENTED'] as const),
        ownership: random() < 0.94 ? 'FULL' : pick(['BARE', 'SHARED'] as const),
        petsAllowed: contract === 'RENT' ? random() < 0.4 : null,
        publishedAt: new Date(Date.now() - between(0, 60) * 86_400_000),
        featured: i % 11 === 0,
        views: between(20, 900),
        ownerId: owner.id,
        agencyId: agent.agencyId,
      },
    })

    // Fotografie di esempio: immagini remote, così il seed non porta binari
    // dentro il repository. In produzione arrivano dagli upload.
    for (let p = 0; p < 5; p++) {
      await db.listingImage.create({
        data: {
          listingId: created.id,
          url: `https://picsum.photos/seed/${created.id}-${p}/1200/900`,
          thumbUrl: `https://picsum.photos/seed/${created.id}-${p}/640/480`,
          alt: `${created.title}, fotografia ${p + 1}`,
          width: 1200,
          height: 900,
          position: p,
          isCover: p === 0,
        },
      })
    }

    listings.push(created)
  }

  console.log('Preferiti, ricerche salvate e richieste…')
  for (const listing of listings.slice(0, 5)) {
    await db.favorite.create({ data: { userId: buyer.id, listingId: listing.id } })
  }

  await db.savedSearch.create({
    data: {
      userId: buyer.id,
      name: 'Trilocali a Roma fino a 400.000 euro',
      query: 'contratto=vendita&comune=Roma&localiMin=3&prezzoMax=400000',
      frequency: 'DAILY',
    },
  })

  for (const listing of listings.slice(0, 8)) {
    await db.lead.create({
      data: {
        listingId: listing.id,
        name: pick(['Anna Verdi', 'Paolo Neri', 'Chiara Gallo', 'Davide Riva']),
        email: 'richiesta@example.it',
        phone: '333 1234567',
        message: 'Buongiorno, sono interessato a questo immobile e vorrei fissare una visita.',
      },
    })
  }

  console.log(`Fatto: ${listings.length} annunci, ${agencies.length} agenzie.`)
  console.log('Accessi di prova: agente1@example.it / utente@example.it — password: password123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

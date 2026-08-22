/**
 * Geometria della ricerca su mappa.
 *
 * Il portale offre tre modi di cercare per posizione, tutti riducibili a un
 * poligono o a un cerchio:
 *   - l'area disegnata a mano dall'utente  -> `area=` (poligono compresso)
 *   - il raggio attorno a un punto         -> `centro=` + `raggio=`
 *   - il riquadro visibile della mappa     -> `bbox=`
 *
 * Niente PostGIS: si filtra prima con un rettangolo, che l'indice su
 * (latitude, longitude) copre bene, e poi si rifinisce in memoria. Sopra il
 * milione di annunci conviene passare a PostGIS, ma l'interfaccia resta questa.
 */

export type LatLng = [number, number] // [latitudine, longitudine]

export type Bounds = { south: number; west: number; north: number; east: number }

export type Area =
  | { kind: 'polygon'; points: LatLng[] }
  | { kind: 'circle'; center: LatLng; radiusKm: number }
  | { kind: 'bounds'; bounds: Bounds }

// --------------------------------------------------------- codifica URL ----

/**
 * Codifica polyline di Google, precisione 5 (circa un metro).
 * Un poligono da 40 vertici sta in una sessantina di caratteri invece di
 * ottocento: l'URL resta condivisibile e salvabile fra le ricerche.
 */
export function encodePolyline(points: LatLng[]): string {
  let previousLat = 0
  let previousLng = 0
  let output = ''

  for (const [lat, lng] of points) {
    const currentLat = Math.round(lat * 1e5)
    const currentLng = Math.round(lng * 1e5)
    output += encodeSigned(currentLat - previousLat) + encodeSigned(currentLng - previousLng)
    previousLat = currentLat
    previousLng = currentLng
  }

  return output
}

function encodeSigned(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1
  let output = ''
  while (v >= 0x20) {
    output += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  output += String.fromCharCode(v + 63)
  return output
}

export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte: number
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && index < encoded.length)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && index < encoded.length)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}

// ------------------------------------------------------------ geometria ----

const EARTH_RADIUS_KM = 6371

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Ray casting: conta quante volte un raggio verso est attraversa i lati. */
export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  const [lat, lng] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i]
    const [latJ, lngJ] = polygon[j]
    const straddles = latI > lat !== latJ > lat
    if (straddles && lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI) {
      inside = !inside
    }
  }

  return inside
}

export function polygonBounds(points: LatLng[]): Bounds {
  let south = 90
  let west = 180
  let north = -90
  let east = -180

  for (const [lat, lng] of points) {
    south = Math.min(south, lat)
    north = Math.max(north, lat)
    west = Math.min(west, lng)
    east = Math.max(east, lng)
  }

  return { south, west, north, east }
}

/** Rettangolo che contiene il cerchio: un grado di longitudine si accorcia salendo. */
export function circleBounds(center: LatLng, radiusKm: number): Bounds {
  const latDelta = radiusKm / 111.32
  const lngDelta = radiusKm / (111.32 * Math.max(0.01, Math.cos((center[0] * Math.PI) / 180)))
  return {
    south: center[0] - latDelta,
    north: center[0] + latDelta,
    west: center[1] - lngDelta,
    east: center[1] + lngDelta,
  }
}

export function areaBounds(area: Area): Bounds {
  if (area.kind === 'polygon') return polygonBounds(area.points)
  if (area.kind === 'circle') return circleBounds(area.center, area.radiusKm)
  return area.bounds
}

/** Il rettangolo è solo il primo setaccio: qui si decide davvero. */
export function containsPoint(area: Area, point: LatLng): boolean {
  if (area.kind === 'polygon') return pointInPolygon(point, area.points)
  if (area.kind === 'circle') return haversineKm(area.center, point) <= area.radiusKm
  const { south, west, north, east } = area.bounds
  return point[0] >= south && point[0] <= north && point[1] >= west && point[1] <= east
}

/**
 * Il disegno a mano libera produce centinaia di punti quasi identici.
 * Ramer-Douglas-Peucker li riduce a poche decine senza cambiare la forma.
 */
export function simplifyPolygon(points: LatLng[], tolerance = 0.0004): LatLng[] {
  if (points.length <= 4) return points

  const keep = new Array<boolean>(points.length).fill(false)
  keep[0] = true
  keep[points.length - 1] = true

  const stack: Array<[number, number]> = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop() as [number, number]
    let maxDistance = 0
    let index = first

    for (let i = first + 1; i < last; i++) {
      const distance = perpendicularDistance(points[i], points[first], points[last])
      if (distance > maxDistance) {
        maxDistance = distance
        index = i
      }
    }

    if (maxDistance > tolerance) {
      keep[index] = true
      stack.push([first, index], [index, last])
    }
  }

  return points.filter((_, i) => keep[i])
}

function perpendicularDistance(point: LatLng, start: LatLng, end: LatLng): number {
  const [x, y] = point
  const [x1, y1] = start
  const [x2, y2] = end

  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1)

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}

/** Etichetta leggibile dell'area, per i chip dei filtri attivi. */
export function describeArea(area: Area): string {
  if (area.kind === 'polygon') return 'Area disegnata sulla mappa'
  if (area.kind === 'circle') return `Entro ${area.radiusKm} km dal punto scelto`
  return 'Area visibile sulla mappa'
}

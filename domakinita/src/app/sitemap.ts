import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'
import { LINGUE, percorso } from '@/i18n/config'

/**
 * Ogni pagina compare una volta per lingua, e ciascuna dichiara le altre due
 * come alternative: è così che i motori capiscono che sono la stessa cosa
 * detta in tre modi, invece di tre pagine che si fanno concorrenza.
 */
function alternative(path: string) {
  return {
    languages: Object.fromEntries(LINGUE.map((l) => [l, `${SITE_URL}${percorso(l, path)}`])),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, agencies] = await Promise.all([
    db.listing.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 5000,
    }),
    db.agency.findMany({ select: { slug: true, updatedAt: true } }),
  ])

  const percorsi = [
    { path: '/', priorita: 1 },
    { path: '/cerca', priorita: 0.8 },
    { path: '/agenzie', priorita: 0.6 },
    { path: '/valuta-immobile', priorita: 0.6 },
    { path: '/chi-siamo', priorita: 0.4 },
    { path: '/contatti', priorita: 0.4 },
    ...listings.map((l) => ({ path: `/annuncio/${l.slug}`, priorita: 0.8, data: l.updatedAt })),
    ...agencies.map((a) => ({ path: `/agenzie/${a.slug}`, priorita: 0.5, data: a.updatedAt })),
  ]

  return percorsi.flatMap((voce) =>
    LINGUE.map((lingua) => ({
      url: `${SITE_URL}${percorso(lingua, voce.path)}`,
      lastModified: 'data' in voce ? (voce.data as Date) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: voce.priorita,
      alternates: alternative(voce.path),
    })),
  )
}

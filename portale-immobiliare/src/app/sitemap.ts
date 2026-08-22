import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'

/** Pagine fisse, annunci pubblicati e vetrine delle agenzie. */
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

  const staticPages = ['', '/cerca', '/agenzie', '/valuta-immobile', '/chi-siamo', '/contatti'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.7,
    }),
  )

  return [
    ...staticPages,
    ...listings.map((listing) => ({
      url: `${SITE_URL}/annuncio/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...agencies.map((agency) => ({
      url: `${SITE_URL}/agenzie/${agency.slug}`,
      lastModified: agency.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ]
}

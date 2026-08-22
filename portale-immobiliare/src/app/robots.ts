import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Le aree private e le ricerche filtrate non vanno in indice.
      disallow: ['/dashboard', '/preferiti', '/ricerche-salvate', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

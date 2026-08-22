/**
 * Il testo dell'annuncio nella lingua di chi guarda.
 *
 * Se la traduzione non c'è si mostra l'originale — meglio l'italiano che il
 * vuoto — e la scheda lo dichiara, così chi legge sa perché la lingua cambia.
 */
export function testoAnnuncio(
  listing: {
    locale: string
    title: string
    description?: string
    translations: Array<{ locale: string; title: string; description?: string }>
  },
  lingua: string,
) {
  const originale = {
    title: listing.title,
    description: listing.description ?? '',
    tradotto: false,
  }

  if (lingua === listing.locale) return originale

  const traduzione = listing.translations.find((t) => t.locale === lingua)
  if (!traduzione) return originale

  return {
    title: traduzione.title,
    description: traduzione.description ?? originale.description,
    tradotto: true,
  }
}

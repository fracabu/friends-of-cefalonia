import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * "Città di Trilocale" -> "citta-di-trilocale".
 * NFD separa la lettera dal segno diacritico, poi si butta via tutto
 * quello che non è ASCII: resta la lettera base.
 */
export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Slug di annuncio: leggibile e unico, anche con due titoli identici. */
export function listingSlug(title: string, city: string, id: string) {
  return `${slugify(`${title}-${city}`)}-${id.slice(-6)}`
}

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { SITE_NAME } from '@/lib/seo'

const COLUMNS = [
  {
    title: 'Cerca',
    links: [
      { href: '/cerca?contratto=vendita', label: 'Case in vendita' },
      { href: '/cerca?contratto=affitto', label: 'Case in affitto' },
      { href: '/cerca?contratto=vendita&tipo=terreno', label: 'Terreni edificabili' },
      { href: '/cerca?contratto=vendita&tipo=villa', label: 'Ville' },
    ],
  },
  {
    title: 'Per chi vende',
    links: [
      { href: '/registrati?ruolo=agente', label: 'Pubblica un annuncio' },
      { href: '/valuta-immobile', label: 'Valuta il tuo immobile' },
      { href: '/agenzie', label: 'Elenco agenzie' },
    ],
  },
  {
    title: 'Portale',
    links: [
      { href: '/chi-siamo', label: 'Chi siamo' },
      { href: '/contatti', label: 'Contatti' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/termini', label: 'Termini di servizio' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo name={SITE_NAME} subtitle="αγγελίες ακινήτων" markClassName="h-7 w-7 text-brand-600" />
          <p className="mt-2 max-w-xs text-sm text-ink-500">
            Case, ville e terreni a Cefalonia. Annunci delle agenzie dell&apos;isola, con ricerca
            sulla mappa e richieste di visita.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-ink-900">{column.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-ink-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-100 py-6 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} {SITE_NAME}. Progetto dimostrativo.
      </div>
    </footer>
  )
}

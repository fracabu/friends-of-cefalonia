import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { SITE_NAME } from '@/lib/seo'
import { getDizionario } from '@/i18n'
import { percorso, type Lingua } from '@/i18n/config'

export function Footer({ lingua }: { lingua: Lingua }) {
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)

  const colonne = [
    {
      titolo: d.statiche.footerRicerca,
      link: [
        { href: p('/cerca?contratto=vendita'), label: d.statiche.caseVendita },
        { href: p('/cerca?contratto=affitto'), label: d.statiche.caseAffitto },
        { href: p('/cerca?contratto=vendita&tipo=terreno'), label: d.statiche.terreni },
        { href: p('/cerca?contratto=vendita&tipo=villa'), label: d.statiche.ville },
      ],
    },
    {
      titolo: d.statiche.footerVendere,
      link: [
        { href: p('/registrati?ruolo=agente'), label: d.nav.pubblica },
        { href: p('/valuta-immobile'), label: d.nav.valuta },
        { href: p('/agenzie'), label: d.statiche.elencoAgenzie },
      ],
    },
    {
      titolo: d.statiche.footerPortale,
      link: [
        { href: p('/chi-siamo'), label: d.statiche.chiSiamoTitolo },
        { href: p('/contatti'), label: d.statiche.contattiTitolo },
        { href: p('/privacy'), label: d.statiche.privacyTitolo },
        { href: p('/termini'), label: d.statiche.terminiTitolo },
      ],
    },
  ]

  return (
    <footer className="mt-20 border-t border-ink-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo name={SITE_NAME} subtitle="αγγελίες ακινήτων" markClassName="h-7 w-7 text-brand-600" />
          <p className="mt-3 max-w-xs text-sm text-ink-500">{d.statiche.footerTesto}</p>
        </div>

        {colonne.map((colonna) => (
          <div key={colonna.titolo}>
            <p className="text-sm font-semibold text-ink-900">{colonna.titolo}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              {colonna.link.map((link) => (
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
        © {new Date().getFullYear()} {SITE_NAME}. {d.statiche.progetto}
      </div>
    </footer>
  )
}

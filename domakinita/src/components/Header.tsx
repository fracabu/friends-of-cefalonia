import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { ButtonLink } from '@/components/ui/Button'
import { LogoMark } from '@/components/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SITE_NAME } from '@/lib/seo'
import { getDizionario } from '@/i18n'
import { percorso, type Lingua } from '@/i18n/config'

/**
 * La fascia blu in cima è la convenzione dei portali immobiliari: il marchio a
 * sinistra, le due parole che contano — vendita e affitto — accanto, e l'area
 * personale a destra. Non è decorazione: chi arriva da una ricerca su Google
 * ritrova in mezzo secondo i comandi dove se li aspetta.
 */
export async function Header({ lingua }: { lingua: Lingua }) {
  const session = await getSession()
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)

  return (
    <header className="sticky top-0 z-40 bg-brand-700 text-white shadow-[0_1px_0_rgba(255,255,255,.12)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4">
        <Link href={p('/')} aria-label={`${SITE_NAME}, ${d.nav.home}`} className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 text-white" />
          <span className="flex flex-col leading-none">
            <span className="font-[Archivo,ui-sans-serif] text-lg font-bold tracking-tight">
              {SITE_NAME}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-brand-200">
              αγγελίες ακινήτων
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {[
            { href: p('/cerca?contratto=vendita'), label: d.nav.vendita },
            { href: p('/cerca?contratto=affitto'), label: d.nav.affitto },
            { href: p('/agenzie'), label: d.nav.agenzie },
            { href: p('/valuta-immobile'), label: d.nav.valuta },
          ].map((voce) => (
            <Link
              key={voce.href}
              href={voce.href}
              className="rounded-lg px-3 py-2 font-medium text-brand-50 transition hover:bg-white/10"
            >
              {voce.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="text-brand-50">
            <LanguageSwitcher />
          </div>

          {session ? (
            <>
              <Link
                href={p('/preferiti')}
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-brand-50 hover:bg-white/10 sm:block"
              >
                {d.nav.preferiti}
              </Link>
              <ButtonLink
                href={p('/dashboard')}
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                variant="secondary"
              >
                {session.role === 'USER' ? d.nav.areaPersonale : d.nav.pannello}
              </ButtonLink>
            </>
          ) : (
            <>
              <Link
                href={p('/accedi')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-50 hover:bg-white/10"
              >
                {d.nav.accedi}
              </Link>
              <ButtonLink
                href={p('/registrati?ruolo=agente')}
                size="sm"
                className="bg-white text-brand-800 hover:bg-brand-50"
              >
                {d.nav.pubblica}
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

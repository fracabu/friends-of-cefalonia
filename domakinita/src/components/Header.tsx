import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { ButtonLink } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SITE_NAME } from '@/lib/seo'
import { getDizionario } from '@/i18n'
import { percorso, type Lingua } from '@/i18n/config'

export async function Header({ lingua }: { lingua: Lingua }) {
  const session = await getSession()
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href={p('/')} aria-label={`${SITE_NAME}, ${d.nav.home}`}>
          <Logo name={SITE_NAME} />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-ink-600 md:flex">
          <Link href={p('/cerca?contratto=vendita')} className="hover:text-ink-900">
            {d.nav.vendita}
          </Link>
          <Link href={p('/cerca?contratto=affitto')} className="hover:text-ink-900">
            {d.nav.affitto}
          </Link>
          <Link href={p('/agenzie')} className="hover:text-ink-900">
            {d.nav.agenzie}
          </Link>
          <Link href={p('/valuta-immobile')} className="hover:text-ink-900">
            {d.nav.valuta}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />

          {session ? (
            <>
              <Link href={p('/preferiti')} className="hidden text-sm text-ink-600 hover:text-ink-900 sm:block">
                {d.nav.preferiti}
              </Link>
              <ButtonLink href={p('/dashboard')} variant="secondary" size="sm">
                {session.role === 'USER' ? d.nav.areaPersonale : d.nav.pannello}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href={p('/accedi')} variant="ghost" size="sm">
                {d.nav.accedi}
              </ButtonLink>
              <ButtonLink href={p('/registrati?ruolo=agente')} size="sm">
                {d.nav.pubblica}
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

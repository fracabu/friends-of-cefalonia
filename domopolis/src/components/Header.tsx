import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { ButtonLink } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { SITE_NAME } from '@/lib/seo'

export async function Header() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" aria-label={`${SITE_NAME}, torna alla home`}>
          <Logo name={SITE_NAME} />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-ink-600 md:flex">
          <Link href="/cerca?contratto=vendita" className="hover:text-ink-900">
            Vendita
          </Link>
          <Link href="/cerca?contratto=affitto" className="hover:text-ink-900">
            Affitto
          </Link>
          <Link href="/agenzie" className="hover:text-ink-900">
            Agenzie
          </Link>
          <Link href="/valuta-immobile" className="hover:text-ink-900">
            Valuta il tuo immobile
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <Link href="/preferiti" className="hidden text-sm text-ink-600 hover:text-ink-900 sm:block">
                Preferiti
              </Link>
              <ButtonLink href="/dashboard" variant="secondary" size="sm">
                {session.role === 'USER' ? 'Area personale' : 'Pannello annunci'}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/accedi" variant="ghost" size="sm">
                Accedi
              </ButtonLink>
              <ButtonLink href="/registrati?ruolo=agente" size="sm">
                Pubblica un annuncio
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

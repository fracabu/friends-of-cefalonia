'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useI18n } from '@/i18n/client'

type Voce = { href: string; label: string }

/**
 * Il menù del telefono. Sotto i 768 px l'intestazione non ha spazio per sei
 * voci, la lingua e il tema: si raccolgono qui, in un pannello che scende
 * sotto la fascia blu.
 */
export function MobileMenu({ voci, azioni }: { voci: Voce[]; azioni: Voce[] }) {
  const { d } = useI18n()
  const [aperto, setAperto] = useState(false)

  // Con il pannello aperto la pagina sotto non deve scorrere.
  useEffect(() => {
    document.body.style.overflow = aperto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [aperto])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAperto((v) => !v)}
        aria-expanded={aperto}
        aria-label={aperto ? d.nav.chiudiMenu : d.nav.menu}
        className="grid h-10 w-10 place-items-center rounded-lg text-current hover:bg-white/15"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
          {aperto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {aperto ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-surface text-ink-900">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            <ul className="divide-y divide-ink-100">
              {voci.map((voce) => (
                <li key={voce.href}>
                  <Link
                    href={voce.href}
                    onClick={() => setAperto(false)}
                    className="block py-3.5 text-lg font-medium"
                  >
                    {voce.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              {azioni.map((azione) => (
                <Link
                  key={azione.href}
                  href={azione.href}
                  onClick={() => setAperto(false)}
                  className="rounded-xl bg-brand-600 px-4 py-3 text-center font-medium text-white"
                >
                  {azione.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-6 text-ink-700">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  )
}

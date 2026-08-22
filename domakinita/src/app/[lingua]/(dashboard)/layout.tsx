import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LogoutButton } from '@/components/LogoutButton'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SITE_NAME } from '@/lib/seo'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lingua: string }>
}) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)
  const p = (path: string) => percorso(lingua, path)

  const user = await getCurrentUser()
  if (!user) redirect(p('/accedi?redirect=' + encodeURIComponent(p('/dashboard'))))

  const voci = [
    { href: p('/dashboard'), label: d.dashboard.riepilogo },
    { href: p('/dashboard/annunci'), label: d.dashboard.mieiAnnunci },
    { href: p('/dashboard/richieste'), label: d.dashboard.richieste },
    { href: p('/preferiti'), label: d.nav.preferiti },
    { href: p('/ricerche-salvate'), label: d.nav.ricercheSalvate },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link href={p('/')} className="font-semibold text-ink-900">
            {SITE_NAME}
          </Link>
          <span className="hidden text-sm text-ink-400 sm:block">{d.dashboard.pannello}</span>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <LanguageSwitcher />
            <span className="hidden text-ink-600 sm:block">{user.agency?.name ?? user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
        <nav className="hidden w-56 shrink-0 lg:block">
          <ul className="space-y-1 text-sm">
            {voci.map((voce) => (
              <li key={voce.href}>
                <Link
                  href={voce.href}
                  className="block rounded-lg px-3 py-2 text-ink-600 hover:bg-white hover:text-ink-900"
                >
                  {voce.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

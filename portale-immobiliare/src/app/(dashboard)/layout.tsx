import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LogoutButton } from '@/components/LogoutButton'
import { SITE_NAME } from '@/lib/seo'

const NAV = [
  { href: '/dashboard', label: 'Riepilogo' },
  { href: '/dashboard/annunci', label: 'I miei annunci' },
  { href: '/dashboard/richieste', label: 'Richieste ricevute' },
  { href: '/preferiti', label: 'Preferiti' },
  { href: '/ricerche-salvate', label: 'Ricerche salvate' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/accedi?redirect=/dashboard')

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link href="/" className="font-semibold text-ink-900">
            {SITE_NAME}
          </Link>
          <span className="hidden text-sm text-ink-400 sm:block">Pannello</span>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-ink-600 sm:block">
              {user.agency?.name ?? user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
        <nav className="hidden w-56 shrink-0 lg:block">
          <ul className="space-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block rounded-lg px-3 py-2 text-ink-600 hover:bg-white hover:text-ink-900">
                  {item.label}
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

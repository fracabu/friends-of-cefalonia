import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { linguaSicura } from '@/i18n/config'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lingua: string }>
}) {
  const lingua = linguaSicura((await params).lingua)

  return (
    <div className="flex min-h-screen flex-col">
      <Header lingua={lingua} />
      <main className="flex-1">{children}</main>
      <Footer lingua={lingua} />
    </div>
  )
}

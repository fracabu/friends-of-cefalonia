import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthForm } from '@/components/AuthForm'
import { getDizionario } from '@/i18n'
import { linguaSicura, percorso } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lingua: string }>
}): Promise<Metadata> {
  const d = getDizionario(linguaSicura((await params).lingua))
  return { title: d.auth.accediTitolo }
}

export default async function LoginPage({ params }: { params: Promise<{ lingua: string }> }) {
  const lingua = linguaSicura((await params).lingua)
  const d = getDizionario(lingua)

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-ink-900">{d.auth.accediTitolo}</h1>
      <p className="mt-2 text-sm text-ink-500">{d.auth.accediSotto}</p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-ink-500">
        {d.auth.nonHaiAccount}{' '}
        <Link href={percorso(lingua, '/registrati')} className="font-medium text-brand-700 hover:underline">
          {d.auth.registrati}
        </Link>
      </p>
    </div>
  )
}

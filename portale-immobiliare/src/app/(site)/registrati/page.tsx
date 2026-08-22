import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthForm } from '@/components/AuthForm'

export const metadata: Metadata = { title: 'Registrati' }

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ruolo?: string }>
}) {
  const isAgent = (await searchParams).ruolo === 'agente'

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-ink-900">
        {isAgent ? 'Registra la tua agenzia' : 'Crea il tuo account'}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        {isAgent
          ? 'Pubblica annunci, ricevi le richieste e gestiscile dal pannello.'
          : 'Salva gli immobili che ti piacciono e ricevi avvisi sulle nuove uscite.'}
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
          <AuthForm mode="register" defaultRole={isAgent ? 'AGENT' : 'USER'} />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-ink-500">
        Hai già un account?{' '}
        <Link href="/accedi" className="font-medium text-brand-700 hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  )
}

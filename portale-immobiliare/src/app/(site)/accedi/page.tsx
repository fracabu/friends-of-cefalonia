import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthForm } from '@/components/AuthForm'

export const metadata: Metadata = { title: 'Accedi' }

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-ink-900">Accedi</h1>
      <p className="mt-2 text-sm text-ink-500">
        Ritrova i preferiti, le ricerche salvate e le richieste inviate.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-ink-500">
        Non hai un account?{' '}
        <Link href="/registrati" className="font-medium text-brand-700 hover:underline">
          Registrati
        </Link>
      </p>
    </div>
  )
}

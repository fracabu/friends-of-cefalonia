'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useI18n } from '@/i18n/client'

/** Login e registrazione condividono tutto tranne due campi: un modulo solo. */
export function AuthForm({
  mode,
  defaultRole = 'USER',
}: {
  mode: 'login' | 'register'
  defaultRole?: 'USER' | 'AGENT'
}) {
  const router = useRouter()
  const params = useSearchParams()
  const { lingua, d } = useI18n()
  const [role, setRole] = useState<'USER' | 'AGENT'>(defaultRole)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setErrors({})

    const data = Object.fromEntries(new FormData(event.currentTarget))
    const endpoint = mode === 'login' ? '/api/auth/accedi' : '/api/auth/registrati'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(mode === 'register' ? { ...data, role } : data),
    })

    if (res.ok) {
      const body = await res.json()
      const redirect = params.get('redirect')
      router.push(redirect ?? `/${lingua}${body.role === 'USER' ? '/preferiti' : '/dashboard'}`)
      router.refresh()
      return
    }

    const body = await res.json().catch(() => ({}))
    const flat = body.errors ?? { form: d.auth.erroreGenerico }
    setErrors(
      Object.fromEntries(
        Object.entries(flat).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
      ),
    )
    setPending(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-surface p-6 shadow-card">
      {mode === 'register' ? (
        <>
          <div className="inline-flex w-full rounded-xl bg-ink-100 p-1">
            {(
              [
                ['USER', d.auth.cercoCasa],
                ['AGENT', d.auth.vendo],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={role === value}
                className={
                  role === value
                    ? 'flex-1 rounded-lg bg-surface px-3 py-2 text-sm font-medium shadow-sm'
                    : 'flex-1 rounded-lg px-3 py-2 text-sm text-ink-600'
                }
              >
                {label}
              </button>
            ))}
          </div>

          <Field label={d.auth.nome} htmlFor="name" error={errors.name}>
            <Input id="name" name="name" required autoComplete="name" />
          </Field>

          {role === 'AGENT' ? (
            <Field label={d.auth.nomeAgenzia} htmlFor="agencyName" error={errors.agencyName}>
              <Input id="agencyName" name="agencyName" required />
            </Field>
          ) : null}
        </>
      ) : null}

      <Field label={d.auth.email} htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </Field>

      <Field
        label={d.auth.password}
        htmlFor="password"
        error={errors.password}
        hint={mode === 'register' ? d.auth.passwordNota : undefined}
      >
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </Field>

      {mode === 'register' ? (
        <Field label={d.auth.telefono} htmlFor="phone" error={errors.phone} hint={d.auth.facoltativo}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
      ) : null}

      {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? d.auth.attendi : mode === 'login' ? d.nav.accedi : d.auth.creaAccount}
      </Button>
    </form>
  )
}

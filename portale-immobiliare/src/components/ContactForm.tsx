'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'

/** Il modulo che genera i contatti: è il pezzo che ripaga il portale. */
export function ContactForm({ listingId, agencyName }: { listingId: string; agencyName: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    setErrors({})

    const form = new FormData(event.currentTarget)
    const res = await fetch('/api/richieste', {
      method: 'POST',
      body: form,
    })

    if (res.ok) {
      setState('sent')
      return
    }

    const body = await res.json().catch(() => ({}))
    setErrors(body.errors ?? { form: 'Non è stato possibile inviare la richiesta. Riprova.' })
    setState('idle')
  }

  if (state === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="font-semibold text-emerald-900">Richiesta inviata</h3>
        <p className="mt-2 text-sm text-emerald-800">
          {agencyName} ha ricevuto il tuo messaggio e i tuoi recapiti. Di solito rispondono entro
          un giorno lavorativo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div>
        <h3 className="font-semibold text-ink-900">Richiedi informazioni</h3>
        <p className="mt-1 text-sm text-ink-500">La richiesta arriva a {agencyName}.</p>
      </div>

      <input type="hidden" name="listingId" value={listingId} />

      <Field label="Nome e cognome" htmlFor="lead-name" error={errors.name}>
        <Input id="lead-name" name="name" required autoComplete="name" />
      </Field>

      <Field label="Email" htmlFor="lead-email" error={errors.email}>
        <Input id="lead-email" name="email" type="email" required autoComplete="email" />
      </Field>

      <Field label="Telefono" htmlFor="lead-phone" error={errors.phone} hint="Facoltativo, ma accelera la risposta">
        <Input id="lead-phone" name="phone" type="tel" autoComplete="tel" />
      </Field>

      <Field label="Messaggio" htmlFor="lead-message" error={errors.message}>
        <Textarea
          id="lead-message"
          name="message"
          required
          defaultValue="Buongiorno, sono interessato a questo immobile e vorrei fissare una visita."
        />
      </Field>

      <label className="flex items-start gap-2 text-xs text-ink-500">
        <input type="checkbox" name="privacy" required className="mt-0.5 h-4 w-4 rounded border-ink-300" />
        <span>
          Acconsento al trattamento dei dati per essere ricontattato, come descritto nella{' '}
          <a href="/privacy" className="underline">
            privacy policy
          </a>
          .
        </span>
      </label>

      {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}
      {errors.privacy ? <p className="text-sm text-red-600">{errors.privacy}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={state === 'sending'}>
        {state === 'sending' ? 'Invio…' : 'Invia richiesta'}
      </Button>
    </form>
  )
}

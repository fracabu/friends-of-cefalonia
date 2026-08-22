'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n/client'

export function LogoutButton() {
  const router = useRouter()
  const { lingua, d } = useI18n()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await fetch('/api/auth/esci', { method: 'POST' })
        router.push(`/${lingua}`)
        router.refresh()
      }}
    >
      {d.nav.esci}
    </Button>
  )
}

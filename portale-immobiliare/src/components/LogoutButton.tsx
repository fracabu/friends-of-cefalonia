'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function LogoutButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await fetch('/api/auth/esci', { method: 'POST' })
        router.push('/')
        router.refresh()
      }}
    >
      Esci
    </Button>
  )
}

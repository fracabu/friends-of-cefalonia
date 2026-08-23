/**
 * Le icone della scheda immobile, disegnate a mano e non prese da una libreria:
 * ne servono sei, tutte allo stesso peso di tratto, e una dipendenza in più
 * per sei glifi non si giustifica.
 *
 * Tratto in `currentColor`, dimensione dalla classe: si adattano al testo che
 * accompagnano senza altre regole.
 */
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconaSuperficie({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
    </svg>
  )
}

export function IconaLocali({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 21h18M4 21V7l8-4 8 4v14M10 21v-6h4v6" />
    </svg>
  )
}

export function IconaCamere({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 18h18M3 18v2M21 18v2M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
    </svg>
  )
}

export function IconaBagni({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM7 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />
    </svg>
  )
}

export function IconaPiano({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 20h5v-4h5v-4h5V8h3" />
    </svg>
  )
}

export function IconaCuore({
  className = 'h-5 w-5',
  pieno = false,
}: {
  className?: string
  pieno?: boolean
}) {
  return (
    <svg {...base} fill={pieno ? 'currentColor' : 'none'} strokeWidth={1.8} className={className}>
      <path d="M12 20.5 4.6 13.4a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9a4.6 4.6 0 1 1 6.5 6.5Z" />
    </svg>
  )
}

export function IconaMappa({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 6 9 3Zm0 0v15m6-12v15" />
    </svg>
  )
}

export function IconaElenco({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function IconaLente({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function IconaFreccia({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

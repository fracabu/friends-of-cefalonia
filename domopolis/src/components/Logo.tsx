/**
 * Il marchio: una casa ridotta all'osso, con la porta a forma di Π.
 *
 * Il frontone e i due montanti richiamano il prospetto di un tempio greco
 * senza disegnarlo per intero; la Π è insieme una porta e una lettera, e regge
 * anche a sedici pixel, che è la misura in cui un marchio si vede davvero
 * (la linguetta del browser).
 *
 * Tratto in `currentColor`: eredita il colore del testo, quindi funziona su
 * fondo chiaro e scuro senza una seconda versione.
 */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden focusable="false" className={className}>
      <path
        d="M3.6 14.2 16 4.6l12.4 9.6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.6 13v14.4h18.8V13"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.4 27.4v-8h7.2v8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({
  name,
  className = '',
  markClassName = 'h-8 w-8 text-brand-600',
}: {
  name: string
  className?: string
  markClassName?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="text-lg font-semibold tracking-tight text-ink-900">{name}</span>
    </span>
  )
}

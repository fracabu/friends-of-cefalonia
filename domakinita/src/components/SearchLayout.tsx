/**
 * Su schermo largo elenco e mappa stanno affiancati; sotto i 1080 px la mappa
 * sale sopra i risultati invece di nascondersi, perché è da lì che si disegna
 * la zona.
 */
export function SearchLayout({ results, map }: { results: React.ReactNode; map: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
      <div className="order-2 lg:order-1">{results}</div>
      <aside className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-[7.5rem]">{map}</div>
      </aside>
    </div>
  )
}

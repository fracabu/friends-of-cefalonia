import { useCallback, useEffect, useState } from "react";
import { GALLERY } from "@/data/gallery";

/**
 * Galleria delle fotografie del gruppo.
 *
 * Le immagini arrivano già ridotte e firmate da `scripts/build-gallery.mjs`:
 * qui non si fa altro che disporle e aprirle. In pagina va la miniatura, e
 * la versione grande si scarica solo quando qualcuno la apre davvero — su una
 * connessione in vacanza è la differenza fra una griglia che compare subito e
 * una che arriva a pezzi.
 */
export default function Gallery() {
  const [aperta, setAperta] = useState<number | null>(null);

  const chiudi = useCallback(() => setAperta(null), []);
  const scorri = useCallback((passo: number) => {
    setAperta((i) => (i === null ? null : (i + passo + GALLERY.length) % GALLERY.length));
  }, []);

  /* Tastiera e blocco dello scorrimento valgono solo mentre la foto è aperta:
     agganciarli sempre significherebbe rubare i tasti freccia a chi legge. */
  useEffect(() => {
    if (aperta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") chiudi();
      else if (e.key === "ArrowRight") scorri(1);
      else if (e.key === "ArrowLeft") scorri(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [aperta, chiudi, scorri]);

  /* Finché nessuno ha caricato una foto, la sezione non esiste: meglio
     nessuna galleria che una galleria vuota con il suo titolo. */
  if (GALLERY.length === 0) return null;

  const foto = aperta === null ? null : GALLERY[aperta];

  return (
    <section id="galleria" className="max-w-4xl mx-auto px-5 py-16 scroll-mt-20">
      <p className="mono text-xs tracking-[.3em] text-[#2E93A6] uppercase">Galleria</p>
      <h2 className="display text-3xl md:text-4xl mt-2">L&apos;isola, fotografata</h2>
      <p className="text-[#4A6B75] mt-2 max-w-xl text-sm">
        Scatti degli amministratori e dei membri del gruppo. Portano il nostro marchio:
        si possono guardare e condividere, non rivendere.
      </p>

      {/* Colonne invece di una griglia: le foto tengono le loro proporzioni,
          verticali e orizzontali insieme, senza tagliarle né incolonnarle
          tutte alla stessa altezza. */}
      <div className="mt-8 [column-count:2] md:[column-count:3] [column-gap:14px]">
        {GALLERY.map((s, i) => (
          <button key={s.file} onClick={() => setAperta(i)}
            aria-label={s.alt ? `Apri: ${s.alt}` : `Apri la fotografia ${i + 1} di ${GALLERY.length}`}
            className="shot block w-full mb-3.5 break-inside-avoid overflow-hidden rounded-2xl
                       bg-[#EFF5F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E93A6]">
            <img src={s.mini} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async"
              className="w-full h-auto block" />
          </button>
        ))}
      </div>

      {foto && (
        <div role="dialog" aria-modal="true" aria-label={foto.alt || "Fotografia"}
          onClick={chiudi}
          className="fixed inset-0 z-50 bg-[#0B2630]/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8">
          <img src={foto.file} alt={foto.alt} width={foto.w} height={foto.h}
            onClick={(e) => e.stopPropagation()}
            className="lightbox max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-xl shadow-2xl" />

          {foto.alt && (
            <p className="text-[#A9CDCF] text-sm mt-4 text-center max-w-xl">{foto.alt}</p>
          )}

          <div className="mt-5 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => scorri(-1)} aria-label="Fotografia precedente"
              className="w-11 h-11 rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors">←</button>
            <span className="mono text-[11px] text-[#A9CDCF] tabular-nums w-16 text-center">
              {aperta! + 1} / {GALLERY.length}
            </span>
            <button onClick={() => scorri(1)} aria-label="Fotografia successiva"
              className="w-11 h-11 rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors">→</button>
          </div>

          <button onClick={chiudi} aria-label="Chiudi"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition-colors">
            ×
          </button>
        </div>
      )}
    </section>
  );
}

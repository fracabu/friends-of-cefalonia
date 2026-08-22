import { useState } from "react";
import Fauna from "@/components/Fauna";
import { VIDEO_TARTARUGHE, VIDEO_TARTARUGHE_POSTER, VIDEO_TARTARUGHE_CREDIT } from "@/data/site";

/**
 * Il video delle tartarughe nel porto.
 *
 * Funziona come la fotografia d'apertura: il percorso può stare scritto prima
 * che il file esista, e finché non c'è al suo posto resta una scena animata —
 * acqua, luce e tartarughe che passano. Nessun riquadro rotto, nessun buco
 * nella pagina.
 *
 * Il filmato parte da solo, muto e in ciclo, come si fa con l'ambiente; ma i
 * comandi restano, perché un video che non si può fermare è una piccola
 * prepotenza.
 */
export default function VideoTartarughe() {
  const [mancante, setMancante] = useState(false);
  const fermo = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <figure className="mt-7 relative overflow-hidden rounded-3xl bg-[#0B3A46]">
      {VIDEO_TARTARUGHE && !mancante ? (
        <video
          src={VIDEO_TARTARUGHE}
          poster={VIDEO_TARTARUGHE_POSTER || undefined}
          onError={() => setMancante(true)}
          controls
          playsInline
          muted
          loop
          autoPlay={!fermo}
          preload="metadata"
          className="w-full h-auto max-h-[520px] object-cover block"
        />
      ) : (
        /* La scena di riserva: il fondo del porto visto da sotto il pelo
           dell'acqua, con le stesse tartarughe che attraversano il resto
           della pagina. */
        <div className="relative h-[220px] sm:h-[300px] bg-gradient-to-b from-[#135E73] via-[#0F5265] to-[#0B3A46]">
          <div aria-hidden="true" className="caustics absolute inset-0 opacity-70" />
          <Fauna kind="tartarughe" tone="#FFFFFF" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80 px-6 text-center">
            <span className="mono text-[10px] tracking-[.25em] uppercase">Qui va un video del porto</span>
            <span className="text-xs text-white/55 max-w-xs">
              Basta caricarlo in public/video/ e compare al posto di questa scena.
            </span>
          </div>
        </div>
      )}
      {VIDEO_TARTARUGHE_CREDIT && !mancante && (
        <figcaption className="mono text-[10px] text-[#93A9B0] mt-2 text-right">
          Video: {VIDEO_TARTARUGHE_CREDIT}
        </figcaption>
      )}
    </figure>
  );
}

import { useState } from "react";

/**
 * Una fotografia dentro una sezione, con la stessa regola dell'apertura: il
 * percorso può stare scritto prima che il file esista, e finché manca al suo
 * posto non compare niente invece di un riquadro rotto.
 *
 * Le proporzioni si dichiarano in altezza fissa perché la pagina non salti
 * mentre l'immagine arriva.
 */
export default function FotoSezione({
  src, alt, credito = "", altezza = "h-[200px] sm:h-[280px]", className = "",
}: {
  src: string; alt: string; credito?: string; altezza?: string; className?: string;
}) {
  const [mancante, setMancante] = useState(false);
  if (!src || mancante) return null;

  return (
    <figure className={className}>
      <img src={src} alt={alt} loading="lazy" decoding="async"
        onError={() => setMancante(true)}
        className={`w-full ${altezza} object-cover rounded-3xl`} />
      {credito && (
        <figcaption className="mono text-[10px] text-[#93A9B0] mt-2 text-right">
          Foto: {credito}
        </figcaption>
      )}
    </figure>
  );
}

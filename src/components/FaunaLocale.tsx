import { TARTARUGHE, REGOLE, STAGIONE, ALTRE } from "@/data/fauna";
import { FOTO_TARTARUGHE, FOTO_TARTARUGHE_CREDITO } from "@/data/site";
import FotoSezione from "@/components/FotoSezione";
import VideoTartarughe from "@/components/VideoTartarughe";
/* Da non confondere con `Fauna`, che è lo strato animato di sfondo: questa è
   la sezione che parla degli animali veri. */
import Fauna from "@/components/Fauna";

export default function FaunaLocale() {
  return (
    <section id="fauna" className="relative overflow-hidden scroll-mt-16">
      <Fauna kind="tartarughe" tone="#7FC3C9" />

      <div className="relative max-w-4xl mx-auto px-5 py-16">
        <p className="mono text-xs tracking-[.3em] text-[#2E93A6] uppercase">La fauna dell&apos;isola</p>
        <h2 className="display text-3xl md:text-4xl mt-2">{TARTARUGHE.titolo}</h2>
        <p className="mono text-xs text-[#93A9B0] mt-2 italic">{TARTARUGHE.latino}</p>

        <FotoSezione src={FOTO_TARTARUGHE} credito={FOTO_TARTARUGHE_CREDITO}
          alt="Una Caretta caretta affiora nel porto di Argostoli"
          altezza="h-[240px] sm:h-[360px] lg:h-[420px]" className="mt-7" />

        <p className="text-[#4A6B75] mt-6 max-w-2xl text-base sm:text-lg">{TARTARUGHE.apertura}</p>
        <p className="text-[#4A6B75] mt-4 max-w-2xl">{TARTARUGHE.seconda}</p>

        {/* ===== LE REGOLE ===== */}
        {/* Riquadro a sé, e scuro: è l'unica parte della pagina che, se
            ignorata, fa un danno vero a qualcosa di vivo. */}
        <div className="mt-10 rounded-3xl bg-[#0F3440] text-white p-6 sm:p-8">
          <p className="mono text-xs tracking-[.3em] text-[#D9A441] uppercase">Come comportarsi</p>
          <h3 className="display text-2xl mt-2">Quattro regole, e la prima vale per tutte</h3>
          <ul className="mt-5 space-y-3">
            {REGOLE.map((r, i) => (
              <li key={i} className="flex gap-3 text-[#A9CDCF] text-sm">
                <span className="mono text-[#D9A441] shrink-0 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#7FA8AE] mt-6 border-t border-white/10 pt-4">{STAGIONE}</p>
        </div>

        <VideoTartarughe />

        {/* ===== LE ALTRE ===== */}
        <h3 className="display text-2xl mt-14">Le altre dell&apos;isola</h3>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {ALTRE.map((s) => (
            <li key={s.nome} className="rounded-2xl border border-[#E4EDEC] bg-white p-4">
              <p className="font-medium text-[#0F3440]">{s.nome}</p>
              {s.latino && <p className="mono text-[11px] text-[#93A9B0] italic mt-0.5">{s.latino}</p>}
              <p className="text-sm text-[#4A6B75] mt-1.5">{s.testo}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

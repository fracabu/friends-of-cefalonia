import { PIATTI, PRODOTTI, VINO, CONSIGLI } from "@/data/cucina";
import { FOTO_VINI, FOTO_VINI_CREDITO } from "@/data/site";
import FotoSezione from "@/components/FotoSezione";
import Fauna from "@/components/Fauna";

/**
 * Cosa mangiare e cosa bere.
 *
 * Piatti e prodotti, non locali: la pagina dichiara di non essere sponsorizzata
 * da nessuno, e consigliare taverne per nome è il primo passo per smettere di
 * poterlo dire. Chi sa cosa cercare la taverna la trova.
 */
function Elenco({ voci }: { voci: typeof PIATTI }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {voci.map((v) => (
        <li key={v.nome} className="rounded-2xl border border-[#E4EDEC] bg-white p-4">
          <p className="font-medium text-[#0F3440]">
            {v.nome}
            {v.greco && <span className="mono text-xs text-[#93A9B0] ml-2">{v.greco}</span>}
          </p>
          <p className="text-sm text-[#4A6B75] mt-1">{v.testo}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Cucina() {
  return (
    <section id="cucina" className="max-w-4xl mx-auto px-5 py-16 scroll-mt-20">
      <p className="mono text-xs tracking-[.3em] text-[#2E93A6] uppercase">A tavola</p>
      <h2 className="display text-3xl md:text-4xl mt-2">Cosa mangiare, cosa bere</h2>
      <p className="text-[#4A6B75] mt-2 max-w-xl text-sm">
        Nessun nome di taverna, qui: la pagina non è sponsorizzata da nessuno e vogliamo
        continuare a poterlo dire. Questi sono i piatti e i prodotti da cercare — il posto
        dove mangiarli si trova da sé.
      </p>

      <div className="mt-10">
        <h3 className="display text-2xl">I piatti dell&apos;isola</h3>
        <Elenco voci={PIATTI} />
      </div>

      {/* ===== IL VINO ===== */}
      <div className="mt-12 relative overflow-hidden rounded-3xl bg-[#FDF8EE] border-2 border-[#D9A441]/40 p-6 sm:p-8">
        <Fauna kind="capre" tone="#B8892C" />
        <div className="relative">
          <FotoSezione src={FOTO_VINI} credito={FOTO_VINI_CREDITO}
            alt="Vigne di Robola a Cefalonia"
            altezza="h-[190px] sm:h-[260px]" className="mb-6" />
          <p className="mono text-xs tracking-[.3em] text-[#B8892C] uppercase">Il vino</p>
          <h3 className="display text-2xl md:text-3xl mt-2 text-[#0F3440]">
            {VINO.titolo}
            <span className="mono text-sm text-[#B8892C] ml-3">{VINO.greco}</span>
          </h3>
          <p className="text-[#4A6B75] mt-3 max-w-2xl">{VINO.testo}</p>
          <p className="text-[#4A6B75] mt-3 max-w-2xl">{VINO.testo2}</p>
          <p className="text-sm text-[#93A9B0] mt-4 max-w-2xl">{VINO.nota}</p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="display text-2xl">Da portare a casa</h3>
        <Elenco voci={PRODOTTI} />
      </div>

      <div className="mt-12 rounded-3xl bg-[#0F3440] text-white p-6 sm:p-8">
        <p className="mono text-xs tracking-[.3em] text-[#D9A441] uppercase">Come si fa</p>
        <h3 className="display text-2xl mt-2">Sei cose che cambiano la cena</h3>
        <ul className="mt-5 space-y-3">
          {CONSIGLI.map((c, i) => (
            <li key={i} className="flex gap-3 text-[#A9CDCF] text-sm">
              <span className="mono text-[#D9A441] shrink-0 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

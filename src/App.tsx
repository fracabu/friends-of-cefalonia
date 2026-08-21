import { useEffect, useRef } from "react";
import { SECTIONS } from "@/data/links";
import { FACEBOOK_URL, CAPRA_IONIA_URL, GROUP_MEMBERS } from "@/data/site";
import Quiz from "@/components/Quiz";

/* ================= LOGO ================= */
function Mark({ size = 40, stroke = "#0F3440" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="27" stroke={stroke} strokeWidth="2.4" />
      <path d="M14 38 C21 30, 27 42, 34 34 C40 27, 45 37, 51 31"
        stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 22 L32 14 L40 22" stroke="#D9A441" strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Comparsa progressiva alla prima visualizzazione. */
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#24424C]">
      <header className="sticky top-0 z-40 bg-[#FDFDFB]/90 backdrop-blur border-b border-[#E4EDEC]">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center gap-3">
          <Mark size={32} />
          <span className="display text-lg tracking-wide">FRIENDS OF CEFALONIA</span>
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer"
            className="ml-auto mono text-xs rounded-full px-4 py-2 bg-[#1877F2] text-white hover:bg-[#1668d6] transition-colors">
            Il gruppo →
          </a>
        </div>
      </header>

      {/* ===== APERTURA ===== */}
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-12">
        <p className="mono text-xs tracking-[.3em] text-[#2E93A6] uppercase">Isole Ionie · Grecia</p>
        <h1 className="display text-[clamp(38px,7vw,68px)] leading-[1.03] mt-3">
          Tutto quello che serve sapere <em className="not-italic text-[#135E73]">prima di venire</em> a Cefalonia.
        </h1>
        <p className="mt-6 text-[#4A6B75] text-lg max-w-2xl">
          Siamo {GROUP_MEMBERS} persone che l&apos;isola la conoscono, ci vivono o ci tornano ogni anno.
          Questa pagina raccoglie quello che ci chiedete più spesso: come arrivare, cosa sapere
          sulle tartarughe, i numeri utili. Niente pubblicità, niente affiliazioni.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#risorse"
            className="rounded-full h-12 px-7 flex items-center bg-[#0F3440] text-white hover:bg-[#14495a] transition-colors">
            Le risorse
          </a>
          <a href="#quiz"
            className="rounded-full h-12 px-7 flex items-center border border-[#CADEDD] text-[#135E73] hover:border-[#2E93A6] transition-colors">
            Quanto conosci l&apos;isola?
          </a>
        </div>
      </section>

      <div className="h-1.5 bg-[repeating-linear-gradient(90deg,#D9A441_0_10px,transparent_10px_20px)]" />

      {/* ===== RISORSE ===== */}
      <section id="risorse" className="max-w-4xl mx-auto px-5 py-16">
        <p className="mono text-xs tracking-[.3em] text-[#2E93A6] uppercase">Risorse</p>
        <h2 className="display text-3xl md:text-4xl mt-2">Link utili, verificati</h2>
        <p className="text-[#4A6B75] mt-2 max-w-xl text-sm">
          Orari e tratte cambiano di stagione: usa questi come punto di partenza e conferma sempre
          sul sito ufficiale prima di prenotare.
        </p>

        <div className="mt-10 space-y-12">
          {SECTIONS.map((s) => (
            <Reveal key={s.id}>
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5" aria-hidden>{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="display text-2xl">{s.title}</h3>
                  <p className="text-[#4A6B75] text-sm mt-1.5 max-w-2xl">{s.intro}</p>
                  <ul className="mt-5 space-y-2.5">
                    {s.links.map((l) => (
                      <li key={l.url}>
                        <a href={l.url} target="_blank" rel="noreferrer"
                          className="block rounded-2xl border border-[#E4EDEC] hover:border-[#2E93A6] bg-white p-4 transition-colors group">
                          <span className="font-medium text-[#0F3440] group-hover:text-[#135E73]">
                            {l.name} <span className="text-[#93A9B0] font-normal">↗</span>
                          </span>
                          <span className="block text-sm text-[#4A6B75] mt-1">{l.note}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== QUIZ ===== */}
      <section id="quiz" className="bg-[#0F3440] py-16">
        <div className="max-w-xl mx-auto px-5">
          <p className="mono text-xs tracking-[.3em] text-[#D9A441] uppercase">Quiz</p>
          <h2 className="display text-3xl md:text-4xl mt-2 text-white">Quanto conosci Cefalonia?</h2>
          <p className="text-[#A9CDCF] mt-2 text-sm">
            Otto domande. Dopo ognuna ti diciamo il perché, così qualcosa te la porti via comunque.
          </p>
          <div className="mt-8 bg-[#FDFDFB] rounded-3xl p-6 md:p-8">
            <Quiz />
          </div>
        </div>
      </section>

      {/* ===== GRUPPO ===== */}
      <section className="max-w-4xl mx-auto px-5 py-16">
        <Reveal>
          <div className="rounded-3xl bg-gradient-to-r from-[#135E73] to-[#2E93A6] text-white p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
            <Mark size={64} stroke="#FFFFFF" />
            <div className="flex-1 text-center md:text-left">
              <h3 className="display text-2xl">Il gruppo è il posto dove si risponde</h3>
              <p className="text-sm text-[#D8ECEC] mt-1">
                Domande sull&apos;isola, consigli, chi cerca un passaggio dal porto. {GROUP_MEMBERS} persone.
              </p>
            </div>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer"
              className="rounded-full h-12 px-8 flex items-center bg-white text-[#135E73] hover:bg-[#EFF5F4] font-semibold transition-colors shrink-0">
              Entra nel gruppo →
            </a>
          </div>
        </Reveal>
      </section>

      {/* ===== CAPRA IONIA ===== */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <Reveal>
          <div className="rounded-3xl border border-[#E4EDEC] bg-white p-8">
            <p className="mono text-xs tracking-[.3em] text-[#93A9B0] uppercase">Dai un&apos;occhiata anche a</p>
            <h3 className="display text-2xl mt-2">Stai pensando di comprare un terreno?</h3>
            <p className="text-[#4A6B75] text-sm mt-2 max-w-xl">
              Capra Ionia è il nostro portale sui terreni edificabili a Cefalonia: annunci ordinati
              per €/m², una mappa, e sette guide gratuite sulla burocrazia greca tradotte in italiano
              — codice fiscale, permesso edilizio, costi e tasse.
            </p>
            <a href={CAPRA_IONIA_URL} target="_blank" rel="noreferrer"
              className="inline-flex items-center mt-5 mono text-sm text-[#135E73] hover:text-[#0F3440]">
              Vai a Capra Ionia →
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="bg-[#0F3440] text-[#A9CDCF] py-10">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center gap-3">
            <Mark size={28} stroke="#FDFDFB" />
            <span className="display text-lg text-white tracking-wide">FRIENDS OF CEFALONIA</span>
          </div>
          <p className="text-xs mt-4 leading-relaxed max-w-2xl">
            Pagina informativa curata dalla community. I link portano a siti di terzi, di cui non
            controlliamo i contenuti; orari, tratte e tariffe vanno sempre verificati alla fonte.
            Non riceviamo commissioni da nessuno dei servizi elencati.
          </p>
        </div>
      </footer>
    </div>
  );
}

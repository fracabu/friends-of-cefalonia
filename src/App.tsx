import { useEffect, useRef } from "react";
import { SECTIONS } from "@/data/links";
import { FACEBOOK_URL, CAPRA_IONIA_URL, GROUP_MEMBERS, HERO_PHOTO, HERO_PHOTO_CREDIT } from "@/data/site";
import Quiz from "@/components/Quiz";

/* ================= LOGO ================= */
/* Caretta caretta stilizzata: le tartarughe del porto di Argostoli sono il
   simbolo dell'isola per chi ci viene, e la ragione per cui esiste la
   sezione più importante di questa pagina. Tracciata a mano, non ripresa
   da nessuna fonte. */
function Mark({ size = 40, stroke = "#0F3440" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* Carapace */}
      <ellipse cx="32" cy="34" rx="16" ry="14" stroke={stroke} strokeWidth="2.6" />
      {/* Scudi del carapace */}
      <path d="M32 20.5 V47.5 M18.5 29 H45.5 M20 40 H44"
        stroke={stroke} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      {/* Testa: tonda, con l'occhio — è ciò che la rende leggibile a 32 px */}
      <path d="M32 21 C27.5 19, 26 14, 28.5 11 C31.5 8, 35.5 9, 36.5 12.5 C37.5 16, 35.5 19.5, 32 21 Z"
        stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="34" cy="13.5" r="1.5" fill={stroke} />
      {/* Pinne anteriori, quelle che danno il movimento */}
      <path d="M18 27 C12 21, 7 21, 5 25 C7 29, 13 30, 18 29"
        stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M46 27 C52 21, 57 21, 59 25 C57 29, 51 30, 46 29"
        stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      {/* Pinne posteriori */}
      <path d="M21 44 C17 48, 15 52, 17 55 C21 54, 24 50, 25 46"
        stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M43 44 C47 48, 49 52, 47 55 C43 54, 40 50, 39 46"
        stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
      {/* L'onda sotto, nel giallo del marchio */}
      <path d="M12 59 C18 56, 22 62, 28 59 C34 56, 38 62, 44 59 C48 57, 50 58, 52 59"
        stroke="#D9A441" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* Marchio Facebook, tracciato ufficiale. Serve a far capire dove porta il
   pulsante: senza, «Il gruppo» non dice su quale piattaforma si finisce. */
function FacebookMark({ size = 20, fill = "currentColor" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96H15.83c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
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
        <div className="max-w-4xl mx-auto px-4 sm:px-5 h-16 flex items-center gap-2 sm:gap-3">
          <Mark size={32} />
          <span className="display text-[15px] sm:text-lg tracking-wide truncate">
            FRIENDS OF CEFALONIA
          </span>
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer"
            aria-label={`Vai al gruppo Facebook, ${GROUP_MEMBERS} iscritti`}
            className="ml-auto shrink-0 group flex items-center gap-2 sm:gap-2.5 rounded-full pl-2.5 pr-3.5 sm:pl-3 sm:pr-4 py-2
                       bg-[#1877F2] text-white shadow-sm
                       hover:bg-[#1668d6] hover:shadow-md hover:-translate-y-px
                       active:translate-y-0 transition-all duration-150">
            <FacebookMark size={22} />
            <span className="leading-tight text-left">
              <span className="block text-sm font-semibold">Il gruppo</span>
              {/* Il numero sta qui e non nel testo: è la ragione per cui si clicca. */}
              <span className="hidden sm:block mono text-[10px] text-white/75 tracking-wide">
                {GROUP_MEMBERS} iscritti
              </span>
            </span>
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
          sulle tartarughe, i numeri utili.
        </p>
        <p className="mt-3 text-sm text-[#93A9B0] max-w-2xl">
          È curata da chi sta dietro a{" "}
          <a href={CAPRA_IONIA_URL} target="_blank" rel="noreferrer"
            className="text-[#135E73] underline underline-offset-2 hover:text-[#0F3440]">
            Capra Ionia
          </a>
          , il portale sui terreni edificabili a Cefalonia. Nessun link qui sotto è sponsorizzato:
          non prendiamo commissioni da traghetti, alloggi o servizi.
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

        {/* Fotografia di apertura: se non c'è, un riquadro dichiaratamente
            grafico invece di un'immagine finta o di uno spazio vuoto. */}
        <div className="mt-10">
          {HERO_PHOTO ? (
            <figure>
              <img src={HERO_PHOTO} alt="Cefalonia"
                className="w-full h-[280px] sm:h-[420px] object-cover rounded-3xl" />
              {HERO_PHOTO_CREDIT && (
                <figcaption className="mono text-[10px] text-[#93A9B0] mt-2 text-right">
                  Foto: {HERO_PHOTO_CREDIT}
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="w-full h-[220px] sm:h-[320px] rounded-3xl bg-gradient-to-br from-[#135E73] via-[#2E93A6] to-[#7FC3C9]
                            flex flex-col items-center justify-center gap-3 text-white">
              <Mark size={72} stroke="#FFFFFF" />
              <span className="mono text-[10px] tracking-[.25em] uppercase opacity-70">
                Qui va una foto dell&apos;isola
              </span>
            </div>
          )}
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

      {/* ===== PONTE: DALLA VACANZA ALL'IDEA DI RESTARE ===== */}
      <section className="max-w-4xl mx-auto px-5 pb-4">
        <Reveal>
          <div className="rounded-3xl border-2 border-[#D9A441]/40 bg-[#FDF8EE] p-8 md:p-10">
            <p className="mono text-xs tracking-[.3em] text-[#B8892C] uppercase">Succede spesso</p>
            <h3 className="display text-2xl md:text-3xl mt-2 text-[#0F3440]">
              Vieni una settimana, e cominci a guardare i cartelli «πωλείται»
            </h3>
            <p className="text-[#4A6B75] mt-3 max-w-2xl">
              Capita a molti nel gruppo: si torna una seconda volta, poi una terza, e a un certo
              punto ci si chiede quanto costerebbe un pezzo di terra qui. La risposta, spesso, è
              meno di quanto si immagini — a Cefalonia ci sono terreni edificabili sotto i
              50.000 €. Il difficile non è il prezzo: è la burocrazia greca.
            </p>
            <p className="text-[#4A6B75] mt-3 max-w-2xl">
              Per quello abbiamo fatto <b>Capra Ionia</b>: annunci ordinati per €/m², una mappa
              dell&apos;isola, e sette guide gratuite che spiegano in italiano codice fiscale,
              permesso edilizio, costi e tasse.
            </p>
            <a href={CAPRA_IONIA_URL} target="_blank" rel="noreferrer"
              className="inline-flex items-center h-12 px-7 mt-6 rounded-full bg-[#0F3440] text-white hover:bg-[#14495a] transition-colors">
              Guarda i terreni a Cefalonia →
            </a>
          </div>
        </Reveal>
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
              <h3 className="display text-2xl">Il gruppo è fatto di fotografie</h3>
              <p className="text-sm text-[#D8ECEC] mt-1">
                Spiagge, calette, luci del mattino. Nessun testo, nessun annuncio: solo Cefalonia
                come la vedono {GROUP_MEMBERS} persone che la amano.
              </p>
            </div>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer"
              className="rounded-full h-12 px-7 flex items-center gap-2.5 bg-white text-[#1877F2] hover:bg-[#EFF5F4] font-semibold transition-colors shrink-0">
              <FacebookMark size={20} />
              Entra nel gruppo
            </a>
          </div>
        </Reveal>
      </section>

      {/* ===== CAPRA IONIA ===== */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <Reveal>
          <div className="rounded-3xl bg-[#0F3440] text-white p-8 md:p-10">
            <p className="mono text-xs tracking-[.3em] text-[#D9A441] uppercase">Il nostro portale</p>
            <h3 className="display text-2xl md:text-3xl mt-2">Terreni edificabili a Cefalonia</h3>
            <p className="text-[#A9CDCF] mt-3 max-w-2xl">
              Selezioniamo terreni fra i 23.000 e i 45.000 €, li ordiniamo per prezzo al metro
              quadro — il modo più onesto di confrontarli — e diciamo apertamente quali scartare
              e perché. Le guide sulla burocrazia sono gratuite e non chiedono nulla in cambio
              se non un indirizzo email.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={CAPRA_IONIA_URL} target="_blank" rel="noreferrer"
                className="inline-flex items-center h-12 px-7 rounded-full bg-white text-[#0F3440] hover:bg-[#EFF5F4] font-semibold transition-colors">
                Vai a Capra Ionia →
              </a>
              <a href={`${CAPRA_IONIA_URL}#/guide`} target="_blank" rel="noreferrer"
                className="inline-flex items-center h-12 px-7 rounded-full border border-[#2E93A6] text-[#A9CDCF] hover:text-white hover:border-white transition-colors">
                Le guide gratuite
              </a>
            </div>
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
            Pagina informativa curata dal team di Capra Ionia, portale di intermediazione
            immobiliare a Cefalonia, insieme al gruppo Facebook. I link portano a siti di terzi,
            di cui non controlliamo i contenuti; orari, tratte e tariffe vanno sempre verificati
            alla fonte. Nessuno dei servizi elencati ci paga: non ci sono link affiliati né
            sponsorizzazioni.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

/**
 * Fauna di sfondo: le tartarughe del porto e le capre dell'entroterra.
 *
 * Sono decorazione, non contenuto: `aria-hidden`, senza eventi del mouse, e
 * mai sopra al testo. Si muovono solo con `transform` e `opacity`, le due
 * proprietà che il browser affida alla scheda grafica — su un telefono in
 * vacanza questa è la differenza fra un'animazione e una stufa.
 *
 * Ogni strato si ferma quando esce dallo schermo: tenere in moto quello che
 * nessuno guarda è il modo più sicuro di scaricare una batteria.
 */

type Kind = "tartarughe" | "capre";

/* Tartaruga di profilo, in nuoto. È volutamente diversa dal marchio, che la
   guarda dall'alto: di lato si legge il movimento delle pinne, dall'alto no. */
function Turtle({ tone }: { tone: string }) {
  return (
    <svg viewBox="0 0 140 90" fill="none" aria-hidden="true" className="w-full h-full">
      {/* Carapace */}
      <ellipse cx="74" cy="46" rx="34" ry="22" stroke={tone} strokeWidth="2.4" />
      {/* Scudi: tre archi, quanto basta a dire che è un carapace */}
      <path d="M52 33 C60 44, 60 50, 52 60 M74 26 C70 38, 70 55, 74 66 M96 33 C88 44, 88 50, 96 60"
        stroke={tone} strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
      {/* Collo e testa, protesi in avanti */}
      <path d="M41 42 C32 38, 24 37, 19 40 C16 42, 16 46, 19 48 C25 51, 34 50, 41 47"
        stroke={tone} strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="24" cy="42.5" r="1.6" fill={tone} />
      {/* Pinna anteriore: è questa che batte */}
      <g className="fauna-flap" style={{ transformOrigin: "58px 34px" }}>
        <path d="M58 34 C50 20, 38 12, 30 14 C27 20, 36 32, 50 39"
          stroke={tone} strokeWidth="2.4" strokeLinejoin="round" />
      </g>
      {/* Pinna anteriore lontana, più tenue: dà profondità */}
      <g className="fauna-flap fauna-flap--late" style={{ transformOrigin: "66px 58px" }}>
        <path d="M66 58 C58 70, 48 76, 41 74 C39 69, 47 60, 58 55"
          stroke={tone} strokeWidth="2" strokeLinejoin="round" opacity=".65" />
      </g>
      {/* Pinna posteriore e coda */}
      <path d="M104 58 C110 64, 116 66, 119 63 C118 58, 112 54, 106 53"
        stroke={tone} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M108 44 C114 43, 120 44, 123 46"
        stroke={tone} strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

/* Capra dell'isola, di profilo. Le corna all'indietro e la barbetta sono i
   due tratti che la distinguono da una pecora a colpo d'occhio. */
function Goat({ tone }: { tone: string }) {
  return (
    <svg viewBox="0 0 140 100" fill="none" aria-hidden="true" className="w-full h-full">
      {/* Dorso e groppa */}
      <path d="M36 46 C44 36, 62 33, 80 35 C94 36, 102 40, 106 46"
        stroke={tone} strokeWidth="2.4" strokeLinecap="round" />
      {/* Pancia */}
      <path d="M40 52 C52 64, 92 64, 104 52"
        stroke={tone} strokeWidth="2.4" strokeLinecap="round" />
      {/* Collo e testa */}
      <path d="M36 46 C30 42, 26 36, 25 30 C24 25, 27 22, 31 23 C35 24, 37 28, 37 33"
        stroke={tone} strokeWidth="2.4" strokeLinejoin="round" />
      {/* Muso */}
      <path d="M25 30 C21 28, 17 28, 15 31 C14 34, 17 36, 21 35"
        stroke={tone} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="24" cy="28" r="1.4" fill={tone} />
      {/* Corna, arcuate all'indietro */}
      <path d="M29 22 C30 15, 36 10, 43 10 M33 22 C35 16, 40 13, 45 14"
        stroke={tone} strokeWidth="2" strokeLinecap="round" />
      {/* Barbetta */}
      <path d="M20 36 C19 40, 20 43, 22 45" stroke={tone} strokeWidth="1.8" strokeLinecap="round" opacity=".8" />
      {/* Zampe: le due davanti si alternano nel passo */}
      <g className="fauna-step" style={{ transformOrigin: "46px 58px" }}>
        <path d="M46 58 L44 78 M44 78 L48 80" stroke={tone} strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <g className="fauna-step fauna-step--late" style={{ transformOrigin: "58px 60px" }}>
        <path d="M58 60 L57 78 M57 78 L61 80" stroke={tone} strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
      </g>
      <g className="fauna-step fauna-step--late" style={{ transformOrigin: "90px 60px" }}>
        <path d="M90 60 L89 78 M89 78 L93 80" stroke={tone} strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
      </g>
      <g className="fauna-step" style={{ transformOrigin: "100px 58px" }}>
        <path d="M100 58 L100 78 M100 78 L104 80" stroke={tone} strokeWidth="2.2" strokeLinecap="round" />
      </g>
      {/* Coda corta, all'insù */}
      <path d="M106 46 C110 43, 113 43, 115 45" stroke={tone} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Tre esemplari, mai allineati: quote, andature e ritardi diversi, altrimenti
   si legge la ripetizione invece del movimento. */
/* `verso` tiene insieme due cose che devono sempre concordare: da che parte
   guarda il disegno e da che parte attraversa lo schermo. Separarle vuol dire
   prima o poi una tartaruga che nuota all'indietro. */
const TRACKS = [
  { top: "12%", size: 150, dur: 46, delay: 0, opacity: 0.22, verso: "destra" },
  { top: "48%", size: 104, dur: 63, delay: -18, opacity: 0.17, verso: "sinistra" },
  { top: "74%", size: 190, dur: 78, delay: -37, opacity: 0.13, verso: "destra" },
] as const;

export default function Fauna({ kind, tone = "#2E93A6" }: { kind: Kind; tone?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visibile, setVisibile] = useState(false);

  /* Le animazioni CSS continuano anche fuori dallo schermo: qui vengono messe
     in pausa, così scorrere la pagina non lascia dietro di sé mezza dozzina di
     animazioni che nessuno vedrà più. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisibile(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true"
      data-attivo={visibile ? "si" : "no"}
      className="fauna pointer-events-none absolute inset-0 overflow-hidden select-none">
      {TRACKS.map((t, i) => (
        <div key={i} className="fauna-track absolute"
          style={{
            top: t.top,
            width: t.size,
            height: t.size * 0.7,
            opacity: t.opacity,
            ["--dur" as string]: `${t.dur}s`,
            ["--delay" as string]: `${t.delay}s`,
            /* I disegni guardano a sinistra: specchiarli è ciò che li fa
               guardare dove stanno andando. */
            ["--flip" as string]: t.verso === "destra" ? "-1" : "1",
            ["--dir" as string]: t.verso === "destra" ? "normal" : "reverse",
          }}>
          <div className="fauna-bob w-full h-full">
            {kind === "tartarughe" ? <Turtle tone={tone} /> : <Goat tone={tone} />}
          </div>
        </div>
      ))}
    </div>
  );
}

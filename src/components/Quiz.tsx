import { useState } from "react";
import { QUESTIONS } from "@/data/quiz";

export default function Quiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[i];

  function choose(k: number) {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= QUESTIONS.length) return setDone(true);
    setI(i + 1);
    setPicked(null);
  }

  function restart() {
    setI(0); setPicked(null); setScore(0); setDone(false);
  }

  if (done) {
    const verdict =
      score === QUESTIONS.length ? "Conosci l'isola meglio di molti che ci vivono."
      : score >= QUESTIONS.length - 2 ? "Ci sei quasi: ti manca qualche dettaglio."
      : score >= QUESTIONS.length / 2 ? "Buona base. Il resto lo impari arrivando."
      : "Hai tutto da scoprire — che è il modo migliore di partire.";
    return (
      <div className="text-center py-10">
        <p className="mono text-xs tracking-[.3em] text-[#2E93A6] uppercase">Risultato</p>
        <p className="display text-5xl mt-3 text-[#0F3440]">{score} / {QUESTIONS.length}</p>
        <p className="text-[#4A6B75] mt-3 max-w-sm mx-auto">{verdict}</p>
        <button onClick={restart}
          className="mt-6 mono text-xs rounded-full px-5 py-2.5 border border-[#CADEDD] text-[#135E73] hover:border-[#2E93A6] transition-colors">
          Rifallo ↻
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1 bg-[#E4EDEC] rounded-full overflow-hidden">
          <div className="h-full bg-[#2E93A6] transition-all duration-300"
            style={{ width: `${((i + (picked !== null ? 1 : 0)) / QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="mono text-xs text-[#93A9B0] shrink-0">{i + 1}/{QUESTIONS.length}</span>
      </div>

      <p className="display text-2xl text-[#0F3440]">{q.q}</p>

      <div className="mt-5 space-y-2">
        {q.options.map((opt, k) => {
          const right = k === q.answer;
          const chosen = picked === k;
          // Dopo la risposta si evidenzia quella giusta, non solo l'errore:
          // l'obiettivo è insegnare, non dare un voto.
          const style =
            picked === null ? "border-[#CADEDD] hover:border-[#2E93A6] bg-white"
            : right ? "border-[#2E93A6] bg-[#E2F0EC]"
            : chosen ? "border-[#C0492F] bg-[#F7E2DC]"
            : "border-[#E4EDEC] bg-white opacity-55";
          return (
            <button key={k} onClick={() => choose(k)} disabled={picked !== null}
              className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${style}`}>
              <span className="text-[#24424C]">{opt}</span>
              {picked !== null && right && <span className="float-right text-[#2E93A6]">✓</span>}
              {picked !== null && chosen && !right && <span className="float-right text-[#C0492F]">✕</span>}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-5">
          <p className="text-sm text-[#4A6B75] leading-relaxed bg-[#F2F7F6] rounded-2xl p-4">{q.why}</p>
          <button onClick={next}
            className="mt-4 w-full h-12 rounded-full bg-[#0F3440] hover:bg-[#14495a] text-white mono text-sm tracking-wide transition-colors">
            {i + 1 >= QUESTIONS.length ? "Vedi il risultato →" : "Avanti →"}
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { EMAIL_CONTATTO, MODULO } from "@/data/site";

/* ================= SCRIVICI =================
   Il modulo va al servizio scelto in MODULO, che lo inoltra su EMAIL_CONTATTO.
   Il campo «email» di chi scrive diventa il mittente di risposta, così a una
   richiesta si risponde premendo «Rispondi» invece di ricopiare l'indirizzo.

   Senza servizio configurato la pagina non mostra un modulo che non spedisce:
   mostra il pulsante che apre la posta di chi legge. Vedi MODULO. */

/* I due servizi si somigliano abbastanza da stare dietro le stesse tre righe:
   un indirizzo dove mandare, e per Web3Forms un campo in più nel modulo. Il
   resto — nomi dei campi, esito, errori — è identico. */
function recapito(modulo: NonNullable<typeof MODULO>) {
  return modulo.servizio === "formspree"
    ? `https://formspree.io/f/${modulo.id}`
    : "https://api.web3forms.com/submit";
}

type Esito = "fermo" | "invio" | "fatto" | "errore";

/* Il testo che compare sotto il pulsante. Sta qui e non dentro il ramo del
   JSX perché tre stati su quattro dicono qualcosa e uno tace: scritto in
   linea diventava illeggibile. */
const MESSAGGI: Record<Esito, string> = {
  fermo: "",
  invio: "Invio in corso…",
  fatto: "Ricevuto, grazie. Ti rispondiamo appena possiamo — di solito entro un paio di giorni.",
  errore: `Non siamo riusciti a inviare. Riprova, oppure scrivici direttamente a ${EMAIL_CONTATTO}.`,
};

function PulsanteMail() {
  return (
    <a
      href={`mailto:${EMAIL_CONTATTO}`}
      className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#135E73] text-white hover:bg-[#0F3440] font-semibold transition-colors"
    >
      Scrivici una mail
    </a>
  );
}

export default function Contatti() {
  const [esito, setEsito] = useState<Esito>("fermo");

  async function invia(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const modulo = evento.currentTarget;
    setEsito("invio");
    try {
      const risposta = await fetch(recapito(MODULO!), {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(modulo),
      });
      /* Formspree dice se ha accettato con il codice HTTP, Web3Forms con un
         campo dentro la risposta: perché sia andata bene devono valere
         entrambe. */
      const dati = await risposta.json().catch(() => ({}));
      if (!risposta.ok || dati.success === false) throw new Error("invio rifiutato");
      setEsito("fatto");
      modulo.reset();
    } catch {
      /* Rete assente, servizio giù, quota del mese finita: per chi scrive
         cambia poco, e la via d'uscita è la stessa — l'indirizzo in chiaro
         nel messaggio d'errore. */
      setEsito("errore");
    }
  }

  return (
    <section id="contatti" className="max-w-4xl mx-auto px-5 py-16 scroll-mt-16">
      <p className="mono text-xs tracking-[.3em] text-[#135E73] uppercase">Contatti</p>
      <h2 className="display text-3xl md:text-4xl mt-2 text-[#0F3440]">Scrivici</h2>
      <p className="text-[#4A6B72] mt-2 max-w-2xl">
        Un consiglio sull&apos;isola, una segnalazione da correggere, una richiesta sui terreni:
        scrivi qui e ti rispondiamo alla tua email. Le domande veloci vanno bene anche nel gruppo,
        dove risponde molta più gente di noi.
      </p>

      <div className="mt-8 rounded-3xl border border-[#E4EDEC] bg-white p-6 md:p-8">
        {MODULO ? (
          <form onSubmit={invia} className="grid gap-4">
            <input type="hidden" name="_subject" value="Richiesta dal sito Friends of Cefalonia" />
            {MODULO.servizio === "web3forms" && (
              <input type="hidden" name="access_key" value={MODULO.chiave} />
            )}
            {/* Trappola per i robot: chi compila anche questo campo, che agli
                occhi non esiste, viene scartato. I due servizi si aspettano
                nomi diversi, e tenerli tutti e due non costa nulla. */}
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-[#0F3440]">Come ti chiami</span>
                <input
                  name="name" type="text" required autoComplete="name"
                  className="h-12 rounded-xl border border-[#D6E4E3] px-4 text-[#0F3440] outline-none focus:border-[#2E93A6] focus:ring-2 focus:ring-[#2E93A6]/25 transition"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-[#0F3440]">La tua email</span>
                <input
                  name="email" type="email" required autoComplete="email"
                  className="h-12 rounded-xl border border-[#D6E4E3] px-4 text-[#0F3440] outline-none focus:border-[#2E93A6] focus:ring-2 focus:ring-[#2E93A6]/25 transition"
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-[#0F3440]">Il messaggio</span>
              <textarea
                name="message" required rows={5}
                className="rounded-xl border border-[#D6E4E3] px-4 py-3 text-[#0F3440] outline-none focus:border-[#2E93A6] focus:ring-2 focus:ring-[#2E93A6]/25 transition resize-y"
              />
            </label>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="submit" disabled={esito === "invio"}
                className="h-12 px-7 rounded-full bg-[#135E73] text-white font-semibold hover:bg-[#0F3440] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                Invia la richiesta
              </button>
              {/* aria-live: chi usa un lettore di schermo non vede comparire il
                  testo, va annunciato. */}
              <p
                aria-live="polite"
                className={`text-sm ${esito === "errore" ? "text-[#A33B2E]" : "text-[#4A6B72]"}`}
              >
                {MESSAGGI[esito]}
              </p>
            </div>

            <p className="text-xs text-[#7A9298] mt-1">
              Usiamo quello che scrivi solo per risponderti: niente newsletter, niente liste,
              nessun dato ceduto a terzi.
            </p>
          </form>
        ) : (
          <div className="grid gap-4 justify-items-start">
            <p className="text-[#4A6B72]">
              Scrivici a <span className="font-semibold text-[#0F3440]">{EMAIL_CONTATTO}</span>: il
              pulsante apre il programma di posta del tuo dispositivo con l&apos;indirizzo già
              compilato.
            </p>
            <PulsanteMail />
          </div>
        )}
      </div>
    </section>
  );
}

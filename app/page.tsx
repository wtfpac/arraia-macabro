"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [phase, setPhase] = useState<"login" | "transition" | "invite">("login");
  const [guestName, setGuestName] = useState("");
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [guestId, setGuestId] = useState("");

  async function handleSubmit() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Código inválido. Você não foi convidado pelas forças do além.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }

      setGuestName(data.guest.name);
      setAlreadyResponded(data.alreadyResponded);
      setGuestId(data.guest.id);
      setPhase("transition");
      setTimeout(() => setPhase("invite"), 1200);

    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 overflow-hidden">

      {/* LOGO PACJUNINO */}
      {phase === "login" && (
        <div
          className="text-6xl"
          style={{ fontFamily: "Chunq" }}
        >
          <span style={{ color: "var(--straw)" }}>Pac</span>
          <span style={{ color: "var(--orange)" }}>Junino</span>
        </div>
      )}

      {/* LOGO ARRAIÁ MACABRO — sempre montada após transition */}
      {phase !== "login" && (
        <div
          className="whitespace-nowrap"
          style={{
            fontFamily: "Chunq",
            fontSize: phase === "invite" ? "4.5rem" : "3.5rem",
            marginTop: phase === "invite" ? "-120px" : "0",
            transition: "font-size 1s ease, margin-top 1s ease",
            animation: phase === "transition" ? "slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards" : "none",
          }}
        >
          <span style={{ color: "var(--blood)" }}>Arraiá </span>
          <span style={{ color: "var(--orange)" }}>Macabro</span>
        </div>
      )}

      {/* INPUT */}
      {phase === "login" && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm px-6">
          <input
            type="text"
            placeholder="Digite seu código"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className={`w-full bg-transparent border border-red-900 text-white text-center text-lg tracking-widest px-4 py-3 rounded outline-none focus:border-orange-600 transition-colors uppercase ${shake ? "shake" : ""}`}
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white font-bold py-3 rounded tracking-widest transition-colors"
          >
            {loading ? "VERIFICANDO..." : "ENTRAR"}
          </button>
        </div>
      )}

      {/* CONTEÚDO DO CONVITE */}
      {phase === "invite" && (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6 mt-8">

          {/* Boas vindas */}
          <p
            className="text-center text-lg"
            style={{ fontFamily: "var(--font-cinzel)", color: "var(--bone)" }}
          >
            Bem-vindo ao Arraiá Macabro,
          </p>
          <p
            className="text-center text-2xl"
            style={{ fontFamily: "var(--font-cinzel)", color: "var(--straw)" }}
          >
            {guestName}
          </p>

          {/* Infos */}
          <div className="w-full flex flex-col gap-3">

            <div className="flex justify-between border-b border-red-900 pb-2">
              <span style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>DATA</span>
              <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Sábado, 20 de Junho</span>
            </div>

            <div className="flex justify-between border-b border-red-900 pb-2">
              <span style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>HORA</span>
              <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>20:00</span>
            </div>

            <div className="flex justify-between border-b border-red-900 pb-2">
              <span style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>LOCAL</span>
              <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Enviado após pagamento</span>
            </div>

            <div className="flex justify-between border-b border-red-900 pb-2">
              <span style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>DRESS CODE</span>
              <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Caipira / Terror</span>
            </div>

            <div className="flex justify-between border-b border-red-900 pb-2">
              <span style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>VALOR</span>
              <span style={{ color: "var(--orange)", fontFamily: "var(--font-cinzel)" }}>R$40 antecipado · R$50 na hora</span>
            </div>

          </div>

          {/* Atrações */}
          <div className="w-full flex flex-col gap-3">
            <p style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>ATRAÇÕES</p>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span>🎧</span>
                <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>DJ Bazan</span>
              </div>
              <div className="flex items-center gap-3">
                <span>🍺</span>
                <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Open Chopp</span>
              </div>
              <div className="flex items-center gap-3">
                <span>🥃</span>
                <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Vodka</span>
              </div>
              <div className="flex items-center gap-3">
                <span>⚡</span>
                <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Energético</span>
              </div>
              <div className="flex items-center gap-3">
                <span>🥤</span>
                <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Refrigerante</span>
              </div>
            </div>
          </div>

          {/* Botão WhatsApp */}

          <a href="https://wa.me/5545999414753?text=Olá,%20quero%20confirmar%20minha%20presença%20para%20o%20Arraiá%20Macabro"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center bg-red-900 hover:bg-red-800 text-white font-bold py-3 rounded tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            CONFIRMAR PRESENÇA
          </a>

        </div>
      )}

    </main>
  );
}
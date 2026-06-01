"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [phase, setPhase] = useState<"login" | "transition" | "invite">("login");

  async function handleSubmit() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    // mock por enquanto, trocar pela API depois
    await new Promise((r) => setTimeout(r, 1000));

    if (code.toUpperCase() === "TESTE123") {
      setPhase("transition");
      setTimeout(() => setPhase("invite"), 1200);
    } else {
      setError("Código inválido. Você não foi convidado pelas forças do além.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    setLoading(false);
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
        <div className="flex flex-col items-center gap-4">
          <p className="text-white" style={{ fontFamily: "var(--font-cinzel)" }}>
            conteúdo do convite aqui
          </p>
        </div>
      )}

    </main>
  );
}
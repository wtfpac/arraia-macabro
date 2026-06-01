"use client";

import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    // mock por enquanto, trocar pela API depois
    await new Promise((r) => setTimeout(r, 1000));

    if (code.toUpperCase() === "TESTE123") {
      alert("Código válido! Em breve a transição.");  //tirar esse alerta depois
    } else {
      setError("Código inválido. Você não foi convidado pelas forças do além.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">

      {/* LOGO */}
      <div className="text-6xl" style={{ fontFamily: "Chunq" }}>
        <span style={{ color: "var(--straw)" }}>Pac</span>
        <span style={{ color: "var(--orange)" }}>Junino</span>
      </div>

      {/* INPUT DO CÓDIGO */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-6">
        <input
          type="text"
          placeholder="Digite seu código"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`w-full bg-transparent border border-red-900 text-white text-center text-lg tracking-widest px-4 py-3 rounded outline-none focus:border-orange-600 transition-colors uppercase ${shake ? "shake" : ""}`}        />

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

    </main>
  );
}
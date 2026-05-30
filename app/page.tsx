export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">

      {/* LOGO */}
      <div className="text-6xl font-bold" style={{ fontFamily: "var(--font-creepster)" }}>
        <span style={{ color: "var(--straw)" }}>Pac</span>
        <span style={{ color: "var(--orange)" }}>Junino</span>
      </div>

      {/* INPUT DO CÓDIGO */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-6">
        <input
          type="text"
          placeholder="Digite seu código"
          className="w-full bg-transparent border border-red-900 text-white text-center text-lg tracking-widest px-4 py-3 rounded outline-none focus:border-orange-600 transition-colors"
        />
        <button className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-3 rounded tracking-widest transition-colors">
          ENTRAR
        </button>
      </div>

    </main>
  );
}
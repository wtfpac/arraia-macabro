"use client";

import { useState, useEffect, useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-creative';
import Lottie from "lottie-react";
import skullAnimation from "@/public/animations/skull.json";

export default function Home() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<"login" | "transition" | "invite">("login");
  const [guestName, setGuestName] = useState("");
  const [plusOne, setPlusOne] = useState<boolean | null>(null);
  const [plusOneName, setPlusOneName] = useState("");
  const [plusOnePhone, setPlusOnePhone] = useState("");
  const [responded, setResponded] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 5000);
    const savedCode = localStorage.getItem("arraia_code");
    if (savedCode) {
      setCode(savedCode);
      validateCode(savedCode);
    }
  }, []);

  const particlesInit = useCallback(async (engine: unknown) => {
    await loadSlim(engine as Parameters<typeof loadSlim>[0]);
  }, []);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return value;
  }

  function isValidPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11;
  }

  async function validateCode(codeToValidate: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToValidate.toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        localStorage.removeItem("arraia_code");
        setError("Código inválido. Você não foi convidado pelas forças do além.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      localStorage.setItem("arraia_code", codeToValidate);
      setGuestName(data.guest.name);
      if (data.alreadyResponded) setResponded(true);
      setPhase("transition");
      setTimeout(() => setPhase("invite"), 1200);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!code.trim()) return;
    await validateCode(code);
  }

  async function handleRespond() {
    if (plusOne === true && !isValidPhone(plusOnePhone)) {
      setPhoneError("Número inválido. Use o formato (XX) XXXXX-XXXX");
      return;
    }
    setPhoneError("");
    try {
      await fetch("/api/invite/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toLowerCase(),
          confirmed: true,
          plusOne: plusOne === true,
          plusOneName: plusOne === true ? plusOneName : undefined,
          plusOnePhone: plusOne === true ? plusOnePhone : undefined,
        }),
      });
      setResponded(true);
    } catch {
      console.error("Erro ao registrar resposta");
    }
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-center gap-8 overflow-hidden">

      {/* LOADING */}
      {isLoading && (
        <>
          <div className="fixed inset-0 z-30 bg-white" />
          <div className="fixed inset-0 z-40 bg-black curtain-down" />
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 pointer-events-none">
            <Lottie animationData={skullAnimation} loop={true} style={{ width: 150, height: 150 }} />
            <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-orange-700 rounded-full" style={{ animation: "loadingBar 5s linear forwards" }} />
            </div>
          </div>
        </>
      )}

      {/* PARTÍCULAS */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        options={{
          background: { color: { value: "transparent" } },
          particles: {
            number: { value: 40 },
            color: { value: ["#E8621A", "#8B1A1A", "#C9A84C", "#ff4400"] },
            shape: { type: "circle" },
            opacity: { value: 0.4 },
            size: { value: { min: 1, max: 3 } },
            move: { enable: true, speed: 1.5, direction: "top", outModes: { default: "out" }, random: true, straight: false },
          },
          detectRetina: true,
        }}
      />

      {/* TELA LOGIN */}
      {phase === "login" && (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full px-6 fade-in">
          <img src="/images/logo.png" alt="Arraiá Macabro" className="w-48 sm:w-64 h-auto" />
          <div className="w-full max-w-xs flex flex-col gap-4">
            <input
              type="text"
              placeholder="Digite seu código"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full bg-transparent border border-orange-900 text-white text-center text-base tracking-widest px-4 py-3 rounded outline-none focus:border-orange-600 transition-colors uppercase ${shake ? "shake" : ""}`}
            />
            {error && <p className="text-orange-500 text-sm text-center">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-900 hover:bg-orange-800 disabled:opacity-50 text-white font-bold py-3 rounded tracking-widest transition-colors"
            >
              {loading ? "VERIFICANDO..." : "ENTRAR"}
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO DO CONVITE */}
      {phase === "invite" && (
        <div className="fixed inset-0 z-10 w-full h-full fade-in-fast">
          <Swiper
            direction="vertical"
            slidesPerView={1}
            spaceBetween={0}
            mousewheel={{ sensitivity: 1 }}
            speed={800}
            modules={[Mousewheel, EffectCreative]}
            effect="creative"
            creativeEffect={{
              prev: { translate: [0, '-20%', -1], opacity: 0 },
              next: { translate: [0, '100%', 0], opacity: 1 },
            }}
            className="w-full h-full"
          >
            {/* SLIDE 1 */}
            <SwiperSlide>
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6">
                <img src="/images/logo.png" alt="Arraiá Macabro" className="w-48 sm:w-72 h-auto" />
                <p className="text-center text-base sm:text-xl whitespace-nowrap" style={{ fontFamily: "var(--font-cinzel)", color: "var(--bone)" }}>
                  Olá, <span style={{ color: "var(--straw)", textShadow: "0 0 20px rgba(201,168,76,0.8), 0 0 40px rgba(201,168,76,0.4)" }}>{guestName}</span>, seja bem-vindo(a) ao Arraiá Macabro
                </p>
                <p className="text-center text-sm sm:text-base max-w-sm" style={{ fontFamily: "var(--font-cinzel)", color: "var(--bone)", opacity: 0.8 }}>
                  Em celebração ao meu aniversário, apresento a nova edição do PacJunino — o Arraiá Macabro. Role para descobrir o que está por vir.
                </p>
                <div className="animate-bounce" style={{ color: "#E8621A", fontSize: "1.2rem" }}>▼</div>
              </div>
            </SwiperSlide>

            {/* SLIDE 2 */}
            <SwiperSlide>
              <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-6 overflow-y-auto py-6">
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.4))" }} />
                  <p style={{ color: "#C9A84C", fontSize: "0.8rem", letterSpacing: "0.3em", fontFamily: "var(--font-cinzel)", textShadow: "0 0 20px rgba(201,168,76,0.8)" }}>O QUE TE AGUARDA</p>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,0.4))" }} />
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span style={{ color: "var(--ash)", fontSize: "0.7rem", letterSpacing: "0.3em", fontFamily: "var(--font-cinzel)" }}>HEADLINER</span>
                  <span style={{ color: "#E8621A", fontFamily: "var(--font-cinzel)", fontSize: "1.6rem", textShadow: "0 0 20px rgba(232,98,26,0.5)" }}>DJ Bazan</span>
                </div>

                <div className="w-full max-w-xs flex flex-col gap-2">
                  {["Open Chopp", "Vodka", "Energético", "Refrigerante", "Aperitivos"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span style={{ color: "#E8621A", fontSize: "0.5rem" }}>●</span>
                      <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)", fontSize: "1rem" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full max-w-xs">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.4))" }} />
                  <p style={{ color: "#C9A84C", fontSize: "0.8rem", letterSpacing: "0.3em", fontFamily: "var(--font-cinzel)", textShadow: "0 0 20px rgba(201,168,76,0.8)" }}>A FESTA</p>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,0.4))" }} />
                </div>

                <div className="w-full max-w-xs flex flex-col gap-2">
                  {[
                    { label: "DATA", value: "Sábado, 20 de Junho" },
                    { label: "HORA", value: "19:00" },
                    { label: "LOCAL", value: "Rua Paris, 676" },
                    { label: "DRESS CODE", value: "Caipira / Terror" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between border-b pb-2" style={{ borderColor: "rgba(232,98,26,0.3)" }}>
                      <span style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.15em", fontFamily: "var(--font-cinzel)" }}>{item.label}</span>
                      <span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)", fontSize: "1rem" }}>{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-b pb-2" style={{ borderColor: "rgba(232,98,26,0.3)" }}>
                    <span style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.15em", fontFamily: "var(--font-cinzel)" }}>VALOR</span>
                    <span style={{ color: "#E8621A", fontFamily: "var(--font-cinzel)", fontSize: "1rem" }}>R$50 antec. · R$60 na hora</span>
                  </div>
                </div>

                <div className="animate-bounce" style={{ color: "#E8621A", fontSize: "1.2rem" }}>▼</div>
              </div>
            </SwiperSlide>

            {/* SLIDE 3 */}
            <SwiperSlide>
              <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-6 overflow-y-auto py-6">
                <div className="w-full max-w-xs rounded overflow-hidden" style={{ height: "180px" }}>
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=Rua+Paris,+676,Foz+do+Iguaçu,Paraná`}
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {!responded && (
                  <div className="w-full max-w-xs flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-center" style={{
                        color: "#C9A84C",
                        fontSize: "0.75rem",
                        letterSpacing: "0.2em",
                        fontFamily: "var(--font-cinzel)",
                        textShadow: "0 0 20px rgba(201,168,76,0.8), 0 0 40px rgba(201,168,76,0.4)"
                      }}>
                        DESEJA CONVIDAR ALGUÉM?
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => setPlusOne(true)} className={`flex-1 py-2 rounded border text-sm transition-colors ${plusOne === true ? "border-orange-600 text-orange-500" : "border-orange-900 text-gray-500"}`}>Sim</button>
                        <button onClick={() => setPlusOne(false)} className={`flex-1 py-2 rounded border text-sm transition-colors ${plusOne === false ? "border-orange-600 text-orange-500" : "border-orange-900 text-gray-500"}`}>Não</button>
                      </div>
                    </div>
                    {plusOne === true && (
                      <div className="flex flex-col gap-3">
                        <input type="text" placeholder="Nome do convidado" value={plusOneName} onChange={(e) => setPlusOneName(e.target.value)} className="w-full bg-transparent border border-orange-900 text-white px-4 py-2 rounded outline-none focus:border-orange-600 transition-colors text-sm" />
                        <input type="tel" placeholder="WhatsApp com DDD (ex: 45999999999)" value={plusOnePhone} onChange={(e) => setPlusOnePhone(formatPhone(e.target.value))} className="w-full bg-transparent border border-orange-900 text-white px-4 py-2 rounded outline-none focus:border-orange-600 transition-colors text-sm" />
                        {phoneError && <p className="text-orange-500 text-xs">{phoneError}</p>}
                      </div>
                    )}

                    <a href="https://wa.me/5545999414753?text=Olá%20quero%20confirmar%20minha%20presença%20para%20o%20Arraiá%20Macabro"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => { if (plusOne === true && !isValidPhone(plusOnePhone)) return; handleRespond(); }}
                      className="w-full text-center bg-orange-900 hover:bg-orange-800 text-white font-bold py-3 rounded tracking-widest transition-colors text-sm"
                      style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                      CONFIRMAR PRESENÇA
                    </a>
                  </div>
                )}

                {responded && (
                  <div className="text-center flex flex-col gap-3">
                    <p style={{ fontFamily: "var(--font-cinzel)", color: "var(--straw)", fontSize: "1.1rem" }}>Presença confirmada! 🩸</p>
                    <p style={{ color: "var(--ash)", fontSize: "0.85rem" }}>Aguarde o contato com as informações de pagamento.</p>
                  </div>
                )}
              </div>
            </SwiperSlide>

          </Swiper>
        </div>
      )}

    </main>
  );
}
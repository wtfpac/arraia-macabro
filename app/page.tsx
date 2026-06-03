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
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [plusOne, setPlusOne] = useState<boolean | null>(null);
  const [plusOneName, setPlusOneName] = useState("");
  const [plusOnePhone, setPlusOnePhone] = useState("");
  const [responded, setResponded] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 5000);
  }, []);

  useEffect(() => {
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
        body: JSON.stringify({ code: codeToValidate }),
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
      setAlreadyResponded(data.alreadyResponded);
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
          code,
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
            <Lottie
              animationData={skullAnimation}
              loop={true}
              style={{ width: 180, height: 180 }}
            />
            <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-700 rounded-full"
                style={{ animation: "loadingBar 5s linear forwards" }}
              />
            </div>
          </div>
        </>
      )}

      {/* PARTÍCULAS DE BRASA */}
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
            move: {
              enable: true,
              speed: 1.5,
              direction: "top",
              outModes: { default: "out" },
              random: true,
              straight: false,
            },
          },
          detectRetina: true,
        }}
      />

      {/* LOGO PACJUNINO */}
      {phase === "login" && (
        <div className="relative z-10 text-6xl" style={{ fontFamily: "Chunq" }}>
          <span style={{ color: "var(--straw)" }}>Pac</span>
          <span style={{ color: "var(--orange)" }}>Junino</span>
        </div>
      )}

      {/* INPUT LOGIN */}
      {phase === "login" && (
        <div className="relative z-10 text-6xl fade-in" style={{ fontFamily: "Chunq" }}>
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
        <div className="fixed inset-0 z-10 w-full h-full fade-in">
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
            {/* SLIDE 1 — Boas vindas */}
            <SwiperSlide>
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-6">
                <div className="whitespace-nowrap" style={{ fontFamily: "Chunq", fontSize: "3.5rem" }}>
                  <span style={{ color: "var(--blood)" }}>Arraiá </span>
                  <span style={{ color: "var(--orange)" }}>Macabro</span>
                </div>
                <p className="text-center text-lg" style={{ fontFamily: "var(--font-cinzel)", color: "var(--bone)" }}>
                  Bem-vindo ao Arraiá Macabro,
                </p>
                <p className="text-center text-2xl" style={{ fontFamily: "var(--font-cinzel)", color: "var(--straw)" }}>
                  {guestName}
                </p>
                <div className="w-full max-w-sm flex flex-col gap-3">
                  <p style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>ATRAÇÕES</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3"><span>🎧</span><span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>DJ Bazan</span></div>
                    <div className="flex items-center gap-3"><span>🍺</span><span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Open Chopp</span></div>
                    <div className="flex items-center gap-3"><span>🥃</span><span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Vodka</span></div>
                    <div className="flex items-center gap-3"><span>⚡</span><span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Energético</span></div>
                    <div className="flex items-center gap-3"><span>🥤</span><span style={{ color: "var(--bone)", fontFamily: "var(--font-cinzel)" }}>Refrigerante</span></div>
                  </div>
                </div>
                <div className="animate-bounce mt-4" style={{ color: "var(--ash)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              </div>
            </SwiperSlide>

            {/* SLIDE 2 — A festa */}
            <SwiperSlide>
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-6">
                <p style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>A FESTA</p>
                <div className="w-full max-w-sm flex flex-col gap-3">
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
                </div>
                <div className="animate-bounce mt-4" style={{ color: "var(--ash)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              </div>
            </SwiperSlide>

            {/* SLIDE 3 — Confirmação */}
            <SwiperSlide>
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-6">
                {!responded && !alreadyResponded && (
                  <div className="w-full max-w-sm flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p style={{ color: "var(--ash)", fontSize: "0.8rem", letterSpacing: "0.2em" }}>
                        VAI LEVAR UM ACOMPANHANTE?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setPlusOne(true)}
                          className={`flex-1 py-2 rounded border transition-colors ${plusOne === true ? "border-orange-600 text-orange-500" : "border-red-900 text-gray-500"}`}
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setPlusOne(false)}
                          className={`flex-1 py-2 rounded border transition-colors ${plusOne === false ? "border-orange-600 text-orange-500" : "border-red-900 text-gray-500"}`}
                        >
                          Não
                        </button>
                      </div>
                    </div>
                    {plusOne === true && (
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="Nome do acompanhante"
                          value={plusOneName}
                          onChange={(e) => setPlusOneName(e.target.value)}
                          className="w-full bg-transparent border border-red-900 text-white px-4 py-3 rounded outline-none focus:border-orange-600 transition-colors"
                        />
                        <input
                          type="tel"
                          placeholder="WhatsApp com DDD (ex: 45999999999)"
                          value={plusOnePhone}
                          onChange={(e) => setPlusOnePhone(formatPhone(e.target.value))}
                          className="w-full bg-transparent border border-red-900 text-white px-4 py-3 rounded outline-none focus:border-orange-600 transition-colors"
                        />
                        {phoneError && (
                          <p className="text-red-500 text-xs">{phoneError}</p>
                        )}
                      </div>
                    )}

                    <a href="https://wa.me/5545999414753?text=Olá%20quero%20confirmar%20minha%20presença%20para%20o%20Arraiá%20Macabro"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (plusOne === true && !isValidPhone(plusOnePhone)) return;
                        handleRespond();
                      }}
                      className="w-full text-center bg-red-900 hover:bg-red-800 text-white font-bold py-3 rounded tracking-widest transition-colors"
                      style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                      CONFIRMAR PRESENÇA
                    </a>
                  </div>
                )}
                {(responded || alreadyResponded) && (
                  <div className="text-center flex flex-col gap-3">
                    <p style={{ fontFamily: "var(--font-cinzel)", color: "var(--straw)", fontSize: "1.1rem" }}>
                      Presença confirmada! 🩸
                    </p>
                    <p style={{ color: "var(--ash)", fontSize: "0.85rem" }}>
                      Aguarde o contato com as informações de pagamento e endereço.
                    </p>
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
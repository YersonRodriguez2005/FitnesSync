import React, { useState } from "react";
import { IonContent, IonPage, useIonRouter, IonSpinner } from "@ionic/react";
import {
  LuMail,
  LuLock,
  LuLogIn,
  LuUserPlus,
  LuCircleAlert,
  LuActivity,
  LuEye, // <-- Nuevo Icono
  LuEyeOff, // <-- Nuevo Icono
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <-- Nuevo Estado para alternar visibilidad

  const router = useIonRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      const savedUser = JSON.parse(
        localStorage.getItem("fitness_user") || "{}",
      );
      if (savedUser.somatotipo === "Por definir" || !savedUser.somatotipo) {
        router.push("/onboarding", "forward", "replace");
      } else {
        router.push("/app/dashboard", "forward", "replace");
      }
    } catch {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className="min-h-full flex flex-col justify-center px-6 py-10 relative overflow-hidden bg-[#121212]">
          {/* ── Orbes Ambientales (Efecto Neón) ── */}
          <div className="absolute -top-32 -right-24 w-90 h-90 rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.12)_0%,transparent_70%)] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-70 h-70 rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.08)_0%,transparent_70%)] pointer-events-none" />

          <div className="w-full max-w-100 mx-auto relative z-10 flex flex-col justify-center flex-1">
            {/* ── Marca y Logo ── */}
            <div
              className="text-center mb-10 animate-slide-up"
              style={{ animationDelay: "0ms" }}
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[28px] bg-[#121212] border border-[#00E676]/20 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.03),0_0_20px_rgba(0,230,118,0.15)] mb-5 relative">
                <div className="absolute inset-0 bg-[#00E676]/5 rounded-[28px]" />
                <img
                  src="/assets/logo.png"
                  alt="FitnesSync Logo"
                  className="w-14 h-14 object-cover relative z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.classList.add(
                      "fallback-icon",
                    );
                  }}
                />
                <LuActivity className="w-12 h-12 text-[#00E676] hidden fallback-icon:block relative z-10" />
              </div>
              <h1 className="m-0 text-4xl font-black text-white tracking-tight">
                FitnesSync
              </h1>
              <p className="mt-2 text-sm text-[#B0B0B0] font-medium tracking-wide">
                Tu entrenamiento, tu progreso.
              </p>
            </div>

            {/* ── Tarjeta de Formulario (Glassmorphism) ── */}
            <div
              className="fs-glass-card animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <form onSubmit={handleLogin} className="flex flex-col gap-5 p-7">
                {/* Campo Correo */}
                <div>
                  <label className="block text-[11px] font-bold text-[#B0B0B0] uppercase tracking-widest mb-2 ml-2">
                    Correo electrónico
                  </label>
                  <div className="fs-soft-input-container h-14 group">
                    <LuMail className="text-[#00E676] text-xl mr-3 transition-transform group-focus-within:scale-110 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-white placeholder-[#B0B0B0]/50 text-sm font-medium h-full"
                    />
                  </div>
                </div>

                {/* Campo Contraseña Modificado */}
                <div>
                  <label className="block text-[11px] font-bold text-[#B0B0B0] uppercase tracking-widest mb-2 ml-2">
                    Contraseña
                  </label>
                  <div className="fs-soft-input-container h-14 group flex items-center justify-between pr-2">
                    <div className="flex items-center flex-1 h-full min-w-0">
                      <LuLock className="text-[#00E676] text-xl mr-3 transition-transform group-focus-within:scale-110 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"} // <-- Alterna entre texto y password de manera nativa
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-white placeholder-[#B0B0B0]/50 text-sm font-medium h-full"
                      />
                    </div>

                    {/* Botón interactivo Soft UI para alternar visibilidad */}
                    <button
                      type="button" // Evita que este botón dispare accidentalmente el submit del formulario
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer select-none bg-white/2 border border-white/5 shrink-0 ml-2"
                    >
                      {showPassword ? (
                        <LuEyeOff className="text-base text-[#00E676]" />
                      ) : (
                        <LuEye className="text-base" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mensaje de Error Neumórfico */}
                {error && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                    <LuCircleAlert className="text-lg shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Botón Principal (Neumorfismo Suave) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="fs-soft-btn w-full h-14 mt-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#00E676]! text-black! shadow-[0_4px_20px_rgba(0,230,118,0.35)]"
                >
                  {isLoading ? (
                    <IonSpinner name="crescent" className="text-black" />
                  ) : (
                    <>
                      <LuLogIn className="text-lg shrink-0" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divisor */}
              <div className="flex items-center gap-3 my-2 px-7 opacity-50">
                <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#00E676]/30" />
                <span className="text-[10px] font-bold text-[#B0B0B0] uppercase">
                  o
                </span>
                <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#00E676]/30" />
              </div>

              {/* Botón de Registro */}
              <div
                className="px-7 pb-7 pt-2 text-center animate-slide-up"
                style={{ animationDelay: "200ms" }}
              >
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => router.push("/register", "forward", "push")}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-[#00E676] bg-transparent hover:bg-[#00E676]/5 transition-colors border border-transparent hover:border-[#00E676]/10"
                >
                  <LuUserPlus className="text-lg" />
                  Crear cuenta nueva
                </button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

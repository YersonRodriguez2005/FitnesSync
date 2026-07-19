import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import {
  LuDumbbell,
  LuFlame,
  LuArrowRight,
  LuArrowLeft,
  LuCircleCheck,
  LuTarget,
  LuActivity
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useHistory } from "react-router-dom";

const OBJETIVOS = [
  {
    value: "Aumento de Masa Muscular",
    label: "Ganar Masa Muscular",
    desc: "Hipertrofia y volumen progresivo",
    icon: LuDumbbell,
    color: "text-[#2979FF]",
    bg: "bg-[#2979FF]/10",
    border: "border-[#2979FF]/20",
    activeBorder: "border-[#2979FF]/50",
    activeBg: "bg-[#2979FF]/10",
    checkBg: "bg-[#2979FF]",
  },
  {
    value: "Bajar de peso",
    label: "Perder Grasa",
    desc: "Déficit calórico y definición",
    icon: LuFlame,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    activeBorder: "border-orange-400/50",
    activeBg: "bg-orange-400/10",
    checkBg: "bg-orange-400",
  },
];

const SOMATOTIPOS = [
  {
    value: "Ectomorfo",
    label: "Ectomorfo",
    desc: "Delgado, dificultad para ganar masa",
    emoji: "🏃",
  },
  {
    value: "Mesomorfo",
    label: "Mesomorfo",
    desc: "Atlético, gana y pierde peso fácil",
    emoji: "💪",
  },
  {
    value: "Endomorfo",
    label: "Endomorfo",
    desc: "Complexión ancha, acumula grasa",
    emoji: "🏋️",
  },
];

const Onboarding: React.FC = () => {
  const { user, setUser } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  const [step, setStep] = useState(1);
  const [objetivo, setObjetivo] = useState(user?.objetivo || "Aumento de Masa Muscular");
  const [somatotipo, setSomatotipo] = useState(user?.somatotipo || "Ectomorfo");
  const [isLoading, setIsLoading] = useState(false);

  const finalizarOnboarding = async () => {
    setIsLoading(true);
    try {
      await api.put(`/update-profile/${user?.id}`, { objetivo, somatotipo });
      const newUser = { ...user!, objetivo, somatotipo };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      present({ message: "¡Perfil configurado! 🎉", duration: 2000, color: "success" });
      history.replace("/app/Dashboard");
    } catch {
      present({ message: "Error al guardar. Intenta de nuevo.", duration: 2000, color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className="min-h-full flex flex-col px-6 py-8 relative overflow-hidden bg-[#121212]">
          
          {/* ── Orbes Ambientales ── */}
          <div className="absolute -top-32 -left-24 w-90 h-90 rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.12)_0%,transparent_70%)] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-70 h-70 rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* ── Top Bar Neumórfico ── */}
          <div className="flex items-center justify-between pt-4 mb-8 relative z-10 animate-slide-up">
            {step === 2 ? (
              <button 
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 active:scale-95 transition-all shadow-[inset_2px_2px_4px_rgba(255,255,255,0.02)]" 
                onClick={() => setStep(1)}
              >
                <LuArrowLeft className="text-xl" />
              </button>
            ) : (
              <div className="w-11" /> /* Spacer */
            )}

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? "bg-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.4)]" : "bg-white/10"}`} />
              <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? "bg-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.4)]" : "bg-white/10"}`} />
            </div>

            <button 
              className="text-[11px] font-bold text-slate-400 uppercase tracking-widest active:scale-95 transition-all p-2" 
              onClick={() => history.replace("/app/Dashboard")}
            >
              Saltar
            </button>
          </div>

          <div className="flex-1 flex flex-col relative z-10 w-full max-w-100 mx-auto">
            
            {/* Step Label */}
            <div className="flex items-baseline gap-1.5 mb-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <span className="text-[11px] font-black text-[#00E676] uppercase tracking-widest">Paso {step}</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">de 2</span>
            </div>

            {/* ── STEP 1: OBJETIVO ── */}
            {step === 1 && (
              <div className="flex-1 flex flex-col animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="mb-8">
                  <LuTarget className="text-4xl text-[#00E676] mb-3" />
                  <h1 className="m-0 text-3xl font-black text-white tracking-tight leading-tight">¿Cuál es tu meta?</h1>
                  <p className="mt-2 text-sm text-slate-400 font-medium leading-relaxed max-w-70">
                    Adaptaremos tu plan de entrenamiento y nutrición a tu objetivo principal.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mb-8 flex-1">
                  {OBJETIVOS.map((op) => {
                    const isSelected = objetivo === op.value;
                    return (
                      <button
                        key={op.value}
                        onClick={() => setObjetivo(op.value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300 text-left active:scale-[0.98] ${
                          isSelected 
                            ? `${op.activeBg} ${op.activeBorder} shadow-[0_4px_20px_rgba(0,0,0,0.2)]` 
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${op.bg} ${op.border}`}>
                          <op.icon className={`text-2xl ${op.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="m-0 text-base font-bold text-white mb-1 truncate">{op.label}</h3>
                          <p className="m-0 text-[11px] font-medium text-slate-400 truncate">{op.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-black shrink-0 transition-all duration-300 ${
                          isSelected ? `${op.checkBg} scale-100 opacity-100` : "bg-transparent scale-50 opacity-0"
                        }`}>
                          <LuCircleCheck className="text-sm" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button 
                  className="fs-soft-btn w-full h-14 mt-auto flex items-center justify-center gap-2 text-sm uppercase tracking-widest bg-[#00E676] text-black shadow-[0_4px_20px_rgba(0,230,118,0.4)]"
                  onClick={() => setStep(2)}
                >
                  Siguiente <LuArrowRight className="text-lg" />
                </button>
              </div>
            )}

            {/* ── STEP 2: SOMATOTIPO ── */}
            {step === 2 && (
              <div className="flex-1 flex flex-col animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="mb-8">
                  <LuActivity className="text-4xl text-[#00E676] mb-3" />
                  <h1 className="m-0 text-3xl font-black text-white tracking-tight leading-tight">¿Tu tipo de cuerpo?</h1>
                  <p className="mt-2 text-sm text-slate-400 font-medium leading-relaxed max-w-70">
                    Esto nos ayuda a calibrar el volumen e intensidad de tu rutina.
                  </p>
                </div>

                <div className="flex flex-col gap-3 mb-8 flex-1">
                  {SOMATOTIPOS.map((tipo) => {
                    const isSelected = somatotipo === tipo.value;
                    return (
                      <button
                        key={tipo.value}
                        onClick={() => setSomatotipo(tipo.value)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[20px] border transition-all duration-300 text-left active:scale-[0.98] ${
                          isSelected 
                            ? "bg-[#00E676]/10 border-[#00E676]/40 shadow-[0_4px_20px_rgba(0,230,118,0.15)]" 
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-3xl shrink-0 w-10 text-center">{tipo.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="m-0 text-sm font-bold text-white mb-0.5 truncate">{tipo.label}</h3>
                          <p className="m-0 text-[11px] font-medium text-slate-400 truncate">{tipo.desc}</p>
                        </div>
                        {isSelected && <LuCircleCheck className="text-xl text-[#00E676] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={finalizarOnboarding}
                  disabled={isLoading}
                  className="fs-soft-btn w-full h-14 mt-auto flex items-center justify-center gap-2 text-sm uppercase tracking-widest bg-[#00E676] text-black shadow-[0_4px_20px_rgba(0,230,118,0.4)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <IonSpinner name="crescent" className="text-black" />
                  ) : (
                    <>
                      Finalizar y entrar <LuCircleCheck className="text-lg" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;
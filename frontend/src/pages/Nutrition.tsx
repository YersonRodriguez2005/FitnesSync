import React, { useState, useEffect } from "react";
import { IonContent, IonHeader, IonPage, IonToolbar } from "@ionic/react";
import {
  LuFlame,
  LuDroplets,
  LuFish,
  LuWheat,
  LuSun,
  LuCloudSun,
  LuMoon,
  LuTriangleAlert,
  LuUtensilsCrossed,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface PlanNutricional {
  objetivo: string;
  somatotipo: string;
  calorias_base: number;
  proteina_porcentaje: number;
  carbos_porcentaje: number;
  grasas_porcentaje: number;
  ejemplo_desayuno: string;
  ejemplo_almuerzo: string;
  ejemplo_cena: string;
}

// ─── Componente Skeleton ──────────────────────────────────────────────────────
const SkeletonNutrition = () => (
  <div className="flex flex-col gap-4">
    <div className="h-25 bg-slate-800/50 rounded-3xl border border-white/5 animate-pulse" />

    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-30 bg-slate-800/50 rounded-[20px] border border-white/5 animate-pulse flex flex-col items-center justify-center p-3"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-8 h-8 rounded-full bg-slate-700/50 mb-2" />
          <div className="w-12 h-4 rounded-md bg-slate-700/50 mb-1" />
          <div className="w-16 h-3 rounded-md bg-slate-700/50" />
        </div>
      ))}
    </div>

    <div className="flex flex-col gap-3 mt-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 bg-slate-800/50 rounded-[20px] border border-white/5 animate-pulse flex items-center p-4"
          style={{ animationDelay: `${(i + 3) * 100}ms` }}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 mr-4" />
          <div className="flex-1">
            <div className="w-20 h-3 rounded-md bg-slate-700/50 mb-2" />
            <div className="w-full h-3 rounded-md bg-slate-700/50" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Nutrition: React.FC = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanNutricional | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchNutricion = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          objetivo: user?.objetivo || "Aumento de Masa Muscular",
          somatotipo: user?.somatotipo || "Ectomorfo",
        });
        const response = await api.get(`/plan?${params.toString()}`);
        setPlan(response.data.plan);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError("No encontramos un plan exacto para tu perfil biométrico.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNutricion();
  }, [user?.objetivo, user?.somatotipo]);

  const calcGramos = (porcentaje: number, kcal: number, calsPorGramo: number) =>
    Math.round(((porcentaje / 100) * kcal) / calsPorGramo);

  const macros = plan
    ? [
        {
          label: "Proteína",
          pct: plan.proteina_porcentaje,
          gramos: calcGramos(plan.proteina_porcentaje, plan.calorias_base, 4),
          color: "#2979FF",
          tailwind: "text-[#2979FF] bg-[#2979FF]/10 border-[#2979FF]/20",
          icon: LuFish,
        },
        {
          label: "Carbos",
          pct: plan.carbos_porcentaje,
          gramos: calcGramos(plan.carbos_porcentaje, plan.calorias_base, 4),
          color: "#00E676",
          tailwind: "text-[#00E676] bg-[#00E676]/10 border-[#00E676]/20",
          icon: LuWheat,
        },
        {
          label: "Grasas",
          pct: plan.grasas_porcentaje,
          gramos: calcGramos(plan.grasas_porcentaje, plan.calorias_base, 9),
          color: "#fbbf24",
          tailwind: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
          icon: LuFlame,
        },
      ]
    : [];

  const meals = plan
    ? [
        {
          label: "Desayuno",
          content: plan.ejemplo_desayuno,
          icon: LuSun,
          tailwind: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        },
        {
          label: "Almuerzo",
          content: plan.ejemplo_almuerzo,
          icon: LuCloudSun,
          tailwind: "text-orange-400 bg-orange-400/10 border-orange-400/20",
        },
        {
          label: "Cena",
          content: plan.ejemplo_cena,
          icon: LuMoon,
          tailwind: "text-[#2979FF] bg-[#2979FF]/10 border-[#2979FF]/20",
        },
      ]
    : [];

  return (
    <IonPage>
      {/* ── HEADER NEUMÓRFICO ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar
          className="bg-transparent border-b border-white/5"
          style={{
            "--background": "rgba(18,18,18,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-2 w-full">
            <h1 className="m-0 text-xl font-black text-white tracking-tight">
              Nutrición
            </h1>
            <span className="px-3 py-1.5 rounded-xl bg-[#2979FF]/15 border border-[#2979FF]/30 text-[10px] font-bold text-[#2979FF] uppercase tracking-widest">
              {user?.somatotipo || "—"}
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={true}>
        <div className="min-h-full flex flex-col px-5 py-6 relative bg-[#121212] pb-28">
          {/* ── HERO BANNER ── */}
          <div className="flex items-center gap-4 p-5 mb-6 rounded-3xl bg-linear-to-br from-[#00E676]/15 to-transparent border border-[#00E676]/20 shadow-[0_8px_32px_rgba(0,230,118,0.05)] relative overflow-hidden animate-slide-up">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00E676]/10 rounded-full blur-2xl" />
            <div className="w-14 h-14 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center relative z-10 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.05)] shrink-0">
              <LuUtensilsCrossed className="text-2xl text-[#00E676]" />
            </div>
            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 opacity-80">
                Plan para
              </p>
              <h2 className="text-xl font-black text-white tracking-tight m-0 mb-1 truncate">
                {user?.nombre?.split(" ")[0] || "Atleta"}
              </h2>
              <p className="text-[11px] font-medium text-slate-300 m-0 truncate">
                {user?.objetivo}
              </p>
            </div>
          </div>

          {isLoading ? (
            <SkeletonNutrition />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <LuTriangleAlert className="text-red-400 text-3xl" />
              </div>
              <p className="text-sm font-medium text-slate-400 px-6 leading-relaxed">
                {error}
              </p>
            </div>
          ) : plan ? (
            <>
              {/* ── CALORÍAS (Glass Card Premium) ── */}
              <div
                className="fs-glass-card p-5 mb-6 flex items-center justify-between animate-slide-up relative overflow-hidden backdrop-blur-xl"
                style={{ animationDelay: "100ms" }}
              >
                {/* Reflejo de luz superior sutil Glassmorphism */}
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                <div className="flex flex-col z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 leading-none">
                    Calorías diarias
                  </span>
                  <div className="flex items-baseline gap-1">
                    {/* Icono de llama con gradiente neón */}
                    <LuFlame className="text-xl mr-1 text-orange-500 animate-pulse" />
                    {/* Cambiamos serif por sans con tracking tight denso */}
                    <span className="text-4xl font-black text-white leading-none tracking-tight">
                      {plan.calorias_base.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-extrabold text-orange-500/80 uppercase tracking-widest ml-1.5">
                      kcal
                    </span>
                  </div>
                </div>

                {/* SVG Ring Neumórfico Avanzado */}
                <div className="relative w-20 h-20 shrink-0 z-10 flex items-center justify-center">
                  <svg
                    viewBox="0 0 64 64"
                    className="w-full h-full -rotate-90 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                  >
                    <defs>
                      {/* Gradiente lineal dinámico para el progreso del fuego */}
                      <linearGradient
                        id="calorieBurn"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#FF9100" />
                        <stop offset="100%" stopColor="#FF3D00" />
                      </linearGradient>
                    </defs>

                    {/* Círculo de fondo: Hundido estilo Soft UI inset */}
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className="fill-none stroke-black/40"
                      strokeWidth="5"
                    />

                    {/* Círculo de progreso: Brillo de cristal neon */}
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className="fill-none stroke-linecap-round transition-all duration-1000 ease-out"
                      stroke="url(#calorieBurn)"
                      strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset="0"
                    />
                  </svg>

                  {/* Texto interno centrado del anillo */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[12px] font-black text-white leading-none tracking-tighter">
                      100
                    </span>
                    <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest scale-90 -mt-0.5">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* ── MACROS (Grid Row) ── */}
              <p
                className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 animate-slide-up"
                style={{ animationDelay: "150ms" }}
              >
                Distribución de macros
              </p>
              <div
                className="grid grid-cols-3 gap-3 mb-8 animate-slide-up"
                style={{ animationDelay: "200ms" }}
              >
                {macros.map((m) => (
                  <div
                    key={m.label}
                    className="fs-glass-card p-3.5! flex flex-col items-center text-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${m.tailwind}`}
                    >
                      <m.icon className="text-lg" />
                    </div>
                    <span
                      className="text-xl font-black text-white leading-none mb-1"
                      style={{ color: m.color }}
                    >
                      {m.gramos}g
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {m.label}
                    </span>

                    {/* Barra de Porcentaje */}
                    <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-1.5 shadow-inner">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">
                      {m.pct}%
                    </span>
                  </div>
                ))}
              </div>

              {/* ── COMIDAS / MENÚ (Lista Vertical Premium Corregida) ── */}
              <p
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 ml-1 animate-slide-up select-none"
                style={{ animationDelay: "250ms" }}
              >
                Menú de Ejemplo
              </p>
              <div
                className="flex flex-col gap-3 mb-8 animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                {meals.map((meal) => (
                  <div
                    key={meal.label}
                    className="fs-glass-card p-4 flex gap-4 items-center relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:border-white/15"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),4px_4px_10px_rgba(0,0,0,0.2)] ${meal.tailwind}`}
                    >
                      <meal.icon className="text-xl shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4
                        className={`m-0 text-[11px] font-black uppercase tracking-widest leading-none mb-2 ${meal.tailwind.split(" ")[0]}`}
                      >
                        {meal.label}
                      </h4>
                      <p className="m-0 text-sm text-slate-300 font-medium leading-relaxed whitespace-normal wrap-break-word">
                        {meal.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── RECORDATORIO HIDRATACIÓN (Estilo Hidro-Glass Simétrico) ── */}
              <div
                className="fs-glass-card p-5 flex gap-4 items-center border-l-4 border-l-[#2979FF] bg-linear-to-br from-white/3 to-[#2979FF]/2 relative overflow-hidden backdrop-blur-xl animate-slide-up"
                style={{ animationDelay: "400ms" }}
              >
                {/* Reflejo superior restaurado a gradiente estándar */}
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                {/* Icono de gota alineado con el encabezado mediante flex de seguridad */}
                <div className="w-12 h-12 rounded-2xl bg-[#2979FF]/10 border border-[#2979FF]/25 flex items-center justify-center shrink-0 text-[#2979FF] shadow-[inset_1px_1px_3px_rgba(255,255,255,0.1),4px_4px_12px_rgba(0,0,0,0.3)] animate-pulse mt-0.5">
                  <LuDroplets className="text-2xl shrink-0" />
                </div>

                {/* Bloque de Información alineado perfectamente */}
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  {/* Encabezado y párrafo con interlineado corregido */}
                  <div className="flex flex-col justify-center min-h-12 mb-3">
                    <h4 className="m-0 text-[15px] font-black text-white tracking-wide mb-1 leading-none">
                      Hidratación diaria
                    </h4>
                    <p className="m-0 text-xs text-slate-400 font-medium leading-relaxed whitespace-normal wrap-break-word">
                      Consume mínimo{" "}
                      <strong className="text-[#2979FF] font-bold">
                        3 litros de agua
                      </strong>{" "}
                      para optimizar la absorción de nutrientes.
                    </p>
                  </div>

                  {/* Matriz ergonómica de vasos de agua (Evita desborde horizontal) */}
                  <div className="flex items-center gap-1.5 flex-wrap w-full bg-black/20 p-2.5 rounded-xl border border-white/5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className={`text-base transition-all duration-300 select-none shrink-0 
                          ${
                            i <= 5
                              ? "opacity-100 scale-105 filter drop-shadow-[0_0_6px_rgba(41,121,255,0.6)]"
                              : "opacity-15 grayscale scale-95"
                          }`}
                      >
                        💧
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Nutrition;

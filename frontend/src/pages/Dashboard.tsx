import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  useIonViewWillEnter,
  useIonToast,
} from "@ionic/react";
import {
  LuChartBarBig,
  LuDumbbell,
  LuApple,
  LuZap,
  LuTrophy,
  LuScale,
  LuRuler,
  LuCircleCheck,
  LuX,
  LuTrendingUp,
  LuTrendingDown,
  LuMinus,
  LuPlus
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface HistorialPunto {
  id: number;
  peso_kg: number;
  altura_cm: number;
  imc: number;
  fecha: string;
}

interface BiometriaActual {
  peso_kg: number | null;
  altura_cm: number | null;
  imc: number | null;
  peso_meta_kg: number | null;
}

interface RangoIMC {
  min: number;
  max: number;
  ideal: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clasificarIMC = (imc: number | null) => {
  if (imc === null)
    return {
      label: "Sin datos",
      color: "#9ca3af",
      tailwind: "text-gray-400 bg-gray-400/10",
      emoji: "❓",
    };
  if (imc < 18.5)
    return {
      label: "Bajo peso",
      color: "#60a5fa",
      tailwind: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      emoji: "📉",
    };
  if (imc < 25)
    return {
      label: "Peso normal",
      color: "#00E676",
      tailwind: "text-[#00E676] bg-[#00E676]/10 border-[#00E676]/20",
      emoji: "✅",
    };
  if (imc < 30)
    return {
      label: "Sobrepeso",
      color: "#fbbf24",
      tailwind: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      emoji: "⚠️",
    };
  return {
    label: "Obesidad",
    color: "#f87171",
    tailwind: "text-red-400 bg-red-400/10 border-red-400/20",
    emoji: "🔴",
  };
};

const calcularProgreso = (
  pesoActual: number | null,
  pesoMeta: number | null,
  pesoInicial: number | null,
): number => {
  if (!pesoActual || !pesoMeta || !pesoInicial) return 0;
  if (pesoInicial === pesoMeta) return 100;
  const total = Math.abs(pesoInicial - pesoMeta);
  const avance = Math.abs(pesoInicial - pesoActual);
  return Math.min(100, Math.round((avance / total) * 100));
};

// ─── Mini Gráfica SVG Nativa (Tailwind Integrado) ─────────────────────────────
const GraficaPeso: React.FC<{
  historial: HistorialPunto[];
  pesoMeta: number | null;
  rangoImc: RangoIMC | null;
  alturaCm: number | null;
}> = ({ historial, pesoMeta, rangoImc, alturaCm }) => {
  if (historial.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-400/60 text-center">
        <LuChartBarBig className="text-4xl text-slate-500/30" />
        <p className="text-xs font-medium m-0">
          Registra al menos 2 mediciones para ver tu gráfica
        </p>
      </div>
    );
  }

  const W = 320;
  const H = 140;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const pesos = historial.map((p) => p.peso_kg);
  const minPeso = Math.min(...pesos, pesoMeta ?? Infinity) - 3;
  const maxPeso = Math.max(...pesos, pesoMeta ?? -Infinity) + 3;

  const toX = (i: number) => PAD.left + (i / (historial.length - 1)) * innerW;
  const toY = (p: number) =>
    PAD.top + ((maxPeso - p) / (maxPeso - minPeso)) * innerH;

  const pathData = historial
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.peso_kg).toFixed(1)}`,
    )
    .join(" ");

  const areaData = `${pathData} L ${toX(historial.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  const metaY = pesoMeta ? toY(pesoMeta) : null;

  let rangoMinY: number | null = null;
  let rangoMaxY: number | null = null;
  if (rangoImc && alturaCm) {
    const altM = alturaCm / 100;
    const pesoRangoMin = rangoImc.min * altM * altM;
    const pesoRangoMax = rangoImc.max * altM * altM;
    rangoMinY = toY(pesoRangoMax);
    rangoMaxY = toY(pesoRangoMin);
  }

  const tendencia =
    historial.length >= 2
      ? historial[historial.length - 1].peso_kg -
        historial[historial.length - 2].peso_kg
      : 0;

  return (
    <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-3 mb-4 mt-2">
      {/* Tendencia badge */}
      <div className="flex items-center gap-1.5 mb-2 text-xs font-bold">
        {tendencia < -0.1 ? (
          <LuTrendingDown className="text-emerald-400" />
        ) : tendencia > 0.1 ? (
          <LuTrendingUp className="text-red-400" />
        ) : (
          <LuMinus className="text-slate-400" />
        )}
        <span
          className={
            tendencia < -0.1
              ? "text-emerald-400"
              : tendencia > 0.1
                ? "text-red-400"
                : "text-slate-400"
          }
        >
          {tendencia === 0
            ? "Sin cambio"
            : `${tendencia > 0 ? "+" : ""}${tendencia.toFixed(1)} kg`}
        </span>
        <span className="text-[10px] text-slate-500 font-medium ml-1">
          vs anterior
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block overflow-visible"
      >
        {rangoMinY !== null && rangoMaxY !== null && (
          <rect
            x={PAD.left}
            y={rangoMinY}
            width={innerW}
            height={rangoMaxY - rangoMinY}
            fill="#00E676"
            opacity={0.06}
          />
        )}

        <path d={areaData} fill="url(#gradientArea)" opacity={0.3} />

        <defs>
          <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E676" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
          </linearGradient>
        </defs>

        {metaY !== null && (
          <>
            <line
              x1={PAD.left}
              y1={metaY}
              x2={PAD.left + innerW}
              y2={metaY}
              stroke="#2979FF"
              strokeWidth={1.5}
              strokeDasharray="4,4"
              opacity={0.8}
            />
            <text
              x={PAD.left + innerW + 4}
              y={metaY + 3}
              fontSize={9}
              fill="#2979FF"
              fontWeight="bold"
            >
              Meta
            </text>
          </>
        )}

        <path
          d={pathData}
          stroke="#00E676"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_4px_6px_rgba(0,230,118,0.4)]"
        />

        {historial.map((p, i) => (
          <circle
            key={p.id}
            cx={toX(i)}
            cy={toY(p.peso_kg)}
            r={i === historial.length - 1 ? 5 : 3.5}
            fill={i === historial.length - 1 ? "#00E676" : "#121212"}
            stroke="#00E676"
            strokeWidth={2}
            className={i === historial.length - 1 ? "animate-pulse" : ""}
          />
        ))}

        {[minPeso + 1, (minPeso + maxPeso) / 2, maxPeso - 1].map((v, i) => (
          <text
            key={i}
            x={PAD.left - 6}
            y={toY(v) + 4}
            fontSize={9}
            fill="#9ca3af"
            textAnchor="end"
            fontWeight="600"
          >
            {Math.round(v)}
          </text>
        ))}

        {[0, Math.floor(historial.length / 2), historial.length - 1].map((i) =>
          historial[i] ? (
            <text
              key={i}
              x={toX(i)}
              y={H - 2}
              fontSize={9}
              fill="#9ca3af"
              textAnchor="middle"
              fontWeight="600"
            >
              {historial[i].fecha}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
};

// ─── Componente Principal Dashboard ───────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [presentToast] = useIonToast();

  const [stats, setStats] = useState({ total: 0, racha_semanal: 0 });
  const [biometria, setBiometria] = useState<BiometriaActual>({
    peso_kg: null,
    altura_cm: null,
    imc: null,
    peso_meta_kg: null,
  });
  const [historial, setHistorial] = useState<HistorialPunto[]>([]);
  const [rangoImc, setRangoImc] = useState<RangoIMC | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formPeso, setFormPeso] = useState<string>("");
  const [formAltura, setFormAltura] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

  useIonViewWillEnter(() => {
    if (!user?.id) return;
    api
      .get(`/estadisticas/${user.id}`)
      .then((r) => setStats(r.data))
      .catch((e) => console.error("Error estadísticas", e));
    cargarBiometria();
  });

  const cargarBiometria = async () => {
    if (!user?.id) return;
    setLoadingBio(true);
    try {
      const res = await api.get(`/biometria/${user.id}`);
      setBiometria(res.data.actual);
      setHistorial(res.data.historial || []);
      setRangoImc(res.data.rango_imc || null);
      if (res.data.actual.peso_kg) setFormPeso(String(res.data.actual.peso_kg));
      if (res.data.actual.altura_cm)
        setFormAltura(String(res.data.actual.altura_cm));
    } catch (e) {
      console.error("Error biometría", e);
    } finally {
      setLoadingBio(false);
    }
  };

  const guardarMedicion = async () => {
    const peso = parseFloat(formPeso);
    const altura = parseInt(formAltura);

    if (
      isNaN(peso) ||
      isNaN(altura) ||
      peso < 20 ||
      peso > 300 ||
      altura < 100 ||
      altura > 250
    ) {
      presentToast({
        message: "Ingresa valores válidos (Peso: 20-300kg, Altura: 100-250cm)",
        duration: 2500,
        color: "warning",
      });
      return;
    }

    setGuardando(true);
    try {
      await api.post(`/biometria/${user!.id}`, {
        peso_kg: peso,
        altura_cm: altura,
      });
      presentToast({
        message: "Medición registrada ✅",
        duration: 2000,
        color: "success",
      });
      setShowModal(false);
      cargarBiometria();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      presentToast({
        message: err.response?.data?.mensaje || "Error al guardar",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setGuardando(false);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const today = new Date().getDay();
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const imcInfo = clasificarIMC(biometria.imc);
  const pesoInicial = historial.length > 0 ? historial[0].peso_kg : null;
  const progreso = calcularProgreso(
    biometria.peso_kg,
    biometria.peso_meta_kg,
    pesoInicial,
  );

  const diferenciaMeta =
    biometria.peso_kg && biometria.peso_meta_kg
      ? parseFloat((biometria.peso_kg - biometria.peso_meta_kg).toFixed(1))
      : null;

  return (
    <IonPage>
            {/* ── HEADER NEUMÓRFICO CON LOGO CORREGIDO ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar
          className="bg-transparent border-b border-white/5"
          style={{
            "--background": "rgba(18,18,18,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-2 w-full">
            <div className="flex items-center gap-2">
              {/* Contenedor Neumórfico del Logo */}
              <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[#00E676]/30 flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),0_0_10px_rgba(0,230,118,0.15)] relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[#00E676]/10 rounded-lg pointer-events-none" />
                
                {/* Imagen del Logotipo Oficial */}
                <img 
                  src="/assets/logo.png" 
                  alt="FitnesSync Logo" 
                  className="w-[70%] h-[70%] object-contain relative z-10 select-none pointer-events-none"
                  loading="eager"
                />
              </div>
              
              <span className="text-base font-black text-white tracking-tight select-none">
                FitnesSync
              </span>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={true}>
        <div className="min-h-full flex flex-col px-5 py-6 relative bg-[#121212] pb-24">
          {/* ── HERO BANNER ── */}
          <div className="flex items-center justify-between p-5 mb-6 rounded-3xl bg-linear-to-br from-[#00E676]/20 to-[#00E676]/5 border border-[#00E676]/30 shadow-[0_8px_32px_rgba(0,230,118,0.1)] relative overflow-hidden animate-slide-up">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00E676]/20 rounded-full blur-2xl" />
            <div className="relative z-10 flex-1">
              <p className="text-xs font-bold text-[#00E676] uppercase tracking-widest mb-1 opacity-80">
                {getGreeting()},
              </p>
              <h1 className="text-2xl font-black text-white tracking-tight m-0 mb-1">
                {user?.nombre?.split(" ")[0] || "Atleta"} 👋
              </h1>
              <p className="text-sm font-medium text-slate-300 m-0">
                Listo para tu próxima sesión
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/40 flex items-center justify-center relative z-10 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.1)]">
              <LuZap className="text-3xl text-[#00E676]" />
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div
            className="grid grid-cols-2 gap-4 mb-6 animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10">
              <LuTrophy className="text-2xl text-[#00E676] mb-1" />
              <span className="text-3xl font-black text-white leading-none">
                {stats.total}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Sesiones
              </span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 shadow-[0_4px_15px_rgba(0,230,118,0.05)]">
              <LuZap className="text-2xl text-[#00E676] mb-1" />
              <span className="text-3xl font-black text-white leading-none">
                {stats.racha_semanal}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Esta semana
              </span>
            </div>
          </div>

          {/* ── ACTIVIDAD SEMANAL ── */}
          <div
            className="mb-8 animate-slide-up"
            style={{ animationDelay: "150ms" }}
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Actividad semanal
            </p>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
              {days.map((d, i) => {
                const todayIdx = today === 0 ? 6 : today - 1;
                const isPast = i < todayIdx;
                const isToday = i === todayIdx;

                return (
                  <div key={d} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isToday
                          ? "bg-[#00E676] text-black shadow-[0_0_12px_rgba(0,230,118,0.6)] scale-110"
                          : isPast
                            ? "bg-[#00E676]/30 text-[#00E676]"
                            : "bg-white/5 border border-white/10 text-slate-500"
                      }`}
                    >
                      {isToday ? <LuZap className="text-sm" /> : d}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SEGUIMIENTO CORPORAL (Glass Card) ── */}
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2 mb-3 ml-1">
              <LuScale className="text-[#00E676] text-lg" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Seguimiento corporal
              </span>
            </div>

            <div className="fs-glass-card p-5">
              {loadingBio ? (
                <div className="py-10 flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#00E676]/30 border-t-[#00E676] rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Fila Métricas */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex flex-col items-center flex-1">
                      <LuScale className="text-lg text-[#2979FF] mb-1" />
                      <span className="text-xl font-black text-white">
                        {biometria.peso_kg ?? "—"}{" "}
                        <span className="text-xs font-bold text-slate-500">
                          kg
                        </span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Peso
                      </span>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center flex-1">
                      <LuRuler className="text-lg text-[#2979FF] mb-1" />
                      <span className="text-xl font-black text-white">
                        {biometria.altura_cm ?? "—"}{" "}
                        <span className="text-xs font-bold text-slate-500">
                          cm
                        </span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Altura
                      </span>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-lg mb-1">{imcInfo.emoji}</span>
                      <span
                        className="text-xl font-black"
                        style={{ color: imcInfo.color }}
                      >
                        {biometria.imc ?? "—"}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        IMC
                      </span>
                    </div>
                  </div>

                  {/* Chip IMC */}
                  {biometria.imc !== null && (
                    <div
                      className={`flex flex-col gap-1 px-4 py-3 rounded-xl border mb-5 ${imcInfo.tailwind}`}
                    >
                      <span className="text-sm font-bold">{imcInfo.label}</span>
                      {rangoImc && (
                        <span className="text-[10px] font-medium opacity-80">
                          Rango ideal estimado: {rangoImc.min} – {rangoImc.max}{" "}
                          IMC
                        </span>
                      )}
                    </div>
                  )}

                  {/* Barra de Progreso a Meta */}
                  {biometria.peso_meta_kg !== null &&
                    biometria.peso_kg !== null && (
                      <div className="mb-5">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Progreso a Meta
                          </span>
                          <span className="text-xs font-medium text-slate-300">
                            Meta:{" "}
                            <strong className="text-[#2979FF]">
                              {biometria.peso_meta_kg} kg
                            </strong>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#121212] rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out bg-linear-to-r from-[#2979FF] to-[#00E676]"
                            style={{ width: `${progreso}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-500 font-bold">
                            {progreso}% completado
                          </span>
                          {progreso >= 100 && (
                            <span className="text-[10px] font-bold text-[#00E676] flex items-center gap-1">
                              <LuCircleCheck /> ¡Meta alcanzada!
                            </span>
                          )}
                          {progreso < 100 && diferenciaMeta !== null && (
                            <span className="text-[10px] font-bold text-slate-500">
                              {diferenciaMeta > 0
                                ? `Faltan ${diferenciaMeta} kg`
                                : `Sobran ${Math.abs(diferenciaMeta)} kg`}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Gráfica de Progreso */}
                  <GraficaPeso
                    historial={historial}
                    pesoMeta={biometria.peso_meta_kg}
                    rangoImc={rangoImc}
                    alturaCm={biometria.altura_cm}
                  />

                  {/* Botón Flotante Neumórfico (Dentro de la tarjeta) */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="fs-soft-btn w-full py-3! mt-2 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#00E676]"
                  >
                    <LuPlus className="text-lg" />
                    {biometria.peso_kg
                      ? "Actualizar Medición"
                      : "Primera Medición"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── PERFIL / RESUMEN ── */}
          <div
            className="mt-8 animate-slide-up"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center gap-2 mb-3 ml-1">
              <LuDumbbell className="text-[#00E676] text-lg" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Resumen de Perfil
              </span>
            </div>

            <div className="fs-glass-card p-0 overflow-hidden">
              <div className="flex items-center p-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#2979FF]/15 flex items-center justify-center text-[#2979FF] mr-4 border border-[#2979FF]/20">
                  <LuTrophy className="text-xl" />
                </div>
                <div>
                  <p className="m-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Objetivo Actual
                  </p>
                  <p className="m-0 text-sm font-bold text-white capitalize">
                    {user?.objetivo || "Sin definir"}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 mr-4 border border-orange-500/20">
                  <LuApple className="text-xl" />
                </div>
                <div className="flex-1">
                  <p className="m-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Somatotipo
                  </p>
                  <p className="m-0 text-sm font-bold text-white capitalize">
                    {user?.somatotipo || "Sin definir"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modal Nueva Medición (Glass Sheet) ── */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-md flex items-end justify-center animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div className="bg-[#1E1E1E] w-full max-w-125 rounded-t-4xl p-6 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-slide-up relative">
              <div className="w-12 h-1.5 rounded-full bg-white/10 mx-auto mb-6" />

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 active:scale-90 transition-all"
              >
                <LuX />
              </button>

              <h2 className="text-xl font-black text-white mb-2">
                Nueva medición
              </h2>
              <p className="text-xs text-slate-400 mb-8 font-medium">
                Registra tu progreso para que podamos recalcular tus
                requerimientos.
              </p>

              {/* Formulario Neumórfico */}
              <div className="space-y-6 mb-8">
                {/* Control de Peso */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <LuScale className="text-[#00E676]" /> Peso actual (kg)
                  </label>
                  <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-[#121212] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
                    <button
                      onClick={() =>
                        setFormPeso((v) =>
                          String(Math.max(20, parseFloat(v || "0") - 0.5)),
                        )
                      }
                      className="w-12 h-12 rounded-2xl! bg-white/5 text-white active:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <LuMinus />
                    </button>
                    <input
                      type="number"
                      value={formPeso}
                      onChange={(e) => setFormPeso(e.target.value)}
                      placeholder="72.5"
                      step="0.5"
                      className="w-24 text-center text-2xl font-black text-white bg-transparent border-none outline-none font-mono"
                    />
                    <button
                      onClick={() =>
                        setFormPeso((v) =>
                          String(Math.min(300, parseFloat(v || "0") + 0.5)),
                        )
                      }
                      className="w-12 h-12 rounded-2xl! bg-white/5 text-white active:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <LuPlus />
                    </button>
                  </div>
                </div>

                {/* Control de Altura */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <LuRuler className="text-[#2979FF]" /> Altura (cm)
                  </label>
                  <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-[#121212] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
                    <button
                      onClick={() =>
                        setFormAltura((v) =>
                          String(Math.max(100, parseInt(v || "0") - 1)),
                        )
                      }
                      className="w-12 h-12 rounded-2xl! bg-white/5 text-white active:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <LuMinus />
                    </button>
                    <input
                      type="number"
                      value={formAltura}
                      onChange={(e) => setFormAltura(e.target.value)}
                      placeholder="175"
                      className="w-24 text-center text-2xl font-black text-white bg-transparent border-none outline-none font-mono"
                    />
                    <button
                      onClick={() =>
                        setFormAltura((v) =>
                          String(Math.min(250, parseInt(v || "0") + 1)),
                        )
                      }
                      className="w-12 h-12 rounded-2xl! bg-white/5 text-white active:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <LuPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Dinámico */}
              {formPeso &&
                formAltura &&
                !isNaN(parseFloat(formPeso)) &&
                !isNaN(parseInt(formAltura)) &&
                (() => {
                  const imcPreview = parseFloat(
                    (
                      parseFloat(formPeso) /
                      Math.pow(parseInt(formAltura) / 100, 2)
                    ).toFixed(1),
                  );
                  const info = clasificarIMC(imcPreview);
                  return (
                    <div
                      className={`flex items-center justify-between p-4 rounded-xl border mb-6 ${info.tailwind}`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        IMC Estimado
                      </span>
                      <span className="text-sm font-black">
                        {imcPreview} — {info.label} {info.emoji}
                      </span>
                    </div>
                  );
                })()}

              <button
                onClick={guardarMedicion}
                disabled={guardando}
                className="w-full h-14 rounded-xl! bg-[#00E676] text-black font-black uppercase tracking-widest text-sm active:scale-95 transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(0,230,118,0.4)] disabled:opacity-50"
              >
                {guardando ? (
                  <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full! animate-spin" />
                ) : (
                  "Guardar Medición"
                )}
              </button>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;

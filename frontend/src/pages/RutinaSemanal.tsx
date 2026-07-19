import React, { useState, useEffect, useCallback } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonModal,
  useIonToast,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { 
  LuChevronLeft, 
  LuCalendarDays, 
  LuRotateCcw, 
  LuDumbbell, 
  LuChevronDown,
  LuRepeat,
  LuTrash2,
  LuCircleCheck,
  LuPlus,
  LuTarget,
  LuCircleAlert,
  LuFilter,
  LuX,
  LuSave,
  LuEye,
  LuImageOff,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import confetti from "canvas-confetti";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Ejercicio {
  id_ejercicio?: string;
  nombre: string;
  grupo?: string;
  grupo_muscular?: string;
  series: number;
  reps: string;
  tip: string;
  imagen_url?: string;
  equipamiento?: string;
  descripcion?: string;
  consejos?: string;
}

type RutinaSemanalData = Record<string, Ejercicio[]>;

// ─── Constantes ───────────────────────────────────────────────────────────────
const DIAS_SEMANA = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];
const DIA_CORTO: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sáb",
  domingo: "Dom",
};
const GRUPOS_MUSCULARES_DEFAULT = [
  "Todos",
  "Pecho",
  "Espalda",
  "Piernas",
  "Glúteos",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Abdomen",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizarEjercicioCatalogo = (
  ej: Ejercicio,
  objetivo: string | undefined,
): Ejercicio => ({
  ...ej,
  grupo: ej.grupo_muscular || ej.grupo || "General",
  series: objetivo === "Bajar de peso" ? 3 : 4,
  reps: objetivo === "Bajar de peso" ? "15-20" : "10-12",
  tip: ej.consejos
    ? `${ej.consejos} (Añadido manualmente)`
    : "Añadido manualmente",
  descripcion: ej.descripcion,
  imagen_url: ej.imagen_url,
});

// ─── Componente ───────────────────────────────────────────────────────────────
const RutinaSemanal: React.FC = () => {
  const { user, setUser } = useAuth();
  const router = useIonRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diasGuardados = (user as any)?.dias_entrenamiento || [
    "lunes",
    "martes",
    "jueves",
    "viernes",
  ];

  // Estados
  const [diasUsuario, setDiasUsuario] = useState<string[]>(diasGuardados);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(
    diasGuardados[0] || "lunes",
  );
  const [equipamiento, setEquipamiento] = useState<string[]>(["Bandas"]);
  const [rutina, setRutina] = useState<RutinaSemanalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  // Modales
  const [showDiasModal, setShowDiasModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [diasTemporales, setDiasTemporales] = useState<string[]>(diasGuardados);

  // Catálogo
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState<Ejercicio[]>([]);
  const [isLoadingCatalogo, setIsLoadingCatalogo] = useState<boolean>(false);
  const [grupoFiltroModal, setGrupoFiltroModal] = useState<string>("Todos");

  // Expansión (Siruye tanto para rutinas como para previsualización en catálogo)
  const [ejercicioExpandidoId, setEjercicioExpandidoId] = useState<string | null>(null);

  // Animación de entrada
  const [mounted, setMounted] = useState<boolean>(false);

  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const RUTINA_KEY = `rutina_modificada_${user?.id}_${equipamiento.sort().join("-")}`;

  const fetchRutina = useCallback(async () => {
    setIsLoading(true);
    setEjercicioExpandidoId(null);
    try {
      const rutinaGuardada = localStorage.getItem(RUTINA_KEY);
      if (rutinaGuardada) {
        setRutina(JSON.parse(rutinaGuardada));
        return;
      }
      const params = new URLSearchParams({
        objetivo: user?.objetivo || "Aumento de Masa Muscular",
        equipamiento: equipamiento.join(","),
        dias: diasUsuario.join(","),
      });
      const response = await api.get(`/generar?${params.toString()}`);
      setRutina(response.data.rutina);
      localStorage.setItem(RUTINA_KEY, JSON.stringify(response.data.rutina));
    } catch (error) {
      console.error(error);
      presentToast({
        message: "Error al cargar la rutina",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipamiento, user?.objetivo, diasUsuario, user?.id]);

  useEffect(() => {
    fetchRutina();
  }, [fetchRutina]);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [diaSeleccionado, isLoading]);

  const toggleDia = (dia: string) => {
    if (diasTemporales.includes(dia)) {
      setDiasTemporales(diasTemporales.filter((d) => d !== dia));
    } else {
      setDiasTemporales(
        [...diasTemporales, dia].sort(
          (a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b),
        ),
      );
    }
  };

  const guardarDiasPersonalizados = async () => {
    if (diasTemporales.length === 0) {
      presentToast({
        message: "Selecciona al menos un día",
        duration: 2000,
        color: "warning",
      });
      return;
    }
    try {
      await api.put(`/usuarios/${user?.id}/dias`, {
        dias_entrenamiento: diasTemporales,
      });
      setDiasUsuario(diasTemporales);
      setDiaSeleccionado(diasTemporales[0]);
      const newUser = { ...user!, dias_entrenamiento: diasTemporales };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      setShowDiasModal(false);
      presentToast({
        message: "Días actualizados ✅",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error(error);
      presentToast({
        message: "Error al guardar en servidor",
        duration: 2000,
        color: "danger",
      });
    }
  };

  const confirmarFinalizacion = () => {
    presentAlert({
      header: "¿Terminar entrenamiento?",
      message: "¿Estás listo para registrar esta sesión como completada?",
      buttons: [
        { text: "Seguir entrenando", role: "cancel" },
        { text: "Sí, finalizar 🔥", handler: () => finalizarEntrenamiento() },
      ],
    });
  };

  const finalizarEntrenamiento = async () => {
    setIsFinishing(true);
    try {
      await api.post("/registrar", {
        id_usuario: user?.id,
        dia_nombre: diaSeleccionado,
      });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00E676", "#FFFFFF", "#1E1E1E"],
      });
      presentToast({
        message: "¡Increíble! Sesión completada 🔥",
        duration: 3000,
        color: "success",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      presentToast({
        message: err.response?.data?.mensaje || "Error al guardar",
        duration: 2000,
        color: "warning",
      });
    } finally {
      setIsFinishing(false);
    }
  };

  const toggleExpansion = (id: string) =>
    setEjercicioExpandidoId(ejercicioExpandidoId === id ? null : id);

  const eliminarEjercicio = (
    idEjercicio: string | undefined,
    indexFallback: number,
  ) => {
    if (!rutina) return;
    const nuevaRutina = { ...rutina };
    nuevaRutina[diaSeleccionado] = nuevaRutina[diaSeleccionado].filter(
      (ej, index) => {
        if (ej.id_ejercicio) return ej.id_ejercicio !== idEjercicio;
        return index !== indexFallback;
      },
    );
    setRutina(nuevaRutina);
    localStorage.setItem(RUTINA_KEY, JSON.stringify(nuevaRutina));
    presentToast({ message: "Ejercicio eliminado", duration: 1500 });
  };

  const abrirModalAgregar = async () => {
    setGrupoFiltroModal("Todos");
    setShowAddModal(true);
    const equipamientosStr = equipamiento.join(",");

    if (
      ejerciciosCatalogo.length === 0 ||
      ejerciciosCatalogo[0]?.equipamiento !== equipamientosStr
    ) {
      setIsLoadingCatalogo(true);
      try {
        const response = await api.get(
          `/ejercicios?equipamiento=${equipamientosStr}`,
        );
        setEjerciciosCatalogo(response.data.ejercicios);
      } catch {
        presentToast({
          message: "Error al cargar ejercicios",
          duration: 2000,
          color: "danger",
        });
      } finally {
        setIsLoadingCatalogo(false);
      }
    }
  };

  const agregarEjercicio = (ejercicio: Ejercicio) => {
    if (!rutina) return;
    const yaExiste = rutina[diaSeleccionado]?.some(
      (e) => e.id_ejercicio === ejercicio.id_ejercicio,
    );
    if (yaExiste) {
      presentToast({
        message: "Este ejercicio ya está en tu rutina de hoy",
        duration: 2000,
        color: "warning",
      });
      return;
    }
    const nuevaRutina = { ...rutina };
    const nuevoEjercicio = normalizarEjercicioCatalogo(
      ejercicio,
      user?.objetivo,
    );
    if (!nuevaRutina[diaSeleccionado]) nuevaRutina[diaSeleccionado] = [];
    nuevaRutina[diaSeleccionado].push(nuevoEjercicio);
    setRutina(nuevaRutina);
    localStorage.setItem(RUTINA_KEY, JSON.stringify(nuevaRutina));
    setShowAddModal(false);
    presentToast({
      message: `${ejercicio.nombre} agregado ✅`,
      duration: 2000,
      color: "success",
    });
  };

  const confirmarResetRutina = () => {
    presentAlert({
      header: "¿Resetear rutina?",
      message:
        "Se eliminarán tus cambios y se generará una nueva rutina desde el sistema.",
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Resetear",
          handler: () => {
            localStorage.removeItem(RUTINA_KEY);
            fetchRutina();
          },
        },
      ],
    });
  };

  const ejerciciosDelDia = rutina ? (rutina[diaSeleccionado] ?? []) : [];
  const totalSeries = ejerciciosDelDia.reduce(
    (acc, e) => acc + (Number(e.series) || 0),
    0,
  );

  const ejerciciosFiltradosCatalogo =
    grupoFiltroModal === "Todos"
      ? ejerciciosCatalogo
      : ejerciciosCatalogo.filter(
          (ej) => (ej.grupo_muscular || ej.grupo || "") === grupoFiltroModal,
        );

  const gruposDisponibles = [
    "Todos",
    ...Array.from(
      new Set(
        ejerciciosCatalogo.map(
          (ej) => ej.grupo_muscular || ej.grupo || "General",
        ),
      ),
    ).sort(),
  ];

  return (
    <IonPage>
      {/* ── HEADER GLASS ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar
          className="border-b border-white/5"
          style={
            {
              "--background": "rgba(18,18,18,0.85)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between px-4 py-2.5 w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.goBack()}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 shadow-[0_2px_10px_rgba(0,0,0,0.35)] active:scale-90 active:bg-white/10 transition-all duration-200"
              >
                <LuChevronLeft className="text-xl" />
              </button>
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-tight">
                  Plan Semanal
                </span>
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest">
                  {user?.objetivo}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmarResetRutina}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 shadow-[0_2px_10px_rgba(0,0,0,0.35)] hover:text-[#00E676] hover:border-[#00E676]/30 active:scale-90 transition-all duration-200"
              >
                <LuRotateCcw className="text-lg" />
              </button>
              <button
                onClick={() => setShowDiasModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 shadow-[0_2px_10px_rgba(0,0,0,0.35)] hover:text-[#00E676] hover:border-[#00E676]/30 active:scale-90 transition-all duration-200"
              >
                <LuCalendarDays className="text-lg" />
              </button>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        scrollY={true}
        style={{ "--background": "#121212" } as React.CSSProperties}
      >
        <div className="min-h-full flex flex-col px-5 py-6 relative bg-[#121212] pb-28 overflow-hidden">
          {/* Resplandor ambiental */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#00E676]/10 blur-[100px]" />

          <div className="relative">
            {/* ── EQUIPAMIENTO (Soft UI inset selector vertical) ── */}
            <div
              className={`h-18.5 mb-5 flex flex-col justify-center px-5 rounded-2xl bg-[#121212] border border-white/5 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.55),inset_-2px_-2px_6px_rgba(255,255,255,0.03)] transition-all duration-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex items-center gap-2 mb-1.5 select-none mt-2">
                <LuDumbbell className="text-[#00E676] text-xs shrink-0" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Equipamiento
                </span>
              </div>

              <div className="w-full min-w-0 pl-0.5 group">
                <div
                  className="w-full transition-all duration-300 ease-out hover:translate-x-0.5 active:scale-[0.99] active:opacity-80"
                >
                  <IonSelect
                    multiple={true}
                    value={equipamiento}
                    onIonChange={(e) => {
                      const nuevosEquipamientos = e.detail.value;
                      if (nuevosEquipamientos.length === 0) {
                        presentToast({
                          message: "Debes seleccionar al menos un equipamiento",
                          duration: 2000,
                          color: "warning",
                        });
                        return;
                      }
                      setEquipamiento(nuevosEquipamientos);
                      setEjerciciosCatalogo([]);
                    }}
                    className="text-white font-bold text-[14px] bg-transparent text-left p-0! w-full min-h-0 transition-colors duration-300 group-hover:text-[#00E676]/90"
                    interface="alert"
                    okText="Aceptar"
                    cancelText="Cancelar"
                    style={{
                      "--padding-start": "0",
                      "--padding-end": "0",
                      width: "100%",
                      minHeight: "unset",
                      marginBottom: "6px"
                    }}
                  >
                    <IonSelectOption value="Bandas">
                      Bandas de Resistencia
                    </IonSelectOption>
                    <IonSelectOption value="Pesas">
                      Pesas / Gimnasio
                    </IonSelectOption>
                    <IonSelectOption value="Corporal">
                      Peso Corporal
                    </IonSelectOption>
                  </IonSelect>
                </div>
              </div>
            </div>

            {/* ── TABS DE DÍAS ── */}
            <div
              className={`flex gap-3 overflow-x-auto pb-3 mb-5 scrollbar-none transition-all duration-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "60ms" }}
            >
              {diasUsuario.map((dia) => {
                const isSelected = diaSeleccionado === dia;
                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => setDiaSeleccionado(dia)}
                    className={`shrink-0 px-5! py-3! rounded-2xl! text-[11px] font-black uppercase tracking-widest transition-all duration-300 ease-out active:scale-95 cursor-pointer select-none border
                      ${
                        isSelected
                          ? "bg-[#00E676] border-[#00E676]! text-black shadow-[0_6px_20px_rgba(0,230,118,0.4),inset_1px_1px_2px_rgba(255,255,255,0.4)] scale-[1.03]"
                          : "bg-white/5 backdrop-blur-md border-white/10 text-slate-400 shadow-[4px_4px_10px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {DIA_CORTO[dia] || dia.slice(0, 3)}
                  </button>
                );
              })}
            </div>

            {/* ── RESUMEN DEL DÍA (Glass Card) ── */}
            {!isLoading && ejerciciosDelDia.length > 0 && (
              <div
                className={`p-4 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex items-center justify-around mb-6 transition-all duration-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: "110ms" }}
              >
                <div className="flex flex-col items-center gap-1">
                  <LuDumbbell className="text-[#00E676] text-lg" />
                  <span className="text-sm font-black text-white">
                    {ejerciciosDelDia.length}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Ejercicios
                  </span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <LuRepeat className="text-[#00E676] text-lg" />
                  <span className="text-sm font-black text-white">
                    {totalSeries}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Series Total
                  </span>
                </div>
              </div>
            )}

            {/* ── LISTA DE EJERCICIOS ── */}
            <div className="flex flex-col gap-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-3xl bg-white/5 border border-white/10 animate-pulse"
                  />
                ))
              ) : ejerciciosDelDia.length > 0 ? (
                <>
                  {ejerciciosDelDia.map((ejercicio, index) => {
                    const idSeguro =
                      ejercicio.id_ejercicio ?? `fallback_${index}`;
                    const estaExpandido = ejercicioExpandidoId === idSeguro;
                    const grupoMostrado =
                      ejercicio.grupo || ejercicio.grupo_muscular || "General";

                    return (
                      <div
                        key={idSeguro}
                        className={`rounded-3xl overflow-hidden bg-white/5 backdrop-blur-2xl border transition-all duration-500 ease-out ${
                          estaExpandido
                            ? "border-[#00E676]/40 shadow-[0_8px_28px_rgba(0,230,118,0.14)]"
                            : "border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                        } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                        style={{
                          transitionDelay: mounted
                            ? `${150 + index * 60}ms`
                            : "0ms",
                        }}
                      >
                        {/* Cabecera (Acordeón) */}
                        <div
                          className="w-full flex items-center justify-between p-5 bg-transparent text-left gap-4 cursor-pointer select-none"
                          onClick={() => toggleExpansion(idSeguro)}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] font-black text-sm shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05)]">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex flex-col justify-center gap-1 flex-1">
                              <p className="m-0 text-[9px] font-black text-[#00E676] uppercase tracking-widest leading-none">
                                {grupoMostrado}
                              </p>
                              <h3 className="m-0 text-sm font-bold text-white tracking-wide block w-full whitespace-normal wrap-break-word leading-snug">
                                {ejercicio.nombre}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-slate-400 leading-none">
                                <LuRepeat className="text-[10px] text-slate-500 shrink-0" />
                                <span>
                                  {ejercicio.series} × {ejercicio.reps}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pr-1 shrink-0 flex items-center justify-center">
                            <LuChevronDown
                              className={`text-xl transition-transform duration-300 ease-out ${
                                estaExpandido
                                  ? "rotate-180 text-[#00E676]"
                                  : "text-slate-400"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Contenido Expandido */}
                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${estaExpandido ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                        >
                          <div className="overflow-hidden">
                            <div className="px-4 pb-4 border-t border-white/10 pt-4 bg-white/5">
                              {/* Asset Visual */}
                              <div className="w-full rounded-2xl overflow-hidden bg-black/40 mb-4 border border-white/10 flex justify-center p-2">
                                <img
                                  src={
                                    ejercicio.imagen_url
                                      ? `/assets/ejercicios/${ejercicio.imagen_url}`
                                      : "/assets/ejercicios/placeholder.jpg"
                                  }
                                  alt={ejercicio.nombre}
                                  className="max-h-40 object-contain rounded-xl"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      "/assets/ejercicios/placeholder.jpg";
                                  }}
                                />
                              </div>

                              {/* Info y Tips */}
                              {ejercicio.descripcion && (
                                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                  {ejercicio.descripcion}
                                </p>
                              )}
                              {(ejercicio.tip || ejercicio.consejos) && (
                                <div className="flex gap-3 p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400/90 text-xs mb-4">
                                  <LuCircleAlert className="text-lg shrink-0" />
                                  <p className="m-0 leading-relaxed">
                                    <strong className="text-orange-400">
                                      Coach:
                                    </strong>{" "}
                                    {ejercicio.tip || ejercicio.consejos}
                                  </p>
                                </div>
                              )}

                              {/* Acción: Eliminar */}
                              <button
                                onClick={() =>
                                  eliminarEjercicio(
                                    ejercicio.id_ejercicio,
                                    index,
                                  )
                                }
                                className="w-full py-3! flex items-center justify-center gap-2 rounded-2xl! bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest active:scale-[0.98] transition-all duration-200"
                              >
                                <LuTrash2 className="text-sm" /> Quitar de la
                                rutina
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Botón Añadir Manual */}
                  <button
                    onClick={abrirModalAgregar}
                    type="button"
                    className="w-full py-3! rounded-2xl! border border-dashed border-[#00E676]/40 bg-[#00E676]/5 flex flex-col items-center justify-center gap-1 text-[#00E676] font-black text-[11px] uppercase tracking-widest transition-all duration-300 ease-out cursor-pointer select-none active:scale-[0.99] active:bg-[#00E676]/10 hover:border-[#00E676]/60 hover:bg-[#00E676]/10 mt-3"
                  >
                    <LuPlus className="text-xl shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span>Añadir Ejercicio</span>
                  </button>

                  {/* Botón Finalizar */}
                  <button
                    onClick={confirmarFinalizacion}
                    disabled={isFinishing}
                    className="w-full h-14 mt-4 mb-10 flex items-center justify-center gap-2 rounded-2xl! text-sm uppercase tracking-widest font-bold bg-[#00E676] text-black shadow-[0_8px_24px_rgba(0,230,118,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] active:shadow-[0_2px_10px_rgba(0,230,118,0.3),inset_0_2px_6px_rgba(0,0,0,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-200"
                  >
                    {isFinishing ? (
                      <IonSpinner name="crescent" className="text-black" />
                    ) : (
                      <>
                        <LuCircleCheck className="text-lg" /> Finalizar
                        Entrenamiento
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center py-16 text-center transition-all duration-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  <LuCalendarDays className="text-6xl text-white/10 mb-4" />
                  <p className="text-sm font-medium text-slate-400 mb-6">
                    No hay rutina asignada para este día.
                  </p>
                  <button
                    onClick={() => setShowDiasModal(true)}
                    className="px-6 py-3 rounded-2xl text-xs font-bold tracking-widest uppercase border border-[#00E676]/25 text-[#00E676] bg-[#00E676]/5 active:scale-95 transition-all duration-200"
                  >
                    Configurar Días
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MODAL: Configurar Días (Glass Sheet) ── */}
        <IonModal
          isOpen={showDiasModal}
          onDidDismiss={() => setShowDiasModal(false)}
          initialBreakpoint={0.7}
          breakpoints={[0, 0.7, 1]}
          className="bg-transparent"
        >
          <div className="flex flex-col h-full bg-[#121212]/95 backdrop-blur-3xl pt-6 px-6 pb-6 relative rounded-t-4xl border-t border-white/10 shadow-[0_-12px_48px_rgba(0,0,0,0.75)]">
            <div className="w-12 h-1.5 rounded-full bg-white/10 mx-auto mb-6" />
            <div className="flex justify-between items-center mb-4">
              <h2 className="m-0 text-xl font-black text-white">
                Días de entreno
              </h2>
              <button
                onClick={() => setShowDiasModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 active:scale-90 transition-all duration-200"
              >
                <LuX />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Adapta el volumen del plan según tu disponibilidad semanal.
            </p>

            <div className="flex flex-col gap-2 overflow-y-auto mb-6">
              {DIAS_SEMANA.map((dia) => {
                const isActive = diasTemporales.includes(dia);
                return (
                  <div
                    key={dia}
                    onClick={() => toggleDia(dia)}
                    className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                      isActive
                        ? "bg-[#00E676]/10 border-[#00E676]/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold capitalize ${isActive ? "text-[#00E676]" : "text-slate-300"}`}
                    >
                      {dia}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "bg-[#00E676] border-[#00E676]"
                          : "border-slate-500"
                      }`}
                    >
                      {isActive && (
                        <LuCircleCheck className="text-black text-xs" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={guardarDiasPersonalizados}
              className="w-full h-14 mt-auto flex items-center justify-center gap-2 rounded-2xl! text-sm font-bold uppercase tracking-widest bg-[#00E676] text-black shadow-[0_8px_24px_rgba(0,230,118,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] active:scale-[0.98] transition-all duration-200"
            >
              <LuSave className="text-lg" /> Guardar Calendario
            </button>
          </div>
        </IonModal>

        {/* ── MODAL: Agregar Ejercicio Catálogo (Glass Sheet) ── */}
        <IonModal
          isOpen={showAddModal}
          onDidDismiss={() => setShowAddModal(false)}
          initialBreakpoint={0.9}
          breakpoints={[0, 0.9, 1]}
          className="bg-transparent"
        >
          <div className="flex flex-col h-full bg-[#121212]/95 backdrop-blur-3xl pt-6 px-4 pb-6 relative rounded-t-4xl border-t border-white/10 shadow-[0_-12px_48px_rgba(0,0,0,0.75)]">
            <div className="w-12 h-1.5 rounded-full bg-white/10 mx-auto mb-6" />
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="m-0 text-xl font-black text-white">
                Catálogo de Ejercicios
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 active:scale-90 transition-all duration-200"
              >
                <LuX />
              </button>
            </div>

            {/* ── PANEL DE FILTROS ── */}
            <div className="flex flex-col gap-3 mb-5 px-1 animate-slide-up">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 select-none">
                <LuFilter className="text-[#00E676] text-xs" />
                <span>Filtrar por Grupo Muscular</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {(isLoadingCatalogo
                  ? GRUPOS_MUSCULARES_DEFAULT
                  : gruposDisponibles
                ).map((grupo) => {
                  const activo = grupoFiltroModal === grupo;
                  const count =
                    grupo === "Todos"
                      ? ejerciciosCatalogo.length
                      : ejerciciosCatalogo.filter(
                          (ej) =>
                            (ej.grupo_muscular || ej.grupo || "") === grupo,
                        ).length;

                  return (
                    <button
                      key={grupo}
                      type="button"
                      onClick={() => setGrupoFiltroModal(grupo)}
                      className={`w-full py-3.5! px-4 rounded-2xl text-xs font-bold transition-all duration-300 ease-out flex items-center justify-between tracking-wide border cursor-pointer select-none active:scale-[0.98]
                        ${
                          activo
                            ? "bg-[#00E676]/10 border-[#00E676]/50 text-[#00E676] shadow-[inset_0_0_8px_rgba(0,230,118,0.1)]"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      <span className="truncate pr-2">{grupo}</span>
                      {!isLoadingCatalogo && count > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-normal shrink-0 transition-colors duration-300
                            ${activo ? "bg-[#00E676]/20 text-[#00E676]" : "bg-white/10 border border-white/5 text-slate-500"}`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── LISTA FILTRADA ── */}
            <div className="flex-1 overflow-y-auto px-2 pb-10">
              {isLoadingCatalogo ? (
                <div className="flex justify-center py-10">
                  <IonSpinner name="crescent" className="text-[#00E676]" />
                </div>
              ) : ejerciciosFiltradosCatalogo.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <LuTarget className="text-4xl text-slate-500 mb-3 mx-auto" />
                  <p className="text-sm font-medium">
                    No hay ejercicios para este filtro o equipamiento.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 select-none">
                    Resultados: {ejerciciosFiltradosCatalogo.length}
                  </p>
                  
                  {ejerciciosFiltradosCatalogo.map((ej) => {
                    const yaAgregado =
                      rutina?.[diaSeleccionado]?.some(
                        (e) => e.id_ejercicio === ej.id_ejercicio,
                      ) ?? false;
                    const grupoMostrado =
                      ej.grupo_muscular || ej.grupo || "General";
                    
                    const isPreviewOpen = ejercicioExpandidoId === `catalogo-${ej.id_ejercicio}`;

                    return (
                      <div
                        key={ej.id_ejercicio}
                        className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md
                          ${yaAgregado
                            ? "bg-[#00E676]/5 border-[#00E676]/30 shadow-[0_4px_16px_rgba(0,230,118,0.05)]"
                            : "bg-white/5 border-white/10 shadow-[4px_4px_12px_rgba(0,0,0,0.2)] hover:border-white/20"
                          }`}
                      >
                        {/* Cabecera */}
                        <div className="flex items-center justify-between p-4 gap-3 w-full">
                          <div className="flex-1 min-w-0 pr-1">
                            <h4 className="m-0 text-sm font-bold text-white tracking-wide block w-full whitespace-normal wrap-break-word leading-snug mb-1.5">
                              {ej.nombre}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap h-4">
                              <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-slate-300 text-[9px] font-black uppercase tracking-widest inline-flex items-center h-full">
                                {grupoMostrado}
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold uppercase inline-flex items-center h-full">
                                {ej.equipamiento}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Botón Ojo (Ver Demo) */}
                            <button
                              type="button"
                              onClick={() => setEjercicioExpandidoId(isPreviewOpen ? null : `catalogo-${ej.id_ejercicio}`)}
                              className={`p-3! rounded-xl border text-sm transition-all duration-200 cursor-pointer select-none active:scale-95
                                ${isPreviewOpen 
                                  ? "bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676]" 
                                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                                }`}
                              title="Ver demostración"
                            >
                              <LuEye className={`text-base transition-transform duration-200 ${isPreviewOpen ? 'scale-110' : ''}`} />
                            </button>

                            {/* Botón Añadir */}
                            <button
                              type="button"
                              onClick={() => !yaAgregado && agregarEjercicio(ej)}
                              disabled={yaAgregado}
                              className={`shrink-0 px-4! py-3! rounded-xl! text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer select-none
                                ${yaAgregado
                                  ? "bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] opacity-75"
                                  : "bg-[#00E676] text-black active:scale-[0.97] shadow-[0_4px_12px_rgba(0,230,118,0.3)] font-black"
                                }`}
                            >
                              {yaAgregado ? (
                                <div className="flex items-center gap-1.5">
                                  <LuCircleCheck className="text-sm shrink-0" />
                                  <span>Listo</span>
                                </div>
                              ) : (
                                "+ Añadir"
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Desplegable Imagen (Catálogo) */}
                        <div className={`transition-all duration-300 ease-out overflow-hidden border-white/10 bg-black/30
                          ${isPreviewOpen ? 'max-h-64 opacity-100 border-t' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="p-4 flex flex-col items-center justify-center gap-2 relative min-h-40">
                            {ej.imagen_url ? (
                              <img 
                                src={`/assets/ejercicios/${ej.imagen_url}`} 
                                alt={`Demostración de ${ej.nombre}`}
                                className="w-full max-h-48 object-contain rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-[#121212]/50"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "/assets/ejercicios/placeholder.jpg";
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-1.5">
                                <LuImageOff className="text-2xl text-slate-600 animate-pulse" />
                                <span className="text-[11px] font-medium tracking-wide">Imagen demostrativa no disponible</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RutinaSemanal;
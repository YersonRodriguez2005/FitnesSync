import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSpinner,
} from "@ionic/react";
import {
  LuFilter,
  LuFlame,
  LuDumbbell,
  LuTarget,
  LuInfo,
  LuTriangleAlert,
  LuChevronDown,
  LuSearchX,
  LuChevronUp,
} from "react-icons/lu";
import { useIonRouter } from "@ionic/react";
import api from "../services/api";

interface Ejercicio {
  id_ejercicio: string;
  nombre: string;
  grupo_muscular: string;
  equipamiento: string;
  descripcion: string;
  consejos: string;
}

const GRUPOS = [
  "Todos",
  "Pecho",
  "Espalda",
  "Piernas",
  "Brazos",
  "Hombros",
  "Abdomen",
];
const EQUIPOS = ["Todos", "Pesas", "Bandas", "Corporal"];

const muscleEmoji: Record<string, string> = {
  Pecho: "💪",
  Espalda: "🔙",
  Piernas: "🦵",
  Brazos: "🦾",
  Hombros: "🏋️",
  Abdomen: "⚡",
};

const Train: React.FC = () => {
  const router = useIonRouter();

  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [grupoFiltro, setGrupoFiltro] = useState<string>("Todos");
  const [equipamientoFiltro, setEquipamientoFiltro] = useState<string>("Todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tempGrupo, setTempGrupo] = useState<string>("Todos");
  const [tempEquipo, setTempEquipo] = useState<string>("Todos");

  useEffect(() => {
    const fetchEjercicios = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (grupoFiltro !== "Todos") params.append("grupo", grupoFiltro);
        if (equipamientoFiltro !== "Todos")
          params.append("equipamiento", equipamientoFiltro);
        const response = await api.get(`/ejercicios?${params.toString()}`);
        setEjercicios(response.data.ejercicios);
      } catch (error) {
        console.error("Error al cargar los ejercicios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEjercicios();
  }, [grupoFiltro, equipamientoFiltro]);

  // Sincronizar filtros reales con los temporales al abrir el modal
  const openFiltersModal = () => {
    setTempGrupo(grupoFiltro);
    setTempEquipo(equipamientoFiltro);
    setShowFilters(true);
  };

  // Aplicar filtros al cerrar
  const aplicarFiltros = () => {
    setGrupoFiltro(tempGrupo);
    setEquipamientoFiltro(tempEquipo);
    setShowFilters(false);
  };

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
            <div>
              <h1 className="m-0 text-xl font-black text-white tracking-tight">
                Catálogo
              </h1>
              <p className="m-0 mt-0.5 text-[10px] font-bold text-[#00E676] uppercase tracking-widest">
                {ejercicios.length} ejercicios
              </p>
            </div>
            <button
              onClick={openFiltersModal}
              className={`w-10 h-10 rounded-2xl! flex items-center justify-center transition-all duration-300 border! ${
                grupoFiltro !== "Todos" || equipamientoFiltro !== "Todos"
                  ? "bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.2)]"
                  : "bg-white/5 border-white/20 text-slate-400 hover:border-white/40"
              }`}
            >
              <LuFilter className="text-lg" />
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={true}>
        <div className="min-h-full flex flex-col px-5 py-6 relative bg-[#121212] pb-24 overflow-hidden">
          {/* Orbe Ambient Verde */}
          <div className="absolute top-0 right-0 w-75 h-75 bg-[#00E676]/10 rounded-full blur-[80px] pointer-events-none" />

          {/* ── CTA BANNER (Plan de Hoy) ── */}
          <div className="flex items-center justify-between p-5 mb-6 rounded-3xl bg-linear-to-br from-[#00E676]/20 to-[#00E676]/5 border border-[#00E676]/30 shadow-[0_8px_32px_rgba(0,230,118,0.1)] relative overflow-hidden animate-slide-up">
            <div className="relative z-10 flex-1">
              <p className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest mb-1 opacity-80">
                ¿Listo para sudar?
              </p>
              <h2 className="text-xl font-black text-white tracking-tight m-0">
                Comenzar sesión
              </h2>
            </div>

            <button
              onClick={() => router.push("/app/train/rutina")}
              className="fs-soft-btn px-6! py-3.5! flex items-center justify-center gap-2 text-s uppercase tracking-widest text-[#00E676] bg-[#121212]/80 backdrop-blur-md relative z-10 font-bold whitespace-nowrap"
            >
              <LuFlame className="text-base shrink-0 animate-pulse" />
              <span>Ir al plan</span>
            </button>
          </div>

          {/* ── PANEL DE FILTROS ── */}
          {showFilters && (
            <div className="fixed inset-0 z-50 animate-fade-in">
              {/* Fondo Oscuro / Backdrop */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
                onClick={() => setShowFilters(false)}
              />

              {/* Contenedor del Filtro Estilo Glassmorphism Deslizable */}
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-4xl bg-[#121212]/95 border-t border-white/10 p-6 flex flex-col gap-6 shadow-[0_-12px_40px_rgba(0,0,0,0.6)] pointer-events-auto">
                {/* Barra superior de arrastre estético */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-2 mb-1" />

                {/* Encabezado del Modal */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h2 className="m-0 text-lg font-black text-white tracking-wide">
                    Filtrar Ejercicios
                  </h2>
                  <button
                    onClick={() => {
                      setTempGrupo("Todos");
                      setTempEquipo("Todos");
                    }}
                    className="text-xs font-bold text-[#00E676] bg-transparent border-none p-0 cursor-pointer active:opacity-70"
                  >
                    Restablecer
                  </button>
                </div>

                {/* Zona de scroll interna */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-1 pb-4 scrollbar-none">
                  {/* Sección: Equipamiento */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                      <LuDumbbell className="text-[#00E676] text-xs" />{" "}
                      Equipamiento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {EQUIPOS.map((eq) => {
                        const activo = tempEquipo === eq;
                        return (
                          <button
                            key={eq}
                            type="button"
                            onClick={() => setTempEquipo(eq)}
                            className={`w-full py-2.5! px-4 rounded-2xl text-xs font-bold transition-all text-center tracking-wide border cursor-pointer select-none pointer-events-auto ${
                              activo
                                ? "bg-[#00E676]/10 border-[#00E676]/50 text-[#00E676] shadow-[inset_0_0_8px_rgba(0,230,118,0.1)]"
                                : "bg-white/3 border-white/5 text-slate-400 active:bg-white/10"
                            }`}
                          >
                            {eq === "Todos" ? "Cualquiera" : eq}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sección: Músculo */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                      <LuTarget className="text-[#00E676] text-xs" /> Grupo
                      Muscular
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {GRUPOS.map((g) => {
                        const activo = tempGrupo === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setTempGrupo(g)}
                            className={`w-full py-2.5! px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 tracking-wide border cursor-pointer select-none pointer-events-auto ${
                              activo
                                ? "bg-[#00E676]/10 border-[#00E676]/50 text-[#00E676] shadow-[inset_0_0_8px_rgba(0,230,118,0.1)]"
                                : "bg-white/3 border-white/5 text-slate-400 active:bg-white/10"
                            }`}
                          >
                            <span className="text-sm shrink-0">
                              {muscleEmoji[g] || "🏋️"}
                            </span>
                            <span>{g}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botón de Acción Principal para Aplicar */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={aplicarFiltros}
                    className="w-full py-3! rounded-2xl! bg-[#00E676] text-black font-black text-sm uppercase tracking-widest shadow-[0_8px_24px_rgba(0,230,118,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer select-none pointer-events-auto"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── LISTADO DE EJERCICIOS ── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <IonSpinner
                name="crescent"
                className="text-[#00E676] scale-150"
              />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                Cargando ejercicios...
              </span>
            </div>
          ) : ejercicios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
              <LuSearchX className="text-5xl text-slate-500/50 mb-4" />
              <p className="text-sm font-medium text-slate-400 mb-6">
                No hay resultados para estos filtros.
              </p>
              <button
                onClick={() => {
                  setGrupoFiltro("Todos");
                  setEquipamientoFiltro("Todos");
                  setShowFilters(false);
                }}
                className="fs-soft-btn px-6 py-3 text-xs tracking-widest text-[#00E676]"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col gap-4 animate-slide-up"
              style={{ animationDelay: "150ms" }}
            >
              {ejercicios.map((ej) => {
                const isOpen = expandedId === ej.id_ejercicio;

                return (
                  <div
                    key={ej.id_ejercicio}
                    className={`fs-glass-card overflow-hidden transition-all duration-300 ${
                      isOpen ? "border-[#00E676]/40 bg-[#121212]/80" : ""
                    }`}
                  >
                    {/* Cabecera Interactiva (Usamos un div para evitar conflictos de layouts con botones de Ionic) */}
                    <div
                      className="w-full flex items-center justify-between p-5 bg-transparent text-left gap-4 cursor-pointer select-none"
                      onClick={() =>
                        setExpandedId(isOpen ? null : ej.id_ejercicio)
                      }
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Contenedor del Emoji */}
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-[inset_2px_2px_4px_rgba(255,255,255,0.02)] shrink-0">
                          {muscleEmoji[ej.grupo_muscular] || "🏋️"}
                        </div>

                        {/* Bloque de Información alineado hacia arriba con respecto al Emoji */}
                        {/* Contenedor de Texto Centrado Verticalmente */}
                        <div className="min-w-0 flex flex-col justify-center gap-1 flex-1">
                          {/* Grupo Muscular + Equipamiento Unificados */}
                          <div className="flex items-center gap-1.5 flex-wrap h-4">
                            <span className="text-[9px] font-black text-[#00E676] uppercase tracking-widest inline-flex items-center h-full">
                              {ej.grupo_muscular}
                            </span>
                            <span className="text-[9px] text-slate-600 font-bold inline-flex items-center h-full">
                              •
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-wider inline-flex items-center h-full">
                              {ej.equipamiento}
                            </span>
                          </div>

                          {/* Título Principal Corregido para múltiples líneas */}
                          <h3 className="m-0 text-sm font-bold text-white tracking-wide block w-full whitespace-normal wrap-break-word leading-snug">
                            {ej.nombre}
                          </h3>
                        </div>
                      </div>

                      {/* Flecha Derecha */}
                      <div className="pr-1 shrink-0 flex items-center justify-center">
                        {isOpen ? (
                          <LuChevronUp className="text-slate-400 text-xl transition-transform duration-200" />
                        ) : (
                          <LuChevronDown className="text-slate-400 text-xl transition-transform duration-200" />
                        )}
                      </div>
                    </div>

                    {/* Contenido Desplegable */}
                    <div
                      className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-white/5">
                        <div className="flex gap-3 py-3 border-b border-white/5">
                          <LuInfo className="text-lg text-[#00E676] shrink-0 mt-0.5" />
                          <p className="m-0 text-xs font-medium text-slate-300 leading-relaxed">
                            {ej.descripcion}
                          </p>
                        </div>

                        {ej.consejos && (
                          <div className="flex gap-3 pt-3">
                            <LuTriangleAlert className="text-lg text-orange-400 shrink-0 mt-0.5" />
                            <p className="m-0 text-xs font-medium text-orange-400/90 leading-relaxed">
                              <strong className="text-orange-400">
                                Tip Técnico:{" "}
                              </strong>
                              {ej.consejos}
                            </p>
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
      </IonContent>
    </IonPage>
  );
};

export default Train;

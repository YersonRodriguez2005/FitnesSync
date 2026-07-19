import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonSpinner,
  useIonToast,
  useIonAlert,
} from "@ionic/react";
import {
  LuUser,
  LuMail,
  LuLock,
  LuLogOut,
  LuSave,
  LuCamera,
  LuChevronRight,
  LuDumbbell,
  LuActivity,
  LuShieldCheck,
  LuSquarePen
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";
import api from "../services/api";

const Profile: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [isSaving, setIsSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const handleLogout = () => {
    presentAlert({
      header: "Cerrar Sesión",
      message: "¿Seguro que quieres salir de tu cuenta?",
      buttons: [
        { text: "Cancelar", role: "cancel", cssClass: "text-slate-400" },
        {
          text: "Sí, salir",
          role: "destructive",
          cssClass: "text-red-500 font-bold",
          handler: () => {
            logout();
            history.replace("/login");
          },
        },
      ],
      cssClass: "custom-alert-neumorphic"
    });
  };

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      presentToast({ message: "El nombre no puede estar vacío", duration: 2000, color: "warning" });
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`/update-account/${user?.id}`, { nombre });
      const newUser = { ...user!, nombre };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      setEditingName(false);
      presentToast({ message: "Nombre actualizado ✅", duration: 2000, color: "success" });
    } catch {
      presentToast({ message: "Error al actualizar", duration: 2000, color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const cambiarPassword = () => {
    presentAlert({
      header: "Cambiar Contraseña",
      inputs: [
        { name: "oldPassword", type: "password", placeholder: "Contraseña actual", cssClass: "custom-alert-input" },
        { name: "newPassword", type: "password", placeholder: "Nueva contraseña", cssClass: "custom-alert-input" },
      ],
      buttons: [
        { text: "Cancelar", role: "cancel", cssClass: "text-slate-400" },
        {
          text: "Actualizar",
          cssClass: "text-[#00E676] font-bold",
          handler: async (data) => {
            if (!data.oldPassword || !data.newPassword) {
              presentToast({ message: "Ambos campos son obligatorios", duration: 2000, color: "warning" });
              return false;
            }
            try {
              await api.put(`/change-password/${user?.id}`, data);
              presentToast({ message: "Contraseña actualizada ✅", duration: 2000, color: "success" });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              presentToast({ message: error.response?.data?.mensaje || "Contraseña actual incorrecta", duration: 2500, color: "danger" });
              return false;
            }
          },
        },
      ],
      cssClass: "custom-alert-neumorphic"
    });
  };

  const initials = (user?.nombre || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <IonPage>
      {/* ── HEADER NEUMÓRFICO ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="bg-transparent border-b border-white/5" style={{ '--background': 'rgba(18,18,18,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-4 py-2 w-full">
            <h1 className="m-0 text-xl font-black text-white tracking-tight">Mi Perfil</h1>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={true}>
        <div className="min-h-full flex flex-col px-5 py-6 relative bg-[#121212] pb-28">

          {/* ── HERO AVATAR ── */}
          <div className="flex flex-col items-center justify-center mb-8 animate-slide-up">
            <div className="relative mb-4">
              {/* Avatar Ring Neumórfico */}
              <div className="w-24 h-24 rounded-4xl bg-[#121212] border border-[#00E676]/20 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.03),0_0_20px_rgba(0,230,118,0.15)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#00E676]/10" />
                <span className="text-3xl font-black text-white tracking-tighter relative z-10">{initials}</span>
              </div>
              {/* Botón de Cámara Flotante */}
              <button 
                onClick={() => presentToast({ message: "Gestión de avatar próximamente", duration: 2000 })}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#00E676] text-black flex items-center justify-center shadow-[0_4px_10px_rgba(0,230,118,0.4)] active:scale-90 transition-transform"
              >
                <LuCamera className="text-lg" />
              </button>
            </div>
            
            <h2 className="m-0 text-2xl font-black text-white tracking-tight">{user?.nombre || "Atleta"}</h2>
            <p className="m-0 mt-1 text-sm font-medium text-slate-400">{user?.email}</p>

            {/* Píldoras Informativas */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                <LuDumbbell className="text-[#00E676] text-sm" /> {user?.objetivo || "Sin objetivo"}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                <LuActivity className="text-[#00E676] text-sm" /> {user?.somatotipo || "Sin definir"}
              </div>
            </div>
          </div>

          {/* ── DATOS PERSONALES (Glass Card) ── */}
          <div className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Datos Personales</p>
            <div className="fs-glass-card p-0 overflow-hidden">
              
              {/* Fila: Nombre */}
              <div className="flex items-center p-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shrink-0 mr-4">
                  <LuUser className="text-xl" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="m-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Nombre Completo</p>
                  {editingName ? (
                    <div className="fs-soft-input-container h-9 mt-1">
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-white text-sm font-medium h-full"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <p className="m-0 text-sm font-bold text-white truncate">{user?.nombre}</p>
                  )}
                </div>
                {editingName ? (
                  <button 
                    onClick={guardarCambios} 
                    disabled={isSaving}
                    className="w-9 h-9 rounded-xl bg-[#00E676]/20 text-[#00E676] flex items-center justify-center active:scale-90 transition-transform shrink-0 disabled:opacity-50"
                  >
                    {isSaving ? <IonSpinner name="crescent" className="scale-50" /> : <LuSave className="text-lg" />}
                  </button>
                ) : (
                  <button 
                    onClick={() => setEditingName(true)}
                    className="w-9 h-9 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center active:scale-90 transition-transform shrink-0 hover:text-white"
                  >
                    <LuSquarePen className="text-base" />
                  </button>
                )}
              </div>

              {/* Fila: Correo */}
              <div className="flex items-center p-4">
                <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/20 flex items-center justify-center text-[#2979FF] shrink-0 mr-4">
                  <LuMail className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                  <p className="m-0 text-sm font-bold text-white truncate opacity-70">{user?.email || "No disponible"}</p>
                </div>
                <span className="px-2 py-1 rounded-md bg-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/10">Fijo</span>
              </div>

            </div>
          </div>

          {/* ── CONFIGURACIÓN (Glass Card) ── */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Configuración de Perfil</p>
            <div className="fs-glass-card p-0 overflow-hidden">
              
              {/* Botón: Objetivo y Somatotipo */}
              <button 
                onClick={() => history.push("/onboarding")}
                className="w-full flex items-center p-4 border-b border-white/5 bg-transparent active:bg-white/5 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shrink-0 mr-4">
                  <LuDumbbell className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Biotipo y Meta</p>
                  <p className="m-0 text-sm font-bold text-white truncate">{user?.objetivo}</p>
                </div>
                <LuChevronRight className="text-slate-500 text-xl" />
              </button>

              {/* Botón: Contraseña */}
              <button 
                onClick={cambiarPassword}
                className="w-full flex items-center p-4 border-b border-white/5 bg-transparent active:bg-white/5 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 shrink-0 mr-4">
                  <LuLock className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Contraseña</p>
                  <p className="m-0 text-sm font-bold text-white truncate">••••••••</p>
                </div>
                <LuChevronRight className="text-slate-500 text-xl" />
              </button>

              {/* Fila: Seguridad (Estática) */}
              <div className="flex items-center p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mr-4">
                  <LuShieldCheck className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Seguridad de Cuenta</p>
                  <p className="m-0 text-sm font-bold text-white truncate">Protegida</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">✓</span>
              </div>

            </div>
          </div>

          {/* ── BOTÓN CERRAR SESIÓN ── */}
          <button 
            onClick={handleLogout}
            className="fs-soft-btn w-full h-14 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 active:scale-95 transition-all animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <LuLogOut className="text-lg" /> Cerrar Sesión
          </button>

          {/* ── FOOTER ── */}
          <div className="mt-12 flex flex-col items-center justify-center opacity-30 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <img src="/assets/logo.png" alt="FitnesSync Logo" className="w-8 h-8 rounded-lg mb-2 grayscale" />
            <p className="m-0 text-[10px] font-bold tracking-widest uppercase text-white">FitnesSync v2.0</p>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
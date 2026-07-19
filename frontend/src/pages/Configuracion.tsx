import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonToolbar, 
  IonSelect, 
  IonSelectOption, 
  IonSpinner, 
  useIonToast, 
  useIonRouter 
} from '@ionic/react';
import { 
  LuSave, 
  LuActivity, 
  LuTarget, 
  LuChevronLeft, 
  LuSettings 
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Configuracion: React.FC = () => {
  const { user, setUser } = useAuth(); 
  const router = useIonRouter();
  const [present] = useIonToast();

  const [somatotipo, setSomatotipo] = useState(user?.somatotipo || 'Ectomorfo');
  const [objetivo, setObjetivo] = useState(user?.objetivo || 'Aumento de Masa Muscular');
  const [isSaving, setIsSaving] = useState(false);

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      await api.put(`/update-profile/${user?.id}`, { somatotipo, objetivo });
      
      const newUser = { ...user!, somatotipo, objetivo };
      setUser(newUser);
      localStorage.setItem('fitness_user', JSON.stringify(newUser));

      present({
        message: '¡Perfil actualizado! Tus rutinas y dieta se han reajustado.',
        duration: 3000,
        color: 'success'
      });
      
      // Regresa a la vista anterior (Perfil)
      setTimeout(() => router.goBack(), 500);
    } catch (err) {
      console.error(err);
      present({
        message: 'Error al actualizar tu perfil.',
        duration: 2000,
        color: 'danger'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage>
      {/* ── HEADER NEUMÓRFICO ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="bg-transparent border-b border-white/5" style={{ '--background': 'rgba(18,18,18,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3 px-4 py-2 w-full">
            <button 
              onClick={() => router.goBack()} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 active:scale-95 transition-all"
            >
              <LuChevronLeft className="text-xl" />
            </button>
            <h1 className="m-0 text-xl font-black text-white tracking-tight">Configuración</h1>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={false}>
        <div className="min-h-full flex flex-col px-6 py-8 relative overflow-hidden bg-[#121212]">
          
          {/* ── Orbes Ambientales ── */}
          <div className="absolute -top-24 -right-16 w-75 h-75 rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.1)_0%,transparent_70%)] animate-pulse pointer-events-none" />

          <div className="w-full max-w-100 mx-auto relative z-10 flex flex-col flex-1 pt-4">
            
            {/* Cabecera Descriptiva */}
            <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#121212] border border-[#00E676]/20 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.03),0_0_20px_rgba(0,230,118,0.15)] mb-4 relative">
                <div className="absolute inset-0 bg-[#00E676]/5 rounded-3xl" />
                <LuSettings className="w-10 h-10 text-[#00E676] relative z-10" />
              </div>
              <h2 className="m-0 text-3xl font-black text-white tracking-tight">Tu Biometría</h2>
              <p className="mt-2 text-sm text-[#B0B0B0] font-medium tracking-wide">
                Ajusta estos parámetros para recalcular tu plan.
              </p>
            </div>

            {/* ── Tarjeta de Formulario (Glassmorphism) ── */}
            <div className="fs-glass-card animate-slide-up p-6!" style={{ animationDelay: '100ms' }}>
              
              <div className="flex flex-col gap-6">
                
                {/* ── Somatotipo ── */}
                <div>
                  <label className="block text-[10px] font-bold text-[#B0B0B0] uppercase tracking-widest mb-2 ml-1">
                    Mi Somatotipo
                  </label>
                  <div className="fs-soft-input-container h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LuActivity className="text-[#00E676] text-xl" />
                      <span className="text-sm font-bold text-white uppercase tracking-wider">
                        {somatotipo}
                      </span>
                    </div>
                    <IonSelect 
                      value={somatotipo} 
                      onIonChange={e => setSomatotipo(e.detail.value)}
                      className="opacity-0 absolute inset-0 w-full h-full"
                      interface="action-sheet"
                    >
                      <IonSelectOption value="Ectomorfo">Ectomorfo</IonSelectOption>
                      <IonSelectOption value="Mesomorfo">Mesomorfo</IonSelectOption>
                      <IonSelectOption value="Endomorfo">Endomorfo</IonSelectOption>
                    </IonSelect>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pointer-events-none">Cambiar</span>
                  </div>
                </div>

                {/* ── Objetivo ── */}
                <div>
                  <label className="block text-[10px] font-bold text-[#B0B0B0] uppercase tracking-widest mb-2 ml-1">
                    Mi Objetivo
                  </label>
                  <div className="fs-soft-input-container h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LuTarget className="text-[#00E676] text-xl" />
                      <span className="text-sm font-bold text-white uppercase tracking-wider truncate max-w-50">
                        {objetivo === "Bajar de peso" ? "Definición" : objetivo === "Aumento de Masa Muscular" ? "Volumen" : objetivo}
                      </span>
                    </div>
                    <IonSelect 
                      value={objetivo} 
                      onIonChange={e => setObjetivo(e.detail.value)}
                      className="opacity-0 absolute inset-0 w-full h-full"
                      interface="action-sheet"
                    >
                      <IonSelectOption value="Aumento de Masa Muscular">Volumen (Masa)</IonSelectOption>
                      <IonSelectOption value="Bajar de peso">Definición (Perder peso)</IonSelectOption>
                      <IonSelectOption value="Mantenimiento">Mantenimiento</IonSelectOption>
                    </IonSelect>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pointer-events-none">Cambiar</span>
                  </div>
                </div>

              </div>
              
            </div>

            {/* ── Botón Guardar (Fijado Abajo) ── */}
            <div className="mt-auto pt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <button
                onClick={guardarCambios}
                disabled={isSaving}
                className="fs-soft-btn w-full h-14 flex items-center justify-center gap-2 text-sm uppercase tracking-widest bg-[#00E676] text-black shadow-[0_4px_20px_rgba(0,230,118,0.4)] disabled:opacity-50"
              >
                {isSaving ? (
                  <IonSpinner name="crescent" className="text-black" />
                ) : (
                  <>
                    <LuSave className="text-lg" /> Guardar Cambios
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Configuracion;
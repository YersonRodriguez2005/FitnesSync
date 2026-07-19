import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  useIonRouter,
  IonSpinner,
  IonModal,
} from "@ionic/react";
import { 
  LuUser, 
  LuMail, 
  LuLock, 
  LuArrowLeft, 
  LuUserPlus, 
  LuCircleAlert,
  LuCircleCheck,
  LuActivity,
  LuX,
  LuEyeOff,
  LuEye
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../utils/validations";

const Register: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // ✅ CORRECCIÓN: El estado showPassword debe ir en el nivel superior del componente
  const [showPassword, setShowPassword] = useState(false); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [erroresForm, setErroresForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [showTerms, setShowTerms] = useState(false);
  
  const router = useIonRouter();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const errorNombre = validateName(nombre);
    const errorEmail = validateEmail(email);
    const errorPassword = validatePassword(password);

    setErroresForm({
      nombre: errorNombre || "",
      email: errorEmail || "",
      password: errorPassword || "",
    });

    if (errorNombre || errorEmail || errorPassword) return;

    setIsLoading(true);
    try {
      await register(nombre, email, password);
      router.push("/login", "forward", "push");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Indicador de fuerza de la contraseña
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4); 
  };

  const strengthLevel = getPasswordStrength();
  const strengthLabels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  
  // Clases Tailwind dinámicas para los colores de fuerza
  const getStrengthColorClass = (level: number) => {
    switch (level) {
      case 1: return "bg-red-500 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
      case 2: return "bg-orange-500 text-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
      case 3: return "bg-yellow-500 text-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
      case 4: return "bg-[#00E676] text-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.5)]";
      default: return "bg-transparent text-transparent";
    }
  };

  const currentStrengthClasses = getStrengthColorClass(strengthLevel);

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className="min-h-full flex flex-col justify-center px-6 py-10 relative overflow-hidden bg-[#121212]">
          
          {/* ── Orbes Ambientales (Verde Neón) ── */}
          {/* ✅ CORRECCIÓN: Clases Tailwind arregladas a medidas arbitrarias correctas */}
          <div className="absolute -top-32 -left-24 w-90 h-90 rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.12)_0%,transparent_70%)] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-70 h-70 rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Botón de Retroceso Flotante */}
          <button 
            onClick={() => router.goBack()}
            className="absolute top-12 left-6 z-20 w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/70 active:scale-95 transition-all"
          >
            <LuArrowLeft className="text-xl" />
          </button>

          {/* ✅ CORRECCIÓN: max-w-100 reemplazado por max-w-[400px] */}
          <div className="w-full max-w-100 mx-auto relative z-10 flex flex-col justify-center flex-1 pt-12">
            
            {/* ── Marca y Logo ── */}
            <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[28px] bg-[#121212] border border-[#00E676]/20 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.03),0_0_20px_rgba(0,230,118,0.15)] mb-5 relative">
                <div className="absolute inset-0 bg-[#00E676]/5 rounded-[28px]" />
                <img 
                  src="/assets/logo.png" 
                  alt="FitnesSync Logo" 
                  className="w-14 h-14 object-cover relative z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('fallback-icon');
                  }}
                />
                <LuActivity className="w-12 h-12 text-[#00E676] hidden fallback-icon:block relative z-10" />
              </div>
              <h1 className="m-0 text-3xl font-black text-white tracking-tight">
                Crear Cuenta
              </h1>
              <p className="mt-1.5 text-sm text-[#B0B0B0] font-medium tracking-wide">
                Únete a FitnesSync hoy
              </p>
            </div>

            {/* ── Tarjeta de Formulario (Glassmorphism) ── */}
            <div className="fs-glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <form onSubmit={handleRegister} className="flex flex-col gap-4 p-6">
                
                {/* Campo Nombre */}
                <div>
                  <label className="block text-[10px] font-bold text-[#B0B0B0] uppercase tracking-widest mb-2 ml-1">
                    Nombre Completo
                  </label>
                  <div className={`fs-soft-input-container h-14 group ${erroresForm.nombre ? 'border-red-500/50!' : nombre ? 'border-[#00E676]/40!' : ''}`}>
                    <LuUser className={`text-xl mr-3 transition-transform group-focus-within:scale-110 ${erroresForm.nombre ? 'text-red-400' : 'text-[#00E676]'}`} />
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-white placeholder-[#B0B0B0]/50 text-sm font-medium h-full"
                    />
                    {nombre && !erroresForm.nombre && <LuCircleCheck className="text-[#00E676] text-lg ml-2" />}
                  </div>
                  {erroresForm.nombre && <p className="m-0 mt-1.5 ml-2 text-[10px] text-red-400 font-bold">{erroresForm.nombre}</p>}
                </div>

                {/* Campo Correo */}
                <div>
                  <label className="block text-[10px] font-bold text-[#B0B0B0] uppercase tracking-widest mb-2 ml-1">
                    Correo electrónico
                  </label>
                  <div className={`fs-soft-input-container h-14 group ${erroresForm.email ? 'border-red-500/50!' : email ? 'border-[#00E676]/40!' : ''}`}>
                    <LuMail className={`text-xl mr-3 transition-transform group-focus-within:scale-110 ${erroresForm.email ? 'text-red-400' : 'text-[#00E676]'}`} />
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-white placeholder-[#B0B0B0]/50 text-sm font-medium h-full"
                    />
                    {email && !erroresForm.email && <LuCircleCheck className="text-[#00E676] text-lg ml-2" />}
                  </div>
                  {erroresForm.email && <p className="m-0 mt-1.5 ml-2 text-[10px] text-red-400 font-bold">{erroresForm.email}</p>}
                </div>

                {/* Campo Contraseña Modificado (Con botón Ojo Interactivo) */}
                <div>
                  <label className="block text-[10px] font-bold text-[#B0B0B0] uppercase tracking-widest mb-2 ml-1">
                    Contraseña
                  </label>
                  <div className={`fs-soft-input-container h-14 group flex items-center justify-between pr-2 ${erroresForm.password ? 'border-red-500/50!' : ''}`}>
                    <div className="flex items-center flex-1 h-full min-w-0">
                      <LuLock className={`text-xl mr-3 transition-transform group-focus-within:scale-110 shrink-0 ${erroresForm.password ? 'text-red-400' : 'text-[#00E676]'}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-white placeholder-[#B0B0B0]/50 text-sm font-medium h-full"
                      />
                    </div>

                    {/* Botón Ojo Soft UI para ocultar/ver contraseña */}
                    <button
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer select-none bg-white/5 border border-white/10 shrink-0 ml-2"
                    >
                      {showPassword ? (
                        <LuEyeOff className="text-base text-[#00E676]" />
                      ) : (
                        <LuEye className="text-base" />
                      )}
                    </button>
                  </div>

                  {/* Indicador de Fuerza Neumórfico */}
                  {password && (
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${
                              i <= strengthLevel ? currentStrengthClasses.split(' ')[0] + ' ' + currentStrengthClasses.split(' ')[2] : 'bg-white/10'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-bold min-w-12 text-right transition-colors duration-300 ${currentStrengthClasses.split(' ')[1]}`}>
                        {strengthLabels[strengthLevel]}
                      </span>
                    </div>
                  )}

                  {erroresForm.password && <p className="m-0 mt-1.5 ml-2 text-[10px] text-red-400 font-bold">{erroresForm.password}</p>}
                </div>

                {/* Mensaje de Error Global */}
                {error && (
                  <div className="flex items-center gap-2 p-3.5 mt-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                    <LuCircleAlert className="text-lg shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Botón Principal Invertido (Fondo Verde con Texto Negro Premium) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="fs-soft-btn w-full h-14 mt-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#00E676]! text-black! shadow-[0_4px_20px_rgba(0,230,118,0.35)]"
                >
                  {isLoading ? (
                    <IonSpinner name="crescent" className="text-black" />
                  ) : (
                    <>
                      <LuUserPlus className="text-lg shrink-0" />
                      <span>Registrarme</span>
                    </>
                  )}
                </button>
              </form>

              {/* Términos */}
              <p className="text-center text-[11px] text-[#B0B0B0] font-medium px-6 pb-6 m-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
                Al registrarte aceptas nuestros{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-[#00E676] font-bold bg-transparent p-0 underline underline-offset-2 hover:text-[#00E676]/80 transition-colors"
                >
                  Términos de uso
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ── MODAL: Términos y Condiciones (Glass Sheet) ── */}
        <IonModal isOpen={showTerms} onDidDismiss={() => setShowTerms(false)} className="bg-transparent">
          <div className="flex flex-col h-full bg-[#121212]/95 backdrop-blur-3xl pt-10 px-6 pb-6 relative">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-2xl font-black text-white tracking-tight">Términos de Uso</h2>
              <button 
                onClick={() => setShowTerms(false)}
                className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 active:scale-95 transition-all"
              >
                <LuX className="text-xl" />
              </button>
            </div>

            {/* Contenido (Heredado de tu documento, estilizado) */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-[#B0B0B0] text-xs font-bold uppercase tracking-widest mb-6">
                Última actualización: Abril de 2026
              </p>

              <div className="space-y-6 text-sm text-[#B0B0B0] leading-relaxed">
                <p>
                  Bienvenido a <strong className="text-white">FitnesSync</strong>. Al descargar, acceder o utilizar nuestra aplicación móvil, usted acepta estar sujeto a los siguientes Términos y Condiciones de Uso.
                </p>

                <section>
                  <h3 className="text-white text-base font-bold mb-2 flex items-center gap-2">
                    <span className="text-[#00E676]">1.</span> Aceptación de los Términos
                  </h3>
                  <p>Al registrar una cuenta, usted declara que es mayor de edad (18 años) o cuenta con autorización expresa de sus tutores legales.</p>
                </section>

                <section>
                  <h3 className="text-white text-base font-bold mb-2 flex items-center gap-2">
                    <span className="text-[#00E676]">2.</span> Descargo de Responsabilidad Médica
                  </h3>
                  <p className="mb-2 text-red-400 font-medium">FitnesSync es una herramienta informativa.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-white">No somos médicos clínicos:</strong> La información no sustituye consejo médico.</li>
                    <li><strong className="text-white">Riesgo asumido:</strong> El uso de los planes se realiza bajo su propio riesgo. Si experimenta dolor, detenga el ejercicio.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-white text-base font-bold mb-2 flex items-center gap-2">
                    <span className="text-[#00E676]">3.</span> Privacidad y Datos
                  </h3>
                  <p>
                    El manejo de su información personal se rige por nuestra Política de Privacidad, estructurada en cumplimiento con la Ley Estatutaria 1581 de 2012 de Colombia.
                  </p>
                </section>
              </div>
            </div>

            {/* Botón Aceptar (Fijado abajo) */}
            <div className="pt-6 mt-auto">
               <button
                  onClick={() => setShowTerms(false)}
                  className="fs-soft-btn w-full h-14 flex items-center justify-center text-sm uppercase tracking-widest active:scale-95 transition-all bg-[#00E676]! text-black!"
                >
                  Entendido
                </button>
            </div>

          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Register;
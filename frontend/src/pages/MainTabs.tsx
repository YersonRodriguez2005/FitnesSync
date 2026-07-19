import React from 'react';
import { 
  IonTabs, 
  IonRouterOutlet, 
  IonTabBar, 
  IonTabButton, 
  IonLabel 
} from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { 
  LuHouse, 
  LuDumbbell, 
  LuUtensilsCrossed, 
  LuUser 
} from 'react-icons/lu';

// Importamos tus páginas de los tabs
import Dashboard from './Dashboard';
import Train from './Train';
import RutinaSemanal from './RutinaSemanal';
import Profile from './Profile';
import Nutrition from './Nutrition';

const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet animated={true}>
        
        {/* ── Rutas Principales de las Pestañas ── */}
        <Route exact path="/app/dashboard">
          <Dashboard />
        </Route>
        
        <Route exact path="/app/train">
          <Train />
        </Route>
        
        {/* Sub-ruta de Entrenamiento */}
        <Route exact path="/app/train/rutina">
          <RutinaSemanal />
        </Route>
        
        <Route exact path="/app/nutrition">
          <Nutrition />
        </Route>
        
        <Route exact path="/app/profile">
          <Profile />
        </Route>

        {/* Redirección por defecto al entrar a /app */}
        <Route exact path="/app">
          <Redirect to="/app/dashboard" />
        </Route>
        
      </IonRouterOutlet>

      {/* ── Tab Bar Neumórfico (Glassmorphism) ── */}
      <IonTabBar 
        slot="bottom" 
        className="border-t border-white/5"
        style={{ 
          '--background': 'rgba(18,18,18,0.88)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          '--color': '#94a3b8', /* text-slate-400 */
          '--color-selected': '#00E676', /* Verde Neón de FitnesSync */
          height: '65px',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)'
        }}
      >
        <IonTabButton tab="dashboard" href="/app/dashboard" className="transition-all duration-300">
          <LuHouse className="text-xl mb-1" />
          <IonLabel className="text-[9px] font-bold tracking-widest uppercase">Inicio</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="train" href="/app/train" className="transition-all duration-300">
          <LuDumbbell className="text-xl mb-1" />
          <IonLabel className="text-[9px] font-bold tracking-widest uppercase">Entrenar</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="nutrition" href="/app/nutrition" className="transition-all duration-300">
          <LuUtensilsCrossed className="text-xl mb-1" />
          <IonLabel className="text-[9px] font-bold tracking-widest uppercase">Nutrición</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="profile" href="/app/profile" className="transition-all duration-300">
          <LuUser className="text-xl mb-1" />
          <IonLabel className="text-[9px] font-bold tracking-widest uppercase">Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
      
    </IonTabs>
  );
};

export default MainTabs;
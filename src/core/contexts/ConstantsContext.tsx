import React, { createContext, useContext } from 'react';

// Configuration globale de l'application
const constants = {
  app: {
    name: 'SOPK Agent',
    version: '1.1.0',
    description: 'Application compagnon pour le syndrome des ovaires polykystiques'
  },
  api: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
    debugMode: import.meta.env.DEV
  },
  routes: {
    home: '/',
    dashboard: '/dashboard',
    journal: '/journal',
    nutrition: '/nutrition',
    stress: '/stress',
    activity: '/activity',
    login: '/login',
    profile: '/profile'
  }
};

const ConstantsContext = createContext(constants);

export const ConstantsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConstantsContext.Provider value={constants}>
      {children}
    </ConstantsContext.Provider>
  );
};

export const useConstants = () => {
  const context = useContext(ConstantsContext);
  if (!context) {
    throw new Error('useConstants must be used within a ConstantsProvider');
  }
  return context;
};

export default constants;
import { useState } from 'react';
import type { FC } from 'react';
import { ConstantsProvider } from './core/contexts/ConstantsContext';
import AppNavigation from './core/layouts/AppNavigation';
import ProtectedRoute from './core/layouts/ProtectedRoute';

// Import des vues des modules
import DashboardView from './modules/dashboard/views/DashboardView';
import CycleView from './modules/cycle/views/CycleView';
import NutritionView from './modules/nutrition/views/NutritionView';
import NutritionHistoryView from './modules/nutrition/views/NutritionHistoryView';
import StressView from './modules/stress/views/StressView';
import ActivityView from './modules/activity/views/ActivityView';
import ProfileEditView from './core/pages/ProfileEditView';

const App: FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');

  // Simple routing pour le MVP - sera remplacé par React Router plus tard
  const renderCurrentView = () => {
    // Gestion des routes avec paramètres pour l'activité
    if (currentRoute.startsWith('/activity/session/')) {
      const sessionId = currentRoute.split('/activity/session/')[1];
      return <ActivityView initialSessionId={sessionId} onNavigate={setCurrentRoute} />;
    }

    switch (currentRoute) {
      case '/dashboard':
        return <DashboardView onNavigate={setCurrentRoute} />;
      case '/journal':
        return <CycleView />;
      case '/nutrition':
        return <NutritionView />;
      case '/nutrition/history':
        return <NutritionHistoryView />;
      case '/stress':
        return <StressView />;
      case '/activity':
        return <ActivityView onNavigate={setCurrentRoute} />;
      case '/profile':
        return <ProfileEditView onNavigate={setCurrentRoute} />;
      default:
        return <DashboardView onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <ConstantsProvider>
      <ProtectedRoute>
        <AppNavigation
          currentRoute={currentRoute}
          onRouteChange={setCurrentRoute}
        >
          {/* Contenu de la vue active */}
          {renderCurrentView()}
        </AppNavigation>
      </ProtectedRoute>
    </ConstantsProvider>
  );
};

export default App;
import { useState } from 'react';
import { ConstantsProvider } from './core/contexts/ConstantsContext';
import AppNavigation from './core/layouts/AppNavigation';
import ProtectedRoute from './core/layouts/ProtectedRoute';

// Import des vues des modules
import DashboardView from './modules/dashboard/views/DashboardView';
import CycleView from './modules/cycle/views/CycleView';
import NutritionView from './modules/nutrition/views/NutritionView';
import MealSuggestionsView from './modules/nutrition/views/MealSuggestionsView';
import NutritionHistoryView from './modules/nutrition/views/NutritionHistoryView';
import StressView from './modules/stress/views/StressView';
import ActivityView from './modules/activity/views/ActivityView';

function App() {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');

  // Simple routing pour le MVP - sera remplacé par React Router plus tard
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardView onNavigate={setCurrentRoute} />;
      case '/journal':
        return <CycleView />;
      case '/nutrition':
        return <NutritionView />;
      case '/nutrition/suggestions':
        return <MealSuggestionsView />;
      case '/nutrition/history':
        return <NutritionHistoryView />;
      case '/stress':
        return <StressView />;
      case '/activity':
        return <ActivityView />;
      default:
        return <DashboardView />;
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
}

export default App;
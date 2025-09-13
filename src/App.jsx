import { useState } from 'react';
import { ConstantsProvider } from './core/contexts/ConstantsContext';
import AppNavigation from './core/layouts/AppNavigation';
import ProtectedRoute from './core/layouts/ProtectedRoute';

// Import des vues des modules
import DashboardView from './modules/dashboard/views/DashboardView';
import CycleView from './modules/cycle/views/CycleView';
import NutritionView from './modules/nutrition/views/NutritionView';
import StressView from './modules/stress/views/StressView';
import ActivityView from './modules/activity/views/ActivityView';

function App() {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');

  // Simple routing pour le MVP - sera remplacé par React Router plus tard
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardView />;
      case '/journal':
        return <CycleView />;
      case '/nutrition':
        return <NutritionView />;
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
        <AppNavigation>
          <div className="min-h-screen">
            {/* Navigation temporaire pour tester */}
            <div className="bg-white border-b p-4 flex gap-4 overflow-x-auto">
              {[
                { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
                { path: '/journal', label: 'Journal', icon: '📝' },
                { path: '/nutrition', label: 'Nutrition', icon: '🍽️' },
                { path: '/stress', label: 'Bien-être', icon: '🧘' },
                { path: '/activity', label: 'Activité', icon: '🏃' }
              ].map((route) => (
                <button
                  key={route.path}
                  onClick={() => setCurrentRoute(route.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    currentRoute === route.path
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span>{route.icon}</span>
                  <span className="font-medium">{route.label}</span>
                </button>
              ))}
            </div>

            {/* Contenu de la vue active */}
            <main>
              {renderCurrentView()}
            </main>
          </div>
        </AppNavigation>
      </ProtectedRoute>
    </ConstantsProvider>
  );
}

export default App;
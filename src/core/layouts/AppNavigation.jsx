import { useState } from 'react';
import { useConstants } from '../contexts/ConstantsContext';

const AppNavigation = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState('/dashboard');
  const { routes } = useConstants();

  const navigationItems = [
    { path: routes.dashboard, label: 'Dashboard', icon: '🏠' },
    { path: routes.journal, label: 'Journal', icon: '📝' },
    { path: routes.nutrition, label: 'Nutrition', icon: '🍽️' },
    { path: routes.stress, label: 'Bien-être', icon: '🧘' },
    { path: routes.activity, label: 'Activité', icon: '🏃' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">SOPK Agent</h1>
          <p className="text-sm text-gray-600">Ton compagnon bien-être</p>
        </div>

        <div className="mt-6">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveRoute(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                activeRoute === item.path
                  ? 'bg-blue-100 border-r-2 border-blue-500 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AppNavigation;
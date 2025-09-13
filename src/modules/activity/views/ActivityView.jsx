/**
 * 🏃‍♀️ ActivityView - Vue principale des séances guidées d'activité physique
 *
 * Point d'entrée du module activité avec navigation entre catalogue et session active.
 */

import { useState } from 'react';
import SessionCatalog from '../components/catalog/SessionCatalog';
import SessionPlayer from '../components/session/SessionPlayer';
import ActivityHistory from '../components/history/ActivityHistory';
import { useAuth } from '../../../core/auth/AuthContext';

const ActivityView = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog', 'session', 'history'
  const [selectedSession, setSelectedSession] = useState(null);

  // Navigation vers une session
  const handleStartSession = (session) => {
    setSelectedSession(session);
    setCurrentView('session');
  };

  // Retour au catalogue
  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedSession(null);
  };

  // Navigation vers l'historique
  const handleViewHistory = () => {
    setCurrentView('history');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center bg-white rounded-xl p-8" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#1F2937' }}>
            Connexion requise
          </h2>
          <p style={{ color: '#6B7280' }}>
            Veuillez vous connecter pour accéder aux séances d'activité physique
          </p>
        </div>
      </div>
    );
  }

  // Vue de session active
  if (currentView === 'session' && selectedSession) {
    return (
      <SessionPlayer
        session={selectedSession}
        onBack={handleBackToCatalog}
        onComplete={handleBackToCatalog}
      />
    );
  }

  // Vue historique
  if (currentView === 'history') {
    return (
      <ActivityHistory
        onBack={handleBackToCatalog}
      />
    );
  }

  // Vue catalogue (par défaut)
  return (
    <SessionCatalog
      onSessionSelect={handleStartSession}
      onViewHistory={handleViewHistory}
    />
  );
};

export default ActivityView;
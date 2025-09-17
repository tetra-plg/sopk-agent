/**
 * 🏃‍♀️ ActivityView - Vue principale des séances guidées d'activité physique
 *
 * Point d'entrée du module activité avec navigation entre catalogue et session active.
 */

import { useState, useEffect } from 'react';
import SessionCatalog from '../components/catalog/SessionCatalog';
import SessionPlayer from '../components/session/SessionPlayer';
import PreSessionForm from '../components/forms/PreSessionForm';
import ActivityHistory from '../components/history/ActivityHistory';
import { useAuth } from '../../../core/auth/AuthContext';
import activityService from '../services/activityService';

interface ActivityViewProps {
  initialSessionId?: string;
  onNavigate?: (route: string) => void;
}

const ActivityView = ({ initialSessionId, onNavigate }: ActivityViewProps) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog', 'session', 'history', 'pre-session'
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);

  // Charger une session spécifique au démarrage
  useEffect(() => {
    const loadInitialSession = async () => {
      if (!initialSessionId || !user?.id) return;

      setLoadingSession(true);
      try {
        const session = await activityService.getSessionById(initialSessionId);
        setSelectedSession(session);
        setCurrentView('pre-session');
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        // Retour au catalogue en cas d'erreur
        setCurrentView('catalog');
      } finally {
        setLoadingSession(false);
      }
    };

    loadInitialSession();
  }, [initialSessionId, user?.id]);

  // Navigation vers une session depuis le catalogue
  const handleStartSession = (session) => {
    setSelectedSession(session);
    setCurrentView('pre-session');
  };

  // Navigation vers la session depuis le PreSessionForm
  const handleStartSessionFromForm = () => {
    setCurrentView('session');
  };

  // Retour au catalogue
  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    setSelectedSession(null);
    // Retourner au module activité principal si onNavigate est fourni
    if (onNavigate) {
      onNavigate('/activity');
    }
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

  // Écran de chargement de session
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full mx-auto mb-4"></div>
          <p style={{ color: '#6B7280' }}>Chargement de la session...</p>
        </div>
      </div>
    );
  }

  // Vue formulaire pré-session
  if (currentView === 'pre-session' && selectedSession) {
    return (
      <PreSessionForm
        session={selectedSession}
        onStart={handleStartSessionFromForm}
        onBack={handleBackToCatalog}
        isLoading={false}
        error={null}
      />
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
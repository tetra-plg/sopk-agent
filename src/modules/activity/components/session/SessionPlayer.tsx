/**
 * ▶️ SessionPlayer - Lecteur de session d'activité physique
 *
 * Interface principal pour suivre une séance avec audio guidé et suivi du temps.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../core/auth/AuthContext';
import activityService from '../../services/activityService';
import { useSessionTimer } from '../../hooks/useSessionTimer';
import PreSessionForm from '../forms/PreSessionForm';
import PostSessionForm from '../forms/PostSessionForm';
import SessionControls from './SessionControls';
import SessionProgress from './SessionProgress';
// import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

const SessionPlayer = ({ session, onBack, onComplete }) => {
  const { user } = useAuth();
  const [currentPhase, setCurrentPhase] = useState('pre-session'); // 'pre-session', 'active', 'post-session', 'completed'
  const [trackingId, setTrackingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preSessionData, setPreSessionData] = useState(null);
  const [sessionInstructions, setSessionInstructions] = useState([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);

  // Hook de timer
  const timer = useSessionTimer({
    totalDuration: session.duration_minutes * 60, // Convertir en secondes
    onComplete: handleSessionComplete,
    onTick: handleTimerTick
  });

  // Préparer les instructions de la session
  useEffect(() => {
    if (session.instructions) {
      try {
        const instructions = Array.isArray(session.instructions)
          ? session.instructions
          : JSON.parse(session.instructions);
        setSessionInstructions(instructions);
      } catch {
        // Erreur de parsing des instructions
        setSessionInstructions([]);
      }
    }
  }, [session]);

  // Gestionnaire de tick du timer
  function handleTimerTick(elapsed) {
    // Calculer l'instruction actuelle basée sur le temps écoulé
    if (sessionInstructions.length > 0) {
      const totalDuration = session.duration_minutes * 60;
      const progress = elapsed / totalDuration;
      const newIndex = Math.floor(progress * sessionInstructions.length);

      if (newIndex !== currentInstructionIndex && newIndex < sessionInstructions.length) {
        setCurrentInstructionIndex(newIndex);
      }
    }
  }

  // Gestionnaire de fin de session
  function handleSessionComplete() {
    if (trackingId) {
      setCurrentPhase('post-session');
    }
  }

  // Démarrer la session après le formulaire pré-session
  const handleStartSession = async (formData) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const tracking = await activityService.startSession(user.id, session.id, formData);
      setTrackingId(tracking.id);
      setPreSessionData(formData);
      setCurrentPhase('active');
      timer.start();
    } catch {
      setError('Impossible de démarrer la session. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Terminer la session avec feedback post-session
  const handleCompleteSession = async (postFormData) => {
    if (!trackingId) return;

    setIsLoading(true);
    setError(null);

    try {
      await activityService.completeSession(trackingId, {
        durationSeconds: timer.elapsed,
        completionPercentage: timer.isCompleted ? 100 : Math.round((timer.elapsed / timer.totalDuration) * 100),
        ...postFormData
      });

      setCurrentPhase('completed');

      // Retourner au catalogue après un délai
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 3000);
    } catch {
      setError('Impossible de sauvegarder votre session. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Abandonner la session
  const handleAbandonSession = async (reason = '') => {
    if (trackingId) {
      try {
        await activityService.abandonSession(trackingId, reason);
      } catch {
        // Erreur lors de l'abandon de session
      }
    }

    timer.stop();
    if (onBack) {
      onBack();
    }
  };

  // Pause/reprise de la session
  const handleToggleSession = () => {
    if (timer.isRunning) {
      timer.pause();
    } else {
      timer.resume();
    }
  };

  // Phase pré-session
  if (currentPhase === 'pre-session') {
    return (
      <PreSessionForm
        session={session}
        onStart={handleStartSession}
        onBack={onBack}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Phase post-session
  if (currentPhase === 'post-session') {
    return (
      <PostSessionForm
        session={session}
        preSessionData={preSessionData}
        sessionDuration={timer.elapsed}
        onComplete={handleCompleteSession}
        onSkip={() => handleCompleteSession({})}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Phase de félicitations
  if (currentPhase === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center bg-white rounded-xl p-8 max-w-md mx-auto" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#1F2937' }}>
            Bravo ! Séance terminée
          </h2>
          <p className="mb-6" style={{ color: '#6B7280' }}>
            Tu as complété "{session.title}" avec succès. Continue comme ça !
          </p>
          <div className="space-y-3">
            <div className="text-sm" style={{ color: '#A78BFA' }}>
              ⏱️ Durée: {Math.round(timer.elapsed / 60)} minutes
            </div>
            <div className="text-sm" style={{ color: '#6EE7B7' }}>
              🎯 Session sauvegardée dans ton historique
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase active - session en cours
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header fixe */}
      <div className="bg-white shadow-sm sticky top-0 z-10" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg" style={{ color: '#1F2937' }}>
                {session.title}
              </h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {session.category} • {session.duration_minutes} min
              </p>
            </div>

            <button
              onClick={handleAbandonSession}
              className="px-3 py-1 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'rgba(251, 113, 133, 0.1)',
                color: '#FB7185'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FB7185';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(251, 113, 133, 0.1)';
                e.target.style.color = '#FB7185';
              }}
            >
              ✕ Arrêter
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Indicateur de progression */}
        <SessionProgress
          elapsed={timer.elapsed}
          total={timer.totalDuration}
          currentPhase={timer.isCompleted ? 'Terminé' : timer.isRunning ? 'En cours' : 'En pause'}
        />

        {/* Instruction actuelle */}
        {sessionInstructions.length > 0 && currentInstructionIndex < sessionInstructions.length && (
          <div className="mb-6 bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: '#A78BFA' }}
              >
                {currentInstructionIndex + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#1F2937' }}>
                  {sessionInstructions[currentInstructionIndex].title || 'Instruction'}
                </h3>
                <p style={{ color: '#6B7280' }}>
                  {sessionInstructions[currentInstructionIndex].description}
                </p>
              </div>
            </div>

            {/* Temps estimé pour cette instruction */}
            {sessionInstructions[currentInstructionIndex].duration && (
              <div className="text-sm" style={{ color: '#A78BFA' }}>
                ⏱️ Durée estimée: {sessionInstructions[currentInstructionIndex].duration}
              </div>
            )}
          </div>
        )}

        {/* Lecteur audio si disponible */}
        {session.audio_url && (
          <div className="mb-6 bg-white rounded-xl p-4" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎧</span>
              <div>
                <h3 className="font-medium" style={{ color: '#1F2937' }}>
                  Audio guidé
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Suit les instructions audio pour une expérience optimale
                </p>
              </div>
            </div>
            <audio
              controls
              className="w-full"
              src={session.audio_url}
              preload="metadata"
            >
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </div>
        )}

        {/* Contrôles de session */}
        <SessionControls
          isRunning={timer.isRunning}
          isPaused={timer.isPaused}
          isCompleted={timer.isCompleted}
          onToggle={handleToggleSession}
          onComplete={() => setCurrentPhase('post-session')}
          onAbandon={handleAbandonSession}
        />

        {/* Message d'encouragement */}
        {!timer.isCompleted && (
          <div className="mt-6 text-center py-4">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {timer.isRunning
                ? "💪 Tu y es presque ! Continue à ton rythme"
                : "⏸️ Prends une pause si tu en as besoin"
              }
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div
            className="mt-4 p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: 'rgba(251, 113, 133, 0.1)',
              borderColor: '#FB7185',
              color: '#DC2626'
            }}
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Footer spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default SessionPlayer;
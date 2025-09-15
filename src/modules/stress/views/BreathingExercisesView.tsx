/**
 * 🫁 Vue Principale - Exercices de Respiration
 *
 * Point d'entrée principal pour le module de respiration guidée
 * avec navigation entre sélection et session active.
 */

import { useState } from 'react';
import TechniqueSelector from '../components/TechniqueSelector';
import BreathingSession from '../components/BreathingSession';
import { breathingService } from '../services/breathingService';

const BreathingExercisesView = ({ onBack, initialTechnique = null }) => {
  // TODO: Intégrer l'authentification plus tard
  const user = null;
  const [currentView, setCurrentView] = useState(initialTechnique ? 'session' : 'selector'); // 'selector', 'session', 'success'
  const [selectedTechnique, setSelectedTechnique] = useState(initialTechnique);
  const [sessionResult, setSessionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Gérer la sélection d'une technique
  const handleTechniqueSelect = (techniqueId) => {
    setSelectedTechnique(techniqueId);
    setCurrentView('session');
    setError(null);
  };

  // Gérer la complétion d'une session
  const handleSessionComplete = async (sessionData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Sauvegarder la session si utilisateur connecté
      if (user?.id) {
        const { data, error } = await breathingService.saveSession(user.id, sessionData);

        if (error) {

          // Ne pas bloquer l'UX pour une erreur de sauvegarde
        }
      }

      setSessionResult(sessionData);
      setCurrentView('success');
    } catch (error) {

      setError('Erreur lors de la sauvegarde. Vos données locales sont conservées.');
      // Permettre quand même de voir les résultats
      setSessionResult(sessionData);
      setCurrentView('success');
    } finally {
      setIsLoading(false);
    }
  };

  // Retourner à la sélection ou à la vue parent
  const handleBackToSelector = () => {
    if (onBack && currentView === 'selector') {
      onBack(); // Retour à StressView
    } else {
      setCurrentView('selector');
      setSelectedTechnique(null);
      setSessionResult(null);
      setError(null);
    }
  };

  // Démarrer une nouvelle session avec la même technique
  const handleNewSessionSameTechnique = () => {
    setCurrentView('session');
    setSessionResult(null);
    setError(null);
  };

  // Vue de succès après session
  const SuccessView = () => (
    <div className="max-w-md mx-auto p-6 text-center">
      {/* Message de succès */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-4" style={{ backgroundColor: 'rgba(110, 231, 183, 0.2)' }}>
          🎉
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
          Session terminée !
        </h2>
        <p className="mb-4" style={{ color: '#6B7280' }}>
          Bravo pour avoir pris ce moment pour toi
        </p>

        {/* Résumé de la session */}
        {sessionResult && (
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium" style={{ color: '#1F2937' }}>Durée</div>
                <div style={{ color: '#6B7280' }}>
                  {Math.round(sessionResult.duration_seconds / 60)} min
                </div>
              </div>
              <div>
                <div className="font-medium" style={{ color: '#1F2937' }}>Technique</div>
                <div className="capitalize" style={{ color: '#6B7280' }}>
                  {sessionResult.technique}
                </div>
              </div>
              {sessionResult.stress_before && sessionResult.stress_after && (
                <>
                  <div>
                    <div className="font-medium" style={{ color: '#1F2937' }}>Stress avant</div>
                    <div style={{ color: '#6B7280' }}>{sessionResult.stress_before}/10</div>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: '#1F2937' }}>Stress après</div>
                    <div className="font-medium" style={{ color: '#6EE7B7' }}>
                      {sessionResult.stress_after}/10
                      {sessionResult.stress_before - sessionResult.stress_after > 0 && (
                        <span className="text-xs ml-1">
                          (−{sessionResult.stress_before - sessionResult.stress_after})
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Afficher l'erreur si présente */}
        {error && (
          <div className="rounded-xl p-3 mb-4 text-sm" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid #FBB036', color: '#F59E0B' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Message d'encouragement */}
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
          <p className="text-sm" style={{ color: '#1F2937' }}>
            💚 <span className="font-medium">Prendre soin de sa santé mentale</span> est
            essentiel pour gérer les symptômes du SOPK. Continue comme ça !
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleNewSessionSameTechnique}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition-colors"
          style={{ backgroundColor: '#93C5FD', color: 'white' }}
          onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#60A5FA')}
          onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#93C5FD')}
        >
          🔄 Refaire une session
        </button>
        <button
          onClick={handleBackToSelector}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition-colors"
          style={{ backgroundColor: '#A78BFA', color: 'white' }}
          onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#9333EA')}
          onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#A78BFA')}
        >
          🧘‍♀️ Choisir autre technique
        </button>
      </div>
    </div>
  );

  // Affichage selon la vue actuelle
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header global avec navigation */}
        <div className="text-center mb-8">
          {onBack && (
            <div className="flex items-center mb-4">
              <button
                onClick={handleBackToSelector}
                className="flex items-center gap-2 transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.target.style.color = '#1F2937'}
                onMouseLeave={(e) => e.target.style.color = '#6B7280'}
              >
                <span>←</span>
                <span>Retour</span>
              </button>
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
            🫁 Respiration Guidée
          </h1>
          <p style={{ color: '#6B7280' }}>
            Exercices adaptés pour gérer le stress lié au SOPK
          </p>
        </div>

        {/* Indicateur de loading global */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: '#A78BFA' }} />
              <span style={{ color: '#1F2937' }}>Sauvegarde en cours...</span>
            </div>
          </div>
        )}

        {/* Navigation selon l'état */}
        {currentView === 'selector' && (
          <TechniqueSelector
            onSelect={handleTechniqueSelect}
            className="max-w-2xl mx-auto"
          />
        )}

        {currentView === 'session' && selectedTechnique && (
          <BreathingSession
            techniqueId={selectedTechnique}
            userId={user?.id}
            onComplete={handleSessionComplete}
            onExit={handleBackToSelector}
            className="max-w-lg mx-auto"
          />
        )}

        {currentView === 'success' && <SuccessView />}

        {/* Footer avec conseils */}
        {currentView === 'selector' && (
          <div className="max-w-2xl mx-auto mt-8 p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              💡 <span className="font-medium">Conseil :</span> Pratique ces exercices
              régulièrement, idéalement 2-3 fois par jour pour un maximum de bénéfices
              sur tes symptômes SOPK.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercisesView;
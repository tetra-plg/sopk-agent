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

const BreathingExercisesView = ({ onBack }) => {
  // TODO: Intégrer l'authentification plus tard
  const user = null;
  const [currentView, setCurrentView] = useState('selector'); // 'selector', 'session', 'success'
  const [selectedTechnique, setSelectedTechnique] = useState(null);
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
          console.warn('Erreur sauvegarde session:', error);
          // Ne pas bloquer l'UX pour une erreur de sauvegarde
        } else {
          console.log('Session sauvegardée avec succès:', data);
        }
      }

      setSessionResult(sessionData);
      setCurrentView('success');
    } catch (error) {
      console.error('Erreur lors de la complétion:', error);
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
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">
          🎉
        </div>
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
          Session terminée !
        </h2>
        <p className="text-gray-600 mb-4">
          Bravo pour avoir pris ce moment pour toi
        </p>

        {/* Résumé de la session */}
        {sessionResult && (
          <div className="bg-gradient-to-r from-primary-lavande/10 to-accent-vert-sauge/10 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Durée</div>
                <div className="text-gray-600">
                  {Math.round(sessionResult.duration_seconds / 60)} min
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Technique</div>
                <div className="text-gray-600 capitalize">
                  {sessionResult.technique}
                </div>
              </div>
              {sessionResult.stress_before && sessionResult.stress_after && (
                <>
                  <div>
                    <div className="font-medium text-gray-700">Stress avant</div>
                    <div className="text-gray-600">{sessionResult.stress_before}/10</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Stress après</div>
                    <div className="text-green-600 font-medium">
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
            ⚠️ {error}
          </div>
        )}

        {/* Message d'encouragement */}
        <div className="bg-accent-vert-sauge/10 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
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
          className="w-full px-6 py-3 btn-secondary disabled:opacity-50"
        >
          🔄 Refaire une session
        </button>
        <button
          onClick={handleBackToSelector}
          disabled={isLoading}
          className="w-full px-6 py-3 btn-primary disabled:opacity-50"
        >
          🧘‍♀️ Choisir autre technique
        </button>
      </div>
    </div>
  );

  // Affichage selon la vue actuelle
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lavande/5 to-accent-vert-sauge/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header global avec navigation */}
        <div className="text-center mb-8">
          {onBack && (
            <div className="flex items-center mb-4">
              <button
                onClick={handleBackToSelector}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>←</span>
                <span>Retour</span>
              </button>
            </div>
          )}
          <h1 className="text-3xl font-heading font-bold text-gray-800 mb-2">
            🫁 Respiration Guidée
          </h1>
          <p className="text-gray-600">
            Exercices adaptés pour gérer le stress lié au SOPK
          </p>
        </div>

        {/* Indicateur de loading global */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-primary-lavande border-t-transparent rounded-full" />
              <span>Sauvegarde en cours...</span>
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
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-white/50 rounded-lg text-center">
            <p className="text-xs text-gray-500">
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
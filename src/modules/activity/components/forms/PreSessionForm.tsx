/**
 * 📝 PreSessionForm - Formulaire de préparation à la session
 *
 * Collecte l'état initial de l'utilisatrice avant de commencer la séance.
 */

import { useState } from 'react';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

const PreSessionForm = ({ session, onStart, onBack, isLoading, error }) => {
  const [formData, setFormData] = useState({
    energyLevel: 5,
    painLevel: 3,
    moodScore: 6
  });

  // Gestionnaire de changement des valeurs
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  // Gestionnaire de soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onStart) {
      onStart(formData);
    }
  };

  // Helper pour obtenir l'emoji du niveau d'énergie
  const getEnergyEmoji = (level) => {
    if (level <= 2) return '😴';
    if (level <= 4) return '😐';
    if (level <= 6) return '😊';
    if (level <= 8) return '🌟';
    return '⚡';
  };

  // Helper pour obtenir l'emoji du niveau de douleur
  const getPainEmoji = (level) => {
    if (level <= 2) return '😌';
    if (level <= 4) return '😐';
    if (level <= 6) return '😔';
    if (level <= 8) return '😫';
    return '😰';
  };

  // Helper pour obtenir l'emoji de l'humeur
  const getMoodEmoji = (score) => {
    if (score <= 2) return '😢';
    if (score <= 4) return '😞';
    if (score <= 6) return '😐';
    if (score <= 8) return '😊';
    return '😄';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 transition-colors"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e) => e.target.style.color = '#1F2937'}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              <span>←</span>
              <span>Retour</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
              🏃‍♀️ Prête à commencer ?
            </h1>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Dis-nous comment tu te sens pour personnaliser ta séance
            </p>

            {/* Info sur la session */}
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
                {session.title}
              </h2>
              <div className="flex items-center justify-center gap-4 text-sm" style={{ color: '#6B7280' }}>
                <span>⏱️ {session.duration_minutes} min</span>
                <span>•</span>
                <span>🎯 {session.category}</span>
                <span>•</span>
                <span>
                  {session.difficulty === 'beginner' ? '🟢 Débutant' :
                   session.difficulty === 'easy' ? '🟡 Facile' :
                   session.difficulty === 'medium' ? '🟠 Intermédiaire' : '🔴 Avancé'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Niveau d'énergie */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getEnergyEmoji(formData.energyLevel)}</span>
              <div>
                <h3 className="font-semibold" style={{ color: '#1F2937' }}>
                  Comment est ton niveau d'énergie ?
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  1 = Épuisée • 10 = Pleine d'énergie
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm" style={{ color: '#6B7280' }}>
                <span>Épuisée</span>
                <span className="font-medium text-lg" style={{ color: '#A78BFA' }}>
                  {formData.energyLevel}/10
                </span>
                <span>Énergique</span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={formData.energyLevel}
                onChange={(e) => handleChange('energyLevel', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #A78BFA 0%, #A78BFA ${(formData.energyLevel - 1) * 11.11}%, #E5E7EB ${(formData.energyLevel - 1) * 11.11}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          {/* Niveau de douleur */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getPainEmoji(formData.painLevel)}</span>
              <div>
                <h3 className="font-semibold" style={{ color: '#1F2937' }}>
                  As-tu des douleurs aujourd'hui ?
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  1 = Aucune douleur • 10 = Douleur intense
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm" style={{ color: '#6B7280' }}>
                <span>Aucune</span>
                <span className="font-medium text-lg" style={{ color: '#FB7185' }}>
                  {formData.painLevel}/10
                </span>
                <span>Intense</span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={formData.painLevel}
                onChange={(e) => handleChange('painLevel', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #FB7185 0%, #FB7185 ${(formData.painLevel - 1) * 11.11}%, #E5E7EB ${(formData.painLevel - 1) * 11.11}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          {/* Humeur */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getMoodEmoji(formData.moodScore)}</span>
              <div>
                <h3 className="font-semibold" style={{ color: '#1F2937' }}>
                  Comment te sens-tu moralement ?
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  1 = Très mal • 10 = Excellente humeur
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm" style={{ color: '#6B7280' }}>
                <span>Très mal</span>
                <span className="font-medium text-lg" style={{ color: '#6EE7B7' }}>
                  {formData.moodScore}/10
                </span>
                <span>Excellent</span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={formData.moodScore}
                onChange={(e) => handleChange('moodScore', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #6EE7B7 0%, #6EE7B7 ${(formData.moodScore - 1) * 11.11}%, #E5E7EB ${(formData.moodScore - 1) * 11.11}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          {/* Messages d'adaptation */}
          {(formData.energyLevel <= 3 || formData.painLevel >= 7) && (
            <div className="bg-yellow-50 rounded-xl p-4" style={{ border: '1px solid #FCD34D' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-medium mb-2" style={{ color: '#92400E' }}>
                    Conseil personnalisé
                  </h4>
                  <p className="text-sm" style={{ color: '#92400E' }}>
                    {formData.energyLevel <= 3
                      ? "Tu sembles fatiguée. N'hésite pas à adapter les exercices à ton rythme et faire des pauses."
                      : "Tu as des douleurs importantes. Écoute ton corps et ne force pas. Tu peux arrêter à tout moment."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div
              className="p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: 'rgba(251, 113, 133, 0.1)',
                borderColor: '#FB7185',
                color: '#DC2626'
              }}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-4 rounded-xl font-medium transition-colors"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#6B7280',
                border: '1px solid #D1D5DB'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#A78BFA',
                color: 'white'
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#9333EA')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#A78BFA')}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" color="white" />
                  <span>Démarrage...</span>
                </div>
              ) : (
                '▶️ Commencer la séance'
              )}
            </button>
          </div>
        </form>

        {/* Footer spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default PreSessionForm;
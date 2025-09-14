/**
 * 📝 PostSessionForm - Formulaire de feedback post-session
 *
 * Collecte le ressenti de l'utilisatrice après la séance pour le suivi des progrès.
 */

import { useState } from 'react';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

const PostSessionForm = ({
  session,
  preSessionData,
  sessionDuration,
  onComplete,
  onSkip,
  isLoading,
  error
}) => {
  const [formData, setFormData] = useState({
    energyLevel: preSessionData?.energyLevel || 5,
    painLevel: preSessionData?.painLevel || 3,
    moodScore: preSessionData?.moodScore || 6,
    difficultyFelt: 3,
    notes: ''
  });

  // Gestionnaire de changement des valeurs
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'notes' ? value : parseInt(value)
    }));
  };

  // Gestionnaire de soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onComplete) {
      onComplete(formData);
    }
  };

  // Helper pour calculer l'amélioration
  const getImprovement = (before, after, isReversed = false) => {
    if (!preSessionData) return 0;
    const diff = isReversed ? before - after : after - before;
    return diff;
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

  // Helper pour obtenir l'emoji de difficulté
  const getDifficultyEmoji = (level) => {
    if (level <= 1) return '😌';
    if (level <= 2) return '🙂';
    if (level <= 3) return '😐';
    if (level <= 4) return '😅';
    return '😰';
  };

  // Calculer les améliorations
  const energyImprovement = getImprovement(preSessionData?.energyLevel, formData.energyLevel);
  const painReduction = getImprovement(preSessionData?.painLevel, formData.painLevel, true);
  const moodImprovement = getImprovement(preSessionData?.moodScore, formData.moodScore);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
              🎉 Séance terminée !
            </h1>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Comment te sens-tu maintenant ? Ton feedback nous aide à personnaliser tes prochaines séances.
            </p>

            {/* Résumé de la session */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
                {session.title}
              </h2>
              <div className="flex items-center justify-center gap-4 text-sm" style={{ color: '#6B7280' }}>
                <span>✅ Terminée</span>
                <span>•</span>
                <span>⏱️ {Math.round(sessionDuration / 60)} min</span>
                <span>•</span>
                <span>🎯 {session.category}</span>
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
                  Ton niveau d'énergie maintenant ?
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Avant: {preSessionData?.energyLevel}/10
                  {energyImprovement !== 0 && (
                    <span className={`ml-2 font-medium ${
                      energyImprovement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({energyImprovement > 0 ? '+' : ''}{energyImprovement})
                    </span>
                  )}
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
                  Tes douleurs maintenant ?
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Avant: {preSessionData?.painLevel}/10
                  {painReduction !== 0 && (
                    <span className={`ml-2 font-medium ${
                      painReduction > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({painReduction > 0 ? '-' : '+'}{Math.abs(painReduction)})
                    </span>
                  )}
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
                  Avant: {preSessionData?.moodScore}/10
                  {moodImprovement !== 0 && (
                    <span className={`ml-2 font-medium ${
                      moodImprovement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({moodImprovement > 0 ? '+' : ''}{moodImprovement})
                    </span>
                  )}
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

          {/* Difficulté ressentie */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getDifficultyEmoji(formData.difficultyFelt)}</span>
              <div>
                <h3 className="font-semibold" style={{ color: '#1F2937' }}>
                  Comment as-tu trouvé cette séance ?
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  1 = Très facile • 5 = Très difficile
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm" style={{ color: '#6B7280' }}>
                <span>Très facile</span>
                <span className="font-medium text-lg" style={{ color: '#93C5FD' }}>
                  {formData.difficultyFelt}/5
                </span>
                <span>Très difficile</span>
              </div>

              <input
                type="range"
                min="1"
                max="5"
                value={formData.difficultyFelt}
                onChange={(e) => handleChange('difficultyFelt', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #93C5FD 0%, #93C5FD ${(formData.difficultyFelt - 1) * 25}%, #E5E7EB ${(formData.difficultyFelt - 1) * 25}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          {/* Notes personnelles */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💭</span>
              <div>
                <h3 className="font-semibold" style={{ color: '#1F2937' }}>
                  Quelque chose à noter ? (optionnel)
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Ressenti, difficultés, points positifs...
                </p>
              </div>
            </div>

            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Écris ici ce que tu as ressenti pendant la séance..."
              className="w-full p-3 border rounded-lg resize-none"
              rows="3"
              style={{
                borderColor: '#D1D5DB',
                backgroundColor: '#FAFAFA',
                color: '#1F2937'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#A78BFA';
                e.target.style.boxShadow = '0 0 0 3px rgba(167, 139, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Résumé des améliorations */}
          {(energyImprovement > 0 || painReduction > 0 || moodImprovement > 0) && (
            <div className="bg-green-50 rounded-xl p-4" style={{ border: '1px solid #10B981' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-medium mb-2" style={{ color: '#047857' }}>
                    Excellent ! Tu as fait des progrès
                  </h4>
                  <div className="space-y-1 text-sm" style={{ color: '#047857' }}>
                    {energyImprovement > 0 && (
                      <p>⚡ Énergie: +{energyImprovement} points</p>
                    )}
                    {painReduction > 0 && (
                      <p>😌 Douleur: -{painReduction} points</p>
                    )}
                    {moodImprovement > 0 && (
                      <p>😊 Humeur: +{moodImprovement} points</p>
                    )}
                  </div>
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
              onClick={onSkip}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#6B7280',
                border: '1px solid #D1D5DB'
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.2)')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.1)')}
            >
              Passer
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#6EE7B7',
                color: 'white'
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#34D399')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#6EE7B7')}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" color="white" />
                  <span>Sauvegarde...</span>
                </div>
              ) : (
                '✅ Sauvegarder & terminer'
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

export default PostSessionForm;
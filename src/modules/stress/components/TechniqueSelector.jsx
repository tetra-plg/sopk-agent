/**
 * 🎯 Sélecteur de Techniques de Respiration
 *
 * Interface de sélection des exercices de respiration avec
 * informations détaillées et design SOPK.
 */

import { useState } from 'react';
import { useBreathingTechniques } from '../hooks/useBreathingTechniques';
import { formatTime } from '../utils/breathingTechniques';

const TechniqueSelector = ({ onSelect, className = '' }) => {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const { techniques, loading, error } = useBreathingTechniques();

  const handleTechniqueSelect = (technique) => {
    setSelectedTechnique(technique.id);
    if (onSelect) {
      onSelect(technique.id);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty] || colors.beginner;
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé'
    };
    return texts[difficulty] || 'Débutant';
  };

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-lavande mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des techniques...</p>
      </div>
    );
  }

  if (error || techniques.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600 mb-4">Aucune technique disponible</p>
        <p className="text-sm text-gray-500">Vérifiez votre connexion</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
          🧘‍♀️ Choisis ton exercice
        </h2>
        <p className="text-gray-600">
          Techniques de respiration adaptées au SOPK
        </p>
      </div>

      <div className="space-y-4">
        {techniques.map((technique) => (
          <div
            key={technique.id}
            className={`technique-card p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
              selectedTechnique === technique.id
                ? 'border-primary-lavande bg-primary-lavande/5 shadow-md'
                : 'border-gray-200 bg-white hover:border-primary-lavande/50'
            }`}
            onClick={() => handleTechniqueSelect(technique)}
            style={{
              borderColor: selectedTechnique === technique.id
                ? technique.color
                : undefined
            }}
          >
            <div className="flex items-start gap-4">
              {/* Icône et couleur */}
              <div
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: `${technique.color}20`,
                  color: technique.color
                }}
              >
                {technique.icon}
              </div>

              {/* Informations principales */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {technique.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(technique.difficulty)}`}
                  >
                    {getDifficultyText(technique.difficulty)}
                  </span>
                </div>

                <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                  {technique.description}
                </p>

                {/* Métadonnées */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{formatTime(technique.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔄</span>
                    <span>
                      {technique.pattern
                        ? technique.pattern.join('-')
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {/* Bienfaits */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 font-medium">
                    💚 Bienfaits généraux :
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {technique.benefits.slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>

                  {/* Bénéfices spécifiques SOPK */}
                  {technique.sopk_benefits && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-primary-lavande/10 to-accent-vert-sauge/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-primary-lavande text-xs">✨</span>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-medium text-primary-lavande">
                            Spécial SOPK:
                          </span>{' '}
                          {technique.sopk_benefits}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Indicateur de sélection */}
              {selectedTechnique === technique.id && (
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: technique.color }}
                >
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message d'encouragement */}
      <div className="mt-6 p-4 bg-gradient-to-r from-accent-vert-sauge/10 to-primary-bleu-ciel/10 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          💡 <span className="font-medium">Conseil :</span> Commence par une technique débutant
          et augmente progressivement la durée selon ton confort.
        </p>
      </div>

      {/* Statistiques utilisateur (si disponibles) */}
      {/* TODO: Ajouter les statistiques d'utilisation */}
    </div>
  );
};

export default TechniqueSelector;
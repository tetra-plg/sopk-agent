/**
 * ✅ Composant TrackingSuccess
 *
 * Notification de succès après avoir tracké un repas
 * avec feedback et actions de suivi.
 */

import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

const TrackingSuccess = ({
  meal,
  isVisible,
  onClose,
  onViewHistory,
  onRateMeal
}) => {
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Après 3 secondes, proposer de noter le repas
      const timer = setTimeout(() => {
        setShowRatingPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !meal) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-4 transform transition-all duration-300">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />

          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">
              Super ! Repas ajouté 🍽️
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              <strong>{meal.title || meal.name}</strong> a été ajouté à ton suivi nutrition.
            </p>

            {!showRatingPrompt ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  ✨ Tes suggestions vont s'améliorer avec le temps
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onViewHistory}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Voir mon historique
                  </button>
                  <button
                    onClick={() => setShowRatingPrompt(true)}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Noter ce repas
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  Comment as-tu trouvé ce repas ?
                </div>
                <div className="flex gap-2">
                  {[
                    { emoji: '😞', label: 'Pas terrible', rating: 2 },
                    { emoji: '😐', label: 'Correct', rating: 3 },
                    { emoji: '😊', label: 'Bien', rating: 4 },
                    { emoji: '😍', label: 'Excellent', rating: 5 }
                  ].map((option) => (
                    <button
                      key={option.rating}
                      onClick={() => {
                        onRateMeal(option.rating);
                        onClose();
                      }}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title={option.label}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-xs text-gray-600 mt-1">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingSuccess;
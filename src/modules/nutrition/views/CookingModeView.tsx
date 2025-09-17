/**
 * 👩‍🍳 Mode Cuisine Guidé - CookingModeView
 *
 * Interface step-by-step pour suivre une recette avec timers intégrés
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import recipeService from '../services/recipeService';
import trackingService from '../services/trackingService';

const CookingModeView = ({ recipeId, onBack, onComplete }) => {
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTimer, setStepTimer] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [totalCookingTime, setTotalCookingTime] = useState(0);
  const [servingAdjustment, setServingAdjustment] = useState(1);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    hasEaten: null,
    enjoymentRating: null,
    willCookAgain: null
  });

  // Timer states
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Charger la recette
  useEffect(() => {
    const loadRecipe = async () => {
      if (!recipeId) return;

      try {
        const { data } = await recipeService.getRecipeById(recipeId);
        setRecipe(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la recette:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId]);

  // Gestion du timer
  useEffect(() => {
    if (timerActive && remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            playTimerSound();
            showTimerNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [timerActive, remainingTime]);

  const playTimerSound = () => {
    // Simple notification sonore
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 300, 500]);
    }

    // Son système si disponible
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PyvmEcBjWJ0vLNeSsFJnTF7NyRQAkSXbPq7KlXFAlEnenxv2AcBzOGz/LMeSsFJnTF7NyQQAkSXbPq7KlXFAlDnenxv2EcBjSGz/LNeSsFJnPF7NuQQAkSXrLo7adbEAlBn+n1sF8cBzOGz/LNeSsFJnPF7NuQQAkSXbPq7KlXFAlFn+PwtmMcBjiS1/LNeSsFJnPG7NuOPwkTYbDs6qZcFApDnenxv2EcBzOGz/LMeSsFJ3TF7NyQQAkSXbTp66hUFAo+mdPzy2UhBStmeN20QAoUXrPo66lZGAI9ntf30mUjBSZmeN2xQgsZZrDqr2Q4Dj+e3vbLfSkFJHPF7d6KNA0LVqzl8bVcGAVEk9X8vy8BSDKSzu7MbCUFJIHO4dxwRgIKeX7o3Lc8HQwbdcLt1YxMAACe1PHEZYH9F+P');
    if (audio) {
      audio.play().catch(() => {}); // Ignore errors
    }
  };

  const showTimerNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Timer terminé !', {
        body: 'Étape de cuisine terminée',
        icon: '/favicon.ico'
      });
    }
  };

  const startStepTimer = (minutes) => {
    if (minutes > 0) {
      setStepTimer(minutes);
      setRemainingTime(minutes * 60);
      setTimerActive(true);
    }
  };

  const stopTimer = () => {
    setTimerActive(false);
    setRemainingTime(0);
    setStepTimer(null);
  };

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      stopTimer();
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      stopTimer();
      setCurrentStep(currentStep - 1);
    }
  };

  const finishCooking = () => {
    const totalTime = Math.round((Date.now() - startTime) / 60000); // en minutes
    setTotalCookingTime(totalTime);
    setShowFeedback(true);
  };

  const submitFeedback = async () => {
    // Enregistrer le tracking de la recette avec feedback
    if (user?.id && recipe) {
      try {
        await trackingService.trackMealConsumption(user.id, recipe.id, null, {
          servings_made: Math.round(recipe.servings * servingAdjustment),
          preparation_time_actual: totalCookingTime,
          has_eaten: feedbackData.hasEaten,
          enjoyment_rating: feedbackData.enjoymentRating,
          will_cook_again: feedbackData.willCookAgain
        });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
      }
    }

    onComplete && onComplete({
      totalTime: totalCookingTime,
      servingsMade: Math.round(recipe?.servings * servingAdjustment),
      feedback: feedbackData
    });
  };

  const adjustIngredientQuantity = (quantity, adjustment) => {
    // Parse quantity and adjust
    const numMatch = quantity.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      const num = parseFloat(numMatch[1]) * adjustment;
      return quantity.replace(numMatch[1], num % 1 === 0 ? num.toString() : num.toFixed(1));
    }
    return quantity;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Préparation de votre recette...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Recette introuvable</h2>
          <p className="text-gray-600 mb-4">Impossible de charger cette recette</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const currentInstruction = recipe.instructions[currentStep];
  const progress = ((currentStep + 1) / recipe.instructions.length) * 100;

  // Écran de feedback après cuisine
  if (showFeedback) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header feedback */}
        <div className="flex-shrink-0 bg-white shadow-sm z-10 p-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🎉 Recette terminée !
            </h1>
            <p className="text-gray-600">
              Comment s'est passée votre expérience culinaire ?
            </p>
          </div>
        </div>

        {/* Contenu feedback scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 space-y-6">
            {/* Résumé de la session */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                📊 Résumé de votre session
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalCookingTime} min
                  </div>
                  <div className="text-sm text-gray-500">Temps de cuisine</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(recipe?.servings * servingAdjustment)}
                  </div>
                  <div className="text-sm text-gray-500">Portions préparées</div>
                </div>
              </div>
            </div>

            {/* Question 1: As-tu mangé ? */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🍽️ Avez-vous mangé ce plat ?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFeedbackData({...feedbackData, hasEaten: true})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    feedbackData.hasEaten === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-medium">Oui, j'ai mangé</div>
                </button>
                <button
                  onClick={() => setFeedbackData({...feedbackData, hasEaten: false})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    feedbackData.hasEaten === false
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="font-medium">Pas encore</div>
                </button>
              </div>
            </div>

            {/* Question 2: Appréciation (si mangé) */}
            {feedbackData.hasEaten === true && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  😋 Comment avez-vous trouvé ce plat ?
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFeedbackData({...feedbackData, enjoymentRating: rating})}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        feedbackData.enjoymentRating === rating
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <div className="text-2xl">
                        {rating === 1 ? '😞' :
                         rating === 2 ? '😐' :
                         rating === 3 ? '🙂' :
                         rating === 4 ? '😊' : '🤤'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {rating === 1 ? 'Bof' :
                         rating === 2 ? 'Moyen' :
                         rating === 3 ? 'Bien' :
                         rating === 4 ? 'Très bon' : 'Excellent'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Refaire la recette */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔄 Referiez-vous cette recette ?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFeedbackData({...feedbackData, willCookAgain: true})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    feedbackData.willCookAgain === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl mb-2">👍</div>
                  <div className="font-medium">Oui, sans hésiter</div>
                </button>
                <button
                  onClick={() => setFeedbackData({...feedbackData, willCookAgain: false})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    feedbackData.willCookAgain === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-2xl mb-2">👎</div>
                  <div className="font-medium">Probablement pas</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation feedback */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 pb-safe safe-area-inset-bottom">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowFeedback(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <span>←</span>
              <span>Retour</span>
            </button>

            <button
              onClick={submitFeedback}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              <span>✅</span>
              <span>Terminer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header fixed au lieu de sticky */}
      <div className="flex-shrink-0 bg-white shadow-sm z-10 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm">Quitter</span>
            </button>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-800 truncate max-w-48">
                {recipe.title}
              </h1>
              <p className="text-sm text-gray-500">
                Étape {currentStep + 1} sur {recipe.instructions.length}
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-gray-500">Terminé</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Contenu principal scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 pb-4">
        {/* Ajustement portions */}
        {currentStep === 0 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🍽️ Ajuster les portions
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setServingAdjustment(Math.max(0.5, servingAdjustment - 0.5))}
                className="w-10 h-10 bg-blue-200 text-blue-800 rounded-full font-bold hover:bg-blue-300 transition-colors"
              >
                -
              </button>

              <div className="text-center">
                <div className="text-xl font-bold text-blue-800">
                  {Math.round(recipe.servings * servingAdjustment)}
                </div>
                <div className="text-sm text-blue-600">portions</div>
              </div>

              <button
                onClick={() => setServingAdjustment(servingAdjustment + 0.5)}
                className="w-10 h-10 bg-blue-200 text-blue-800 rounded-full font-bold hover:bg-blue-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Timer de l'étape */}
        {currentInstruction.duration_minutes > 0 && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                ⏱️ Timer de l'étape
              </h3>
              <div className="text-sm text-gray-500">
                {currentInstruction.duration_minutes} min recommandées
              </div>
            </div>

            {!timerActive ? (
              <button
                onClick={() => startStepTimer(currentInstruction.duration_minutes)}
                className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                ▶️ Démarrer le timer ({currentInstruction.duration_minutes} min)
              </button>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-green-600 mb-2">
                  {formatTime(remainingTime)}
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={stopTimer}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ⏹️ Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instruction actuelle */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {currentStep + 1}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {currentInstruction.instruction}
              </h2>

              {currentInstruction.tips && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-lg">💡</span>
                    <p className="text-sm text-yellow-800 italic">
                      {currentInstruction.tips}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ingrédients pour l'étape (si pertinents) */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🛒 Ingrédients nécessaires
            </h3>
            <div className="grid gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{ingredient.name}</span>
                  <span className="font-semibold text-gray-900">
                    {servingAdjustment !== 1
                      ? adjustIngredientQuantity(ingredient.quantity, servingAdjustment)
                      : ingredient.quantity
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Navigation bottom - maintenant en flex-shrink-0 au lieu de fixed */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 pb-safe safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>←</span>
            <span>Précédent</span>
          </button>

          {currentStep === recipe.instructions.length - 1 ? (
            <button
              onClick={finishCooking}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              <span>🎉</span>
              <span>Terminer</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span>Suivant</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookingModeView;
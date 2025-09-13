/**
 * 🍽️ Vue Suggestions de Repas
 *
 * Interface principale pour consulter et gérer les suggestions
 * nutritionnelles personnalisées selon les symptômes SOPK.
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useMealSuggestions } from '../hooks/useMealSuggestions';
import SuggestionCard from '../components/SuggestionCard';
import MealDetailModal from '../components/MealDetailModal';

const MealSuggestionsView = ({ onBack }) => {
  const { user } = useAuth();

  // Contexte utilisateur stable (mémorisé pour éviter les re-renders)
  const userContext = useMemo(() => ({
    userId: user?.id,
    symptoms: [], // À connecter avec le journal quotidien
    cyclePhase: null, // À connecter avec le suivi de cycle
    timeOfDay: new Date().getHours(),
    maxPrepTime: 30
  }), [user?.id]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    mealType: 'any',
    maxPrepTime: 60,
    difficulty: 'any'
  });

  const {
    allMeals,
    loading,
    error,
    trackMealChosen,
    isReady
  } = useMealSuggestions(userContext);

  // Dans cette vue, on affiche tous les repas avec filtrage manuel
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Appliquer les filtres manuels
  useEffect(() => {
    if (!allMeals || allMeals.length === 0) {
      setFilteredSuggestions([]);
      return;
    }

    let filtered = [...allMeals];

    // Filtrer par type de repas
    if (filters.mealType !== 'auto' && filters.mealType !== 'any') {
      filtered = filtered.filter(meal => meal.category === filters.mealType);
    }

    // Filtrer par temps de préparation
    if (filters.maxPrepTime && filters.maxPrepTime < 60) {
      filtered = filtered.filter(meal => meal.prep_time_minutes <= filters.maxPrepTime);
    }

    // Filtrer par difficulté
    if (filters.difficulty !== 'any') {
      filtered = filtered.filter(meal => meal.difficulty === filters.difficulty);
    }

    // Trier par nom pour être cohérent
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredSuggestions(filtered);
  }, [allMeals, filters]);

  const handleViewMealDetails = (meal) => {
    setSelectedMeal(meal);
    setShowModal(true);
  };

  const handleTrackMeal = async (mealId, mealType) => {
    const result = await trackMealChosen(mealId, mealType, {
      satisfaction_rating: 5, // Valeur par défaut positive
      will_remake: true
    });

    if (result.success) {
      // Feedback visuel de succès
      alert('Super ! Repas ajouté à ton suivi 🍽️');
    } else {
      console.error('Erreur tracking:', result.error);
    }
  };

  const handleRefreshSuggestions = () => {
    // Forcer le rechargement en réappliquant les filtres
    setFilteredSuggestions([...allMeals]);
  };

  const getContextMessage = () => {
    if (userContext.symptoms.length === 0) {
      return "Voici nos meilleures suggestions pour toi aujourd'hui";
    }

    const symptomMessages = {
      fatigue: "Tu sembles fatiguée aujourd'hui",
      cravings: "Tu as des envies de sucré",
      period_pain: "Tu as des douleurs menstruelles",
      mood_low: "Tu te sens un peu down",
      digestive_issues: "Tu as des troubles digestifs"
    };

    const messages = userContext.symptoms
      .map(symptom => symptomMessages[symptom])
      .filter(Boolean);

    return messages.length > 0
      ? messages.join(", ") + ". Voici des repas qui peuvent t'aider :"
      : "Voici nos suggestions adaptées à tes besoins :";
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: '🌅 Petit-déjeuner',
      lunch: '🍽️ Déjeuner',
      dinner: '🌙 Dîner',
      snack: '🥨 Collation',
      any: '🔄 Tous types'
    };
    return labels[type] || type;
  };

  if (!isReady) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <header className="mb-8">
        {onBack && (
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>←</span>
              <span>Retour</span>
            </button>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🍽️ Suggestions Repas
        </h1>
        <p className="text-gray-600">
          Idées personnalisées selon vos symptômes et besoins SOPK
        </p>
      </header>

      {/* Message contextuel */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
          <p className="text-gray-700">
            😊 {getContextMessage()}
          </p>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">
            Type de repas :
          </label>
          {['any', 'breakfast', 'lunch', 'snack', 'dinner'].map(type => (
            <button
              key={type}
              onClick={() => setFilters(prev => ({ ...prev, mealType: type }))}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filters.mealType === type
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {getMealTypeLabel(type)}
            </button>
          ))}
          <button
            onClick={handleRefreshSuggestions}
            className="ml-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Génération de tes suggestions...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">
            Erreur lors du chargement des suggestions. Essaie de rafraîchir.
          </p>
        </div>
      )}

      {!loading && filteredSuggestions.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Aucune suggestion trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            Essaie de modifier tes filtres ou de rafraîchir les suggestions.
          </p>
          <button
            onClick={handleRefreshSuggestions}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Rafraîchir les suggestions
          </button>
        </div>
      )}

      {!loading && filteredSuggestions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              📋 Suggestions pour toi ({filteredSuggestions.length})
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuggestions.map((meal) => (
              <SuggestionCard
                key={meal.id}
                meal={meal}
                onViewDetails={handleViewMealDetails}
                onTrackMeal={handleTrackMeal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal détails */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onTrackMeal={handleTrackMeal}
      />

      {/* Section aide */}
      {!loading && filteredSuggestions.length > 0 && (
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            💡 Comment ça marche ?
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Suggestions personnalisées</h4>
              <p className="text-sm text-gray-600">
                Nos suggestions sont adaptées à tes symptômes actuels et à ta phase de cycle.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Index glycémique bas</h4>
              <p className="text-sm text-gray-600">
                Priorité aux repas à IG bas pour aider à réguler l'insuline et le SOPK.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealSuggestionsView;
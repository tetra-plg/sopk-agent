import { useState } from 'react';
import { useMealSuggestions } from '../hooks/useMealSuggestions';
import SuggestionCard from '../components/SuggestionCard';
import MealDetailModal from '../components/MealDetailModal';
import TrackingSuccess from '../components/TrackingSuccess';

const MOCK_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const NutritionView = () => {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackedMeal, setTrackedMeal] = useState(null);
  const [showTrackingSuccess, setShowTrackingSuccess] = useState(false);

  // Contexte utilisateur simulé
  const userContext = {
    userId: MOCK_USER_ID,
    symptoms: ['fatigue'],
    cyclePhase: 'luteal',
    timeOfDay: new Date().getHours(),
    maxPrepTime: 30
  };

  const {
    suggestions,
    loading,
    trackMealChosen,
    isReady
  } = useMealSuggestions(userContext);

  const primarySuggestion = suggestions[0];

  const handleViewMealDetails = (meal) => {
    setSelectedMeal(meal);
    setShowModal(true);
  };

  const handleTrackMeal = async (mealId, mealType) => {
    const result = await trackMealChosen(mealId, mealType, {
      satisfaction_rating: 5,
      will_remake: true
    });

    if (result.success) {
      // Trouver le repas tracké pour l'affichage
      const meal = suggestions.find(s => s.id === mealId) ||
                   primarySuggestion?.id === mealId ? primarySuggestion : null;

      if (meal) {
        setTrackedMeal(meal);
        setShowTrackingSuccess(true);
      }
    }
  };

  const handleViewHistory = () => {
    window.location.href = '/nutrition/history';
  };

  const handleRateMeal = async (rating) => {
    if (trackedMeal) {
      // Ici on pourrait mettre à jour la note du repas
      console.log('Rating meal:', trackedMeal.name, rating);
    }
  };

  const handleNavigateToSuggestions = () => {
    // Navigation vers la page des suggestions complètes
    window.location.href = '/nutrition/suggestions';
  };

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🍽️ Nutrition SOPK
        </h1>
        <p className="text-gray-600">
          Suggestions repas et recettes à index glycémique bas
        </p>
      </header>

      <div className="space-y-8">
        {/* Suggestion intelligente du moment */}
        {isReady && primarySuggestion && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              💫 Suggestion pour toi
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
              <p className="text-sm text-gray-600 mb-4">
                😴 Tu sembles fatiguée aujourd'hui
              </p>
              <SuggestionCard
                meal={primarySuggestion}
                onViewDetails={handleViewMealDetails}
                onTrackMeal={handleTrackMeal}
                compact={true}
                className="bg-transparent border-0 p-0"
              />
            </div>
          </section>
        )}

        {/* Loading state pour suggestion */}
        {!isReady && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              💫 Suggestions pour toi
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </section>
        )}

        {/* Navigation rapide */}
        <section>
          <h2 className="text-xl font-semibold mb-4">🗂️ Explorer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={handleNavigateToSuggestions}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-left"
            >
              <div className="text-2xl mb-2">🥗</div>
              <h3 className="font-semibold text-lg mb-1">Suggestions repas</h3>
              <p className="text-sm text-gray-600">Idées adaptées à tes symptômes</p>
            </button>

            <button className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-left">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold text-lg mb-1">Recettes IG bas</h3>
              <p className="text-sm text-gray-600">Bibliothèque complète avec instructions</p>
            </button>
          </div>
        </section>

        {/* Suggestions récentes ou populaires */}
        <section>
          <h2 className="text-xl font-semibold mb-4">⭐ Suggestions populaires</h2>
          {isReady && suggestions.length > 1 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.slice(1, 4).map((meal) => (
                <SuggestionCard
                  key={meal.id}
                  meal={meal}
                  onViewDetails={handleViewMealDetails}
                  onTrackMeal={handleTrackMeal}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Omelette aux épinards',
                  time: '10 min',
                  rating: '4.8',
                  category: 'Petit-déjeuner',
                  benefits: 'Protéines'
                },
                {
                  title: 'Salade de lentilles',
                  time: '20 min',
                  rating: '4.6',
                  category: 'Déjeuner',
                  benefits: 'Anti-inflammatoire'
                },
                {
                  title: 'Saumon aux légumes',
                  time: '25 min',
                  rating: '4.9',
                  category: 'Dîner',
                  benefits: 'Oméga-3'
                }
              ].map((recipe, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-orange-100 to-green-100 rounded-lg mb-3 flex items-center justify-center text-3xl">
                    🍽️
                  </div>
                  <h3 className="font-semibold mb-1">{recipe.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>⭐ {recipe.rating}</span>
                    <span>•</span>
                    <span>⏱️ {recipe.time}</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {recipe.category}
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                      {recipe.benefits}
                    </span>
                  </div>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Voir la recette
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA vers suggestions complètes */}
        <section className="text-center py-8">
          <button
            onClick={handleNavigateToSuggestions}
            className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            Voir toutes mes suggestions personnalisées →
          </button>
        </section>
      </div>

      {/* Modal détails */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onTrackMeal={handleTrackMeal}
      />

      {/* Notification tracking success */}
      <TrackingSuccess
        meal={trackedMeal}
        isVisible={showTrackingSuccess}
        onClose={() => {
          setShowTrackingSuccess(false);
          setTrackedMeal(null);
        }}
        onViewHistory={handleViewHistory}
        onRateMeal={handleRateMeal}
      />
    </div>
  );
};

export default NutritionView;
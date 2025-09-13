import { useState, useMemo } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useMealSuggestions } from '../hooks/useMealSuggestions';
import SuggestionCard from '../components/SuggestionCard';
import MealDetailModal from '../components/MealDetailModal';
import TrackingSuccess from '../components/TrackingSuccess';
import MealSuggestionsView from './MealSuggestionsView';

const NutritionView = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'suggestions'
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackedMeal, setTrackedMeal] = useState(null);
  const [showTrackingSuccess, setShowTrackingSuccess] = useState(false);

  // Contexte utilisateur stable (mémorisé pour éviter les re-renders)
  const userContext = useMemo(() => ({
    userId: user?.id,
    symptoms: [], // À connecter avec le journal quotidien
    cyclePhase: null, // À connecter avec le suivi de cycle
    timeOfDay: new Date().getHours(),
    maxPrepTime: 30
  }), [user?.id]);

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
    // TODO: Implémenter historique nutrition quand disponible
    console.log('Navigation vers historique nutrition');
  };

  const handleRateMeal = async (rating) => {
    if (trackedMeal) {
      // Ici on pourrait mettre à jour la note du repas
      console.log('Rating meal:', trackedMeal.name, rating);
    }
  };

  const handleNavigateToSuggestions = () => {
    setCurrentView('suggestions');
  };

  // Vue suggestions complètes
  if (currentView === 'suggestions') {
    return <MealSuggestionsView onBack={() => setCurrentView('overview')} />;
  }

  // Vue d'entrée du module
  const OverviewView = () => (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🍽️ Nutrition SOPK
        </h1>
        <p className="text-gray-600">
          Suggestions repas personnalisées pour gérer vos symptômes
        </p>
      </header>

      {!user && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-600">
            Connectez-vous pour accéder à vos suggestions nutritionnelles personnalisées.
          </p>
        </div>
      )}

      {user && (
        <div className="space-y-8">
          {/* Suggestion intelligente du moment */}
          {isReady && primarySuggestion && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                💫 Suggestion pour vous
              </h2>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
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
          {loading && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                💫 Suggestions pour vous
              </h2>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border animate-pulse">
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
                <p className="text-sm text-gray-600">Idées adaptées à vos symptômes</p>
              </button>

              <div className="bg-white p-6 rounded-xl shadow-sm border opacity-60 text-left">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-semibold text-lg mb-1">Recettes IG bas</h3>
                <p className="text-sm text-gray-600">Bientôt disponible</p>
              </div>
            </div>
          </section>

          {/* Suggestions supplémentaires */}
          {isReady && suggestions.length > 1 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">✨ Autres suggestions</h2>
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
            </section>
          )}

          {/* Empty state */}
          {!loading && (!suggestions || suggestions.length === 0) && (
            <section className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucune suggestion disponible
              </h3>
              <p className="text-gray-600">
                Les suggestions nutritionnelles seront bientôt disponibles.
              </p>
            </section>
          )}

          {/* CTA vers suggestions complètes */}
          {isReady && suggestions.length > 0 && (
            <section className="text-center py-8">
              <button
                onClick={handleNavigateToSuggestions}
                className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                Voir toutes mes suggestions personnalisées →
              </button>
            </section>
          )}

          {/* Conseils nutrition SOPK */}
          <section className="bg-green-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              🌱 Nutrition et SOPK
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700">Index glycémique bas pour réguler l'insuline</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700">Anti-inflammatoires naturels</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700">Équilibre hormonal par l'alimentation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700">Gestion du poids et de l'énergie</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );

  return (
    <>
      <OverviewView />

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
    </>
  );
};

export default NutritionView;
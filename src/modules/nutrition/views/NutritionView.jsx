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
    <div className="p-6 max-w-4xl mx-auto" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* En-tête avec accent vert sauge */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
          🍽️ Nutrition SOPK
        </h1>
        <p style={{ color: '#6B7280' }}>
          Suggestions repas adaptées à tes besoins
        </p>
      </header>

      {!user && (
        <div className="bg-white rounded-xl p-8 text-center" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#1F2937' }}>
            Connexion requise
          </h3>
          <p style={{ color: '#6B7280' }}>
            Connectez-vous pour accéder à vos suggestions nutritionnelles personnalisées.
          </p>
        </div>
      )}

      {user && (
        <div className="space-y-6">
          {/* Suggestion principale */}
          {isReady && primarySuggestion && (
            <section>
              {/* Badge discret */}
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#6EE7B7', color: '#1F2937' }}>
                  ✨ Ma suggestion du moment
                </span>
              </div>

              {/* Carte suggestion avec couleurs SOPK */}
              <div className="bg-white rounded-xl p-6" style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '2px solid #6EE7B7'
              }}>
                <SuggestionCard
                  meal={primarySuggestion}
                  onViewDetails={handleViewMealDetails}
                  onTrackMeal={handleTrackMeal}
                  compact={false}
                  className="border-0 shadow-none bg-transparent"
                />
              </div>
            </section>
          )}

          {/* Loading state */}
          {loading && (
            <section>
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                  ⏳ Recherche en cours...
                </span>
              </div>
              <div className="bg-white rounded-xl p-6 animate-pulse" style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '2px solid #E5E7EB'
              }}>
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </section>
          )}

          {/* Navigation claire */}
          {isReady && primarySuggestion && (
            <section className="text-center">
              <button
                onClick={handleNavigateToSuggestions}
                className="px-8 py-3 rounded-xl font-medium transition-colors"
                style={{
                  backgroundColor: '#6EE7B7',
                  color: '#1F2937'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#34D399'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6EE7B7'}
              >
                Voir toutes les suggestions →
              </button>
            </section>
          )}

          {/* Empty state */}
          {!loading && (!suggestions || suggestions.length === 0) && (
            <section className="text-center py-8">
              <div className="bg-white rounded-xl p-8" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
                  Aucune suggestion disponible
                </h3>
                <p className="mb-4" style={{ color: '#6B7280' }}>
                  Explorez le catalogue complet en attendant.
                </p>
                <button
                  onClick={handleNavigateToSuggestions}
                  className="px-6 py-2 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: '#6EE7B7',
                    color: '#1F2937'
                  }}
                >
                  Voir le catalogue →
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Footer discret avec couleurs SOPK */}
      <footer className="mt-12 pt-6 text-center" style={{ borderTop: '1px solid #E5E7EB' }}>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
            🌱 Nutrition adaptée SOPK
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs" style={{ color: '#6B7280' }}>
            <span>Index glycémique bas</span>
            <span>•</span>
            <span>Anti-inflammatoire</span>
            <span>•</span>
            <span>Équilibre hormonal</span>
          </div>
        </div>
      </footer>
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
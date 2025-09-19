import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useMealSuggestions } from '../hooks/useMealSuggestions';
import SuggestionCard from '../components/SuggestionCard';
import MealDetailModal from '../components/MealDetailModal';
import TrackingSuccess from '../components/TrackingSuccess';
import RecipeLibraryView from './RecipeLibraryView';
import NutritionHistoryView from './NutritionHistoryView';
import CookingModeView from './CookingModeView';
import AddRecipeView from './AddRecipeView';
import trackingService from '../services/trackingService';

const NutritionView = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'library', 'history', 'add-recipe'
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackedMeal, setTrackedMeal] = useState(null);
  const [showTrackingSuccess, setShowTrackingSuccess] = useState(false);
  const [todayMeals, setTodayMeals] = useState([]);
  const [loadingTodayMeals, setLoadingTodayMeals] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState(null);

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
  const topSuggestions = suggestions.slice(0, 3);

  // Logique pour déterminer le prochain type de repas
  const getNextMealType = () => {
    const hour = new Date().getHours();
    const takenMealTypes = todayMeals.map(meal => meal.meal_type);

    if (hour < 10 && !takenMealTypes.includes('breakfast')) {
      return 'breakfast';
    } else if (hour < 15 && !takenMealTypes.includes('lunch')) {
      return 'lunch';
    } else if (hour < 20 && !takenMealTypes.includes('dinner')) {
      return 'dinner';
    } else if (!takenMealTypes.includes('snack')) {
      return 'snack';
    }
    return null;
  };

  const getSmartMessage = () => {
    const nextMealType = getNextMealType();
    const hour = new Date().getHours();
    const takenMealTypes = todayMeals.map(meal => meal.meal_type);

    if (!nextMealType) {
      if (takenMealTypes.length === 0) {
        return "Il est peut-être temps de prendre un repas ou une collation 😊";
      }
      return "Tous tes repas principaux sont pris ! Tu peux consulter le catalogue pour des idées de collations.";
    }

    const mealTypeNames = {
      breakfast: 'petit-déjeuner',
      lunch: 'déjeuner',
      dinner: 'dîner',
      snack: 'collation'
    };

    return `Il est temps pour ton ${mealTypeNames[nextMealType]} ! 🍽️`;
  };

  // Charger les repas d'aujourd'hui
  useEffect(() => {
    if (!user?.id) return;

    const loadTodayMeals = async () => {
      setLoadingTodayMeals(true);
      try {
        const { data } = await trackingService.getTodayMeals(user.id);
        setTodayMeals(data || []);
      } catch (error) {
        setTodayMeals([]);
      } finally {
        setLoadingTodayMeals(false);
      }
    };

    loadTodayMeals();
  }, [user?.id]);

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

      // Recharger les repas d'aujourd'hui
      try {
        const { data } = await trackingService.getTodayMeals(user.id);
        setTodayMeals(data || []);
      } catch (error) {

      }
    }
  };

  const handleViewHistory = () => {
    setCurrentView('history');
    // Fermer le toast de tracking success
    setShowTrackingSuccess(false);
    setTrackedMeal(null);
  };

  const handleRateMeal = async (_rating) => {
    if (trackedMeal) {
      // Ici on pourrait mettre à jour la note du repas

    }
  };

  const handleStartCooking = (recipe) => {
    setCookingRecipe(recipe);
  };

  const handleRecipeAdded = (recipe) => {
    // Retourner à la vue bibliothèque après ajout
    setCurrentView('library');
  };

  // Vue ajout de recette
  if (currentView === 'add-recipe') {
    return (
      <AddRecipeView
        onBack={() => setCurrentView('library')}
        onRecipeAdded={handleRecipeAdded}
      />
    );
  }

  // Vue bibliothèque de recettes
  if (currentView === 'library') {
    return (
      <>
        <RecipeLibraryView
          onBack={() => setCurrentView('overview')}
          onViewHistory={handleViewHistory}
          onAddRecipe={() => setCurrentView('add-recipe')}
        />
        {/* Notification tracking success globale */}
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
  }

  // Vue historique nutrition
  if (currentView === 'history') {
    return (
      <>
        <NutritionHistoryView onBack={() => setCurrentView('overview')} />
        {/* Notification tracking success globale */}
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
  }

  // Vue d'entrée du module
  const OverviewView = () => (
    <div className="p-3 lg:p-6 max-w-4xl mx-auto" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* En-tête avec accent vert sauge */}
      <header className="text-center mb-4 lg:mb-8 px-4">
        <h1 className="text-lg lg:text-3xl font-bold mb-1 lg:mb-2" style={{ color: '#1F2937' }}>
          🍽️ Nutrition SOPK
        </h1>
        <p className="text-xs lg:text-base" style={{ color: '#6B7280' }}>
          Suggestions repas adaptées à tes besoins
        </p>
      </header>

      {!user && (
        <div className="bg-white rounded-xl p-4 lg:p-8 text-center" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
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
          {/* Section repas consommés aujourd'hui */}
          <section>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1F2937' }}>
              🍽️ Mes repas d'aujourd'hui
            </h2>

            {loadingTodayMeals && (
              <div className="bg-white rounded-xl p-6 animate-pulse" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            )}

{!loadingTodayMeals && (
              <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                {/* Organisation par catégories de repas */}
                {(() => {
                  const mealCategories = [
                    { type: 'breakfast', name: 'Petit-déjeuner', icon: '🌅' },
                    { type: 'lunch', name: 'Déjeuner', icon: '🍽️' },
                    { type: 'dinner', name: 'Dîner', icon: '🌙' },
                    { type: 'snack', name: 'Collation', icon: '🥨' },
                    { type: null, name: 'Repas sans catégorie', icon: '❓' }
                  ];

                  const mealsByType = todayMeals.reduce((acc, meal) => {
                    if (!acc[meal.meal_type]) acc[meal.meal_type] = [];
                    acc[meal.meal_type].push(meal);
                    return acc;
                  }, {});

                  return (
                    <div className="space-y-4">
                      {mealCategories.map(category => {
                        const meals = mealsByType[category.type] || [];
                        const isEmpty = meals.length === 0;

                        // Ne pas afficher "Repas sans catégorie" s'il est vide
                        if (category.type === null && isEmpty) {
                          return null;
                        }

                        return (
                          <div key={category.type || 'null'} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{category.icon}</span>
                              <span className="font-medium" style={{ color: '#1F2937' }}>
                                {category.name}
                              </span>
                              {category.type === null && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                  À catégoriser
                                </span>
                              )}
                            </div>

                            {isEmpty ? (
                              <div className="text-sm italic" style={{ color: '#6B7280' }}>
                                Rien de pris encore
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {meals.map((trackedMeal, index) => (
                                  <div key={`${trackedMeal.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
                                    <div className="flex-1">
                                      <div className="font-medium mb-1" style={{ color: '#1F2937' }}>
                                        {trackedMeal.recipes?.title || 'Repas inconnu'}
                                      </div>
                                      <div className="flex gap-4 text-xs" style={{ color: '#6B7280' }}>
                                        {trackedMeal.recipes?.prep_time_minutes && (
                                          <span>⏱️ {trackedMeal.recipes.prep_time_minutes} min</span>
                                        )}
                                        {trackedMeal.recipes?.difficulty && (
                                          <span>📊 {trackedMeal.recipes.difficulty}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right text-xs" style={{ color: '#6B7280' }}>
                                      <div>{new Date(trackedMeal.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                                      {trackedMeal.satisfaction_rating && (
                                        <div className="flex items-center gap-1">
                                          <span>😊</span>
                                          <span>{trackedMeal.satisfaction_rating}/10</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

          </section>

          {/* Suggestions personnalisées */}
          {isReady && topSuggestions.length > 0 && (
            <section>
              {/* Badge discret */}
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#6EE7B7', color: '#1F2937' }}>
                  ✨ {getSmartMessage()}
                </span>
              </div>

              {/* Header section */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#1F2937' }}>
                  🍽️ Tes suggestions du moment
                </h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {topSuggestions.length} recette{topSuggestions.length > 1 ? 's' : ''} adaptée{topSuggestions.length > 1 ? 's' : ''} à tes besoins • Choisis celle qui te fait envie
                </p>
              </div>

              {/* Grid de suggestions - même format que la librairie */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                {topSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    meal={suggestion}
                    onViewDetails={handleViewMealDetails}
                    onTrackMeal={handleTrackMeal}
                    onStartCooking={handleStartCooking}
                    compact={true}
                    showCookingButton={false}
                  />
                ))}
              </div>

              {/* Encouragement discret */}
              <div className="text-center mt-6">
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  💡 Chaque recette est pensée pour t'aider avec le SOPK
                </p>
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


          {/* Empty state */}
          {!loading && (!suggestions || suggestions.length === 0) && (
            <section className="text-center py-8">
              <div className="bg-white rounded-xl p-8" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
                  {getSmartMessage()}
                </h3>
                <p className="mb-4" style={{ color: '#6B7280' }}>
                  {(() => {
                    const nextMealType = getNextMealType();
                    if (!nextMealType) {
                      return "Tu peux explorer le catalogue pour des idées de collations ou de futurs repas.";
                    }
                    return "Explore le catalogue pour trouver le repas parfait !";
                  })()}
                </p>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Navigation permanente */}
      <section className="text-center space-y-4 mt-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <button
            onClick={() => setCurrentView('library')}
            className="px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors text-sm sm:text-base"
            style={{
              backgroundColor: '#6EE7B7',
              color: '#1F2937'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#34D399'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#6EE7B7'}
          >
            📚 Découvrir nos recettes IG bas →
          </button>

          <button
            onClick={() => setCurrentView('add-recipe')}
            className="px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors text-sm sm:text-base"
            style={{
              backgroundColor: 'var(--color-primary-bleu-ciel)',
              color: 'white'
            }}
          >
            📝 Ajouter ma recette
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className="px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors border-2 text-sm sm:text-base"
            style={{
              borderColor: '#6EE7B7',
              color: '#1F2937'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#6EE7B7';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            📊 Voir mon historique
          </button>
        </div>
        <p className="text-sm text-gray-600 px-4">
          Explorer toutes nos recettes spéciales SOPK ou consulter ton historique nutrition
        </p>
      </section>

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
        onStartCooking={handleStartCooking}
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

      {/* Mode cuisine guidé */}
      {cookingRecipe && (
        <div className="fixed inset-0 z-50">
          <CookingModeView
            recipeId={cookingRecipe.id}
            onBack={() => setCookingRecipe(null)}
            onComplete={() => {
              setCookingRecipe(null);
            }}
          />
        </div>
      )}
    </>
  );
};

export default NutritionView;
/**
 * 📚 Vue Bibliothèque de Recettes IG Bas
 *
 * Composant dédié à l'affichage et à la recherche dans la bibliothèque
 * de recettes à index glycémique bas, adaptées aux besoins SOPK.
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import recipeService from '../services/recipeService';
import recipeTrackingService from '../services/recipeTrackingService';
import SuggestionCard from '../components/SuggestionCard';
import MealDetailModal from '../components/MealDetailModal';
import TrackingSuccess from '../components/TrackingSuccess';
import GroceryListGenerator from '../components/GroceryListGenerator';
import CookingModeView from './CookingModeView';

const RecipeLibraryView = ({ onBack }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [maxPrepTime, setMaxPrepTime] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackedMeal, setTrackedMeal] = useState(null);
  const [showTrackingSuccess, setShowTrackingSuccess] = useState(false);

  // Nouvelles fonctionnalités
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);

  // Catégories de repas
  const categories = [
    { value: 'all', label: 'Toutes catégories', icon: '🍽️' },
    { value: 'breakfast', label: 'Petit-déjeuner', icon: '🌅' },
    { value: 'lunch', label: 'Déjeuner', icon: '🍽️' },
    { value: 'dinner', label: 'Dîner', icon: '🌙' },
    { value: 'snack', label: 'Collation', icon: '🥨' }
  ];

  // Niveaux de difficulté
  const difficulties = [
    { value: 'all', label: 'Toutes difficultés' },
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Modéré' },
    { value: 'hard', label: 'Difficile' }
  ];

  // Charger toutes les recettes
  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      try {
        const { data } = await recipeService.getAllRecipes({
          glycemicIndex: 'low' // Filtrer par IG bas directement
        });
        setRecipes(data);
      } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  // Filtrer les recettes selon les critères
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.sopk_benefits?.some(benefit =>
          benefit.toLowerCase().includes(query)
        )
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    // Filtre par difficulté
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Filtre par temps de préparation
    if (maxPrepTime) {
      filtered = filtered.filter(recipe =>
        recipe.prep_time_minutes <= parseInt(maxPrepTime)
      );
    }

    return filtered;
  }, [recipes, searchQuery, selectedCategory, selectedDifficulty, maxPrepTime]);

  // Gestionnaires d'événements
  const handleViewMealDetails = (meal) => {
    setSelectedMeal(meal);
    setShowModal(true);
  };

  const handleTrackMeal = async (mealId, mealType) => {
    if (!user?.id) return;

    try {
      await recipeTrackingService.trackRecipe(user.id, mealId, {
        taste_rating: 5,
        would_make_again: true
      });

      // Trouver la recette trackée pour l'affichage
      const meal = filteredRecipes.find(r => r.id === mealId);
      if (meal) {
        setTrackedMeal(meal);
        setShowTrackingSuccess(true);
      }
    } catch (error) {
      console.error('Erreur lors du tracking:', error);
    }
  };

  const handleStartCooking = (recipe) => {
    setCookingRecipe(recipe);
  };

  const handleToggleSelection = (recipe) => {
    setSelectedRecipes(prev => {
      const isSelected = prev.some(r => r.id === recipe.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const handleGenerateGroceryList = () => {
    if (selectedRecipes.length > 0) {
      setShowGroceryList(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedRecipes([]);
    setSelectionMode(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setMaxPrepTime('');
  };

  const handleViewHistory = () => {
    // TODO: Implémenter navigation vers historique nutrition

  };

  const handleRateMeal = async (rating) => {
    if (trackedMeal) {
      // Ici on pourrait mettre à jour la note du repas

    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* En-tête */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ← Retour
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectionMode(!selectionMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectionMode ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {selectionMode ? '✓ Mode sélection' : '🛒 Sélectionner'}
            </button>
            {selectedRecipes.length > 0 && (
              <>
                <button
                  onClick={handleGenerateGroceryList}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  📝 Liste courses ({selectedRecipes.length})
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ✖
                </button>
              </>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>
              📚 Catalogue Recettes IG Bas
            </h1>
            <p style={{ color: '#6B7280' }}>
              {filteredRecipes.length} recette{filteredRecipes.length !== 1 ? 's' : ''} spéciale{filteredRecipes.length !== 1 ? 's' : ''} SOPK • Toutes à index glycémique bas
            </p>
          </div>
        </div>
      </header>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        {/* Recherche textuelle */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
            🔍 Recherche
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, description, nutriments..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
          />
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Catégorie */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
              Catégorie
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulté */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
              Difficulté
            </label>
            <select
              id="difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          {/* Temps de préparation */}
          <div>
            <label htmlFor="prepTime" className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
              Temps max (minutes)
            </label>
            <input
              id="prepTime"
              type="number"
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
              placeholder="Ex: 30"
              min="1"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
            />
          </div>
        </div>

        {/* Bouton effacer filtres */}
        {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || maxPrepTime) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Effacer tous les filtres
          </button>
        )}
      </div>

      {/* Résultats */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl p-8" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#1F2937' }}>
              Aucune recette trouvée
            </h3>
            <p style={{ color: '#6B7280' }}>
              Essayez de modifier vos critères de recherche ou effacez les filtres.
            </p>
          </div>
        </div>
      )}

      {!loading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const isSelected = selectedRecipes.some(r => r.id === recipe.id);
            return (
              <div key={recipe.id} className="relative">
                {selectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelection(recipe)}
                      className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className={`${isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}>
                  <SuggestionCard
                    meal={recipe}
                    onViewDetails={handleViewMealDetails}
                    onTrackMeal={handleTrackMeal}
                    onStartCooking={() => handleStartCooking(recipe)}
                    compact={false}
                    showCookingButton={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Générateur de liste de courses */}
      {showGroceryList && (
        <GroceryListGenerator
          selectedRecipes={selectedRecipes}
          onClose={() => setShowGroceryList(false)}
          onGenerate={(result) => {
            console.log('Liste générée:', result);
            setShowGroceryList(false);
          }}
        />
      )}

      {/* Mode cuisine guidé */}
      {cookingRecipe && (
        <div className="fixed inset-0 z-50">
          <CookingModeView
            recipeId={cookingRecipe.id}
            onBack={() => setCookingRecipe(null)}
            onComplete={(result) => {
              console.log('Cuisine terminée:', result);
              setCookingRecipe(null);
              // Optionnel: Afficher une notification de succès
            }}
          />
        </div>
      )}

      {/* Footer informatif */}
      <footer className="mt-12 pt-6 text-center" style={{ borderTop: '1px solid #E5E7EB' }}>
        <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
            🌱 Pourquoi des recettes à IG bas ?
          </h3>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            L'index glycémique bas aide à stabiliser la glycémie, réduire la résistance à l'insuline
            et améliorer les symptômes du SOPK comme les fringales et les troubles de l'humeur.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs" style={{ color: '#6B7280' }}>
            <span>✅ Régule la glycémie</span>
            <span>•</span>
            <span>✅ Réduit les fringales</span>
            <span>•</span>
            <span>✅ Améliore l'énergie</span>
            <span>•</span>
            <span>✅ Favorise la perte de poids</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RecipeLibraryView;
/**
 * 📋 Composant MealDetailModal
 *
 * Modal affichant les détails complets d'une suggestion de repas
 * avec ingrédients, préparation et options de tracking.
 */

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DifficultyIndicator from '../../../shared/components/ui/DifficultyIndicator';
import PrepTimeIndicator from '../../../shared/components/ui/PrepTimeIndicator';
import NutritionTag from '../../../shared/components/ui/NutritionTag';

const MealDetailModal = ({
  meal,
  isOpen,
  onClose,
  onTrackMeal,
  onStartCooking
}) => {
  const [selectedMealType, setSelectedMealType] = useState(meal?.category || 'lunch');

  // Réinitialiser le type de repas sélectionné quand le repas change
  useEffect(() => {
    if (meal?.category) {
      setSelectedMealType(meal.category);
    }
  }, [meal?.id]);

  if (!isOpen || !meal) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTrackMeal = () => {
    onTrackMeal(meal.id, selectedMealType);
    onClose();
  };

  const handleStartCooking = () => {
    onStartCooking && onStartCooking(meal);
    onClose();
  };

  const mealTypes = [
    { value: 'breakfast', label: '🌅 Petit-déjeuner' },
    { value: 'lunch', label: '🍽️ Déjeuner' },
    { value: 'dinner', label: '🌙 Dîner' },
    { value: 'snack', label: '🥨 Collation' }
  ];


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {meal.title || meal.name}
            </h2>
            {meal.description && (
              <p className="text-gray-600 text-sm mb-3">
                {meal.description}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <PrepTimeIndicator minutes={meal.prep_time_minutes} variant="badge" />
              <DifficultyIndicator level={meal.difficulty} variant="full" />
              {meal.glycemic_index_category === 'low' && (
                <NutritionTag type="low-gi" />
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Bénéfices SOPK */}
          {meal.sopk_benefits && meal.sopk_benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🌟 Bénéfices pour le SOPK
              </h3>
              <div className="flex gap-2 flex-wrap">
                {meal.sopk_benefits.map(benefit => (
                  <NutritionTag key={benefit} type={benefit} />
                ))}
              </div>
            </div>
          )}

          {/* Conseil expert */}
          {meal.tips && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 italic">
                💡 <strong>Conseil :</strong> {meal.tips}
              </p>
            </div>
          )}

          {/* Ingrédients */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🛒 Ingrédients
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {meal.ingredients && Array.isArray(meal.ingredients) ? (
                <ul className="space-y-2">
                  {meal.ingredients.map((ingredient, index) => {
                    // Gérer les ingrédients qui peuvent être des objets ou des strings
                    if (typeof ingredient === 'string') {
                      return (
                        <li key={index} className="text-gray-700">
                          <span>{ingredient}</span>
                        </li>
                      );
                    } else if (ingredient && typeof ingredient === 'object') {
                      return (
                        <li key={index} className="text-gray-700 flex justify-between">
                          <span>
                            {ingredient.name || ingredient.ingredient ||
                             (typeof ingredient === 'object' ?
                               Object.values(ingredient).filter(v => typeof v === 'string' || typeof v === 'number').join(' ') :
                               String(ingredient)
                             )
                            }
                          </span>
                          {ingredient.quantity && (
                            <span className="text-sm text-green-500 font-medium">{ingredient.quantity} <span className="text-sm text-gray-500 font-medium">{ingredient.unit}</span></span>
                          )}
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Ingrédients non disponibles</p>
              )}
            </div>
          </div>

          {/* Préparation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              👩‍🍳 Préparation
            </h3>
            {meal.instructions && Array.isArray(meal.instructions) ? (
              <div className="space-y-3">
                {meal.instructions.map((instruction, index) => {
                  // Gérer les instructions qui peuvent être des objets ou des strings
                  const instructionText = typeof instruction === 'string'
                    ? instruction
                    : instruction?.instruction || instruction?.step || JSON.stringify(instruction);

                  return (
                    <div key={index} className="flex gap-3">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="text-gray-700 leading-relaxed">
                        <p>{instructionText}</p>
                        {/* Afficher les conseils s'ils sont disponibles */}
                        {typeof instruction === 'object' && instruction?.tips && (
                          <p className="text-sm text-blue-600 italic mt-1">💡 {instruction.tips}</p>
                        )}
                        {/* Afficher la durée si disponible */}
                        {typeof instruction === 'object' && instruction?.duration_minutes && (
                          <p className="text-xs text-gray-500 mt-1">⏱️ {instruction.duration_minutes} min</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 italic">Instructions de préparation non disponibles</p>
              </div>
            )}
          </div>

          {/* Informations générales */}
          {(meal.servings || meal.nutritional_info?.calories) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📊 Informations générales
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {meal.servings && (
                    <div>
                      <span className="text-gray-600">Portions :</span>
                      <span className="font-semibold ml-2">{meal.servings}</span>
                    </div>
                  )}
                  {meal.nutritional_info?.calories && (
                    <div>
                      <span className="text-gray-600">Calories :</span>
                      <span className="font-semibold ml-2">~{meal.nutritional_info.calories} kcal</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informations nutritionnelles */}
          {meal.main_nutrients && meal.main_nutrients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🥗 Profil nutritionnel
              </h3>
              <div className="flex gap-2 flex-wrap">
                {meal.main_nutrients.map(nutrient => (
                  <NutritionTag key={nutrient} type={nutrient} />
                ))}
              </div>
            </div>
          )}

          {/* Sélection du type de repas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🕐 Moment du repas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedMealType(type.value)}
                  className={`p-3 text-sm font-medium rounded-lg transition-colors ${
                    selectedMealType === type.value
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col gap-3">
              {/* Ligne 1: Actions principales */}
              <div className="flex gap-3">
                <button
                  onClick={handleTrackMeal}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  ✅ J'ai mangé ce repas
                </button>
                {onStartCooking && (
                  <button
                    onClick={handleStartCooking}
                    className="flex-1 bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                  >
                    👩‍🍳 Mode cuisine guidé
                  </button>
                )}
              </div>
              {/* Ligne 2: Bouton fermer */}
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>

          {/* Restrictions alimentaires */}
          {meal.dietary_restrictions && meal.dietary_restrictions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2 flex-wrap">
                {meal.dietary_restrictions.map(restriction => (
                  <span
                    key={restriction}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                  >
                    {restriction === 'vegetarian' ? '🌱 Végétarien' :
                     restriction === 'vegan' ? '🌿 Vegan' :
                     restriction === 'gluten_free' ? '🌾 Sans gluten' :
                     restriction}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;
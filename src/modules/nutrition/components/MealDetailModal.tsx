/**
 * 📋 Composant MealDetailModal
 *
 * Modal affichant les détails complets d'une suggestion de repas
 * avec ingrédients, préparation et options de tracking.
 */

import { XMarkIcon } from '@heroicons/react/24/outline';
import DifficultyIndicator from '../../../shared/components/ui/DifficultyIndicator';
import PrepTimeIndicator from '../../../shared/components/ui/PrepTimeIndicator';
import NutritionTag from '../../../shared/components/ui/NutritionTag';

const MealDetailModal = ({
  meal,
  isOpen,
  onClose,
  onTrackMeal
}) => {
  if (!isOpen || !meal) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTrackMeal = () => {
    onTrackMeal(meal.id, meal.category);
    onClose();
  };

  const formatPreparationSteps = (steps) => {
    if (!steps) return [];
    return steps.split('\n').filter(step => step.trim() !== '');
  };

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
              {meal.name}
            </h2>
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
              <p className="text-gray-700 leading-relaxed">
                {meal.ingredients_simple}
              </p>
            </div>
          </div>

          {/* Préparation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              👩‍🍳 Préparation
            </h3>
            <div className="space-y-3">
              {formatPreparationSteps(meal.preparation_steps).map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {step.trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
              {meal.estimated_calories && (
                <p className="text-sm text-gray-600 mt-2">
                  Environ {meal.estimated_calories} kcal par portion
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex gap-3">
              <button
                onClick={handleTrackMeal}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                ✅ J'ai mangé ce repas
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
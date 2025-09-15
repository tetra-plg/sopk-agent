/**
 * 🍽️ Composant SuggestionCard
 *
 * Carte interactive pour afficher une suggestion de repas
 * avec ses bénéfices SOPK et options d'action.
 */

import DifficultyIndicator from '../../../shared/components/ui/DifficultyIndicator';
import PrepTimeIndicator from '../../../shared/components/ui/PrepTimeIndicator';
import NutritionTag from '../../../shared/components/ui/NutritionTag';

const SuggestionCard = ({
  meal,
  onViewDetails,
  onTrackMeal,
  onStartCooking,
  compact = false,
  showCookingButton = false,
  className = ''
}) => {
  const _handleTrackMeal = () => {
    onTrackMeal(meal.id, meal.category);
  };

  const handleViewDetails = () => {
    onViewDetails(meal);
  };

  const handleStartCooking = () => {
    onStartCooking && onStartCooking(meal);
  };

  const cardClasses = compact
    ? 'bg-white p-4 rounded-lg border border-gray-200'
    : 'bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-green-400 transition-all duration-300 hover:shadow-lg';

  // Fonction pour obtenir l'emoji et le label du type de repas
  const getMealTypeDisplay = (category) => {
    const mealTypes = {
      'breakfast': { emoji: '🌅', label: 'Petit-déjeuner' },
      'lunch': { emoji: '🍽️', label: 'Déjeuner' },
      'dinner': { emoji: '🌙', label: 'Dîner' },
      'snack': { emoji: '🥨', label: 'Collation' }
    };
    return mealTypes[category] || { emoji: '🍽️', label: category || 'Repas' };
  };

  const mealTypeInfo = getMealTypeDisplay(meal.category);

  return (
    <div className={`${cardClasses} ${className}`}>
      {/* Type de repas */}
      {!compact && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
            <span>{mealTypeInfo.emoji}</span>
            <span>{mealTypeInfo.label}</span>
          </span>
        </div>
      )}

      {/* En-tête avec titre */}
      <div className="mb-3">
        <h3 className={`font-semibold text-gray-800 ${compact ? 'text-base' : 'text-lg'} leading-tight`}>
          {meal.title || meal.name}
        </h3>
      </div>

      {/* Indicateurs temps et difficulté */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <PrepTimeIndicator
          minutes={meal.prep_time_minutes}
          variant="emoji"
          size={compact ? 'xs' : 'sm'}
        />
        <DifficultyIndicator
          level={meal.difficulty}
          variant="emoji"
          size={compact ? 'xs' : 'sm'}
        />
        {meal.glycemic_index_category === 'low' && (
          <NutritionTag type="low-gi" size={compact ? 'xs' : 'sm'} />
        )}
      </div>

      {/* Tags nutritionnels */}
      {meal.main_nutrients && meal.main_nutrients.length > 0 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {meal.main_nutrients.slice(0, compact ? 2 : 3).map(nutrient => (
            <NutritionTag
              key={nutrient}
              type={nutrient}
              size={compact ? 'xs' : 'sm'}
            />
          ))}
          {meal.main_nutrients.length > (compact ? 2 : 3) && (
            <span className="text-xs text-gray-500 self-center">
              +{meal.main_nutrients.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      {/* Conseil SOPK */}
      {meal.tips && !compact && (
        <p className="text-sm text-gray-600 italic mb-4 bg-blue-50 p-2 rounded-lg">
          💡 {meal.tips}
        </p>
      )}

      {/* Bénéfices SOPK */}
      {meal.sopk_benefits && meal.sopk_benefits.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-1 flex-wrap">
            {meal.sopk_benefits.slice(0, 2).map(benefit => (
              <NutritionTag
                key={benefit}
                type={benefit}
                size="xs"
                variant="outline"
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={`flex gap-2 ${compact ? 'flex-col' : showCookingButton ? 'flex-wrap' : ''}`}>
        <button
          onClick={handleViewDetails}
          className={`
            bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium
            hover:bg-blue-100 transition-colors
            ${compact ? 'flex-1' : showCookingButton ? 'flex-1' : 'flex-1'}
          `}
        >
          {compact ? 'Voir' : 'Voir recette'}
        </button>

        {showCookingButton && (
          <button
            onClick={handleStartCooking}
            className={`
              bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium
              hover:bg-purple-600 transition-colors
              ${compact ? 'w-full' : 'flex-1'}
            `}
          >
            👩‍🍳 {compact ? 'Cuisiner' : 'Mode cuisine'}
          </button>
        )}
      </div>

      {/* Score debug (seulement en dev) */}
      {import.meta.env.DEV && meal.score && (
        <div className="mt-2 text-xs text-gray-400">
          Score: {meal.score}
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
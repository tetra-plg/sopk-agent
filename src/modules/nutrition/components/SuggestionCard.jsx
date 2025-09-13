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
  compact = false,
  className = ''
}) => {
  const handleTrackMeal = () => {
    onTrackMeal(meal.id, meal.category);
  };

  const handleViewDetails = () => {
    onViewDetails(meal);
  };

  const cardClasses = compact
    ? 'bg-white p-4 rounded-lg border border-gray-200'
    : 'bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-green-400 transition-all duration-300 hover:shadow-lg';

  return (
    <div className={`${cardClasses} ${className}`}>
      {/* En-tête avec titre et action rapide */}
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-semibold text-gray-800 ${compact ? 'text-base' : 'text-lg'}`}>
          {meal.name}
        </h3>
        {!compact && (
          <button
            onClick={handleViewDetails}
            className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
          >
            Voir →
          </button>
        )}
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
      <div className={`flex gap-2 ${compact ? 'flex-col' : ''}`}>
        <button
          onClick={handleViewDetails}
          className={`
            bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium
            hover:bg-blue-100 transition-colors
            ${compact ? 'flex-1' : 'flex-1'}
          `}
        >
          {compact ? 'Voir' : 'Voir recette'}
        </button>
        <button
          onClick={handleTrackMeal}
          className={`
            bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium
            hover:bg-green-600 transition-colors
            ${compact ? 'w-full' : 'shrink-0'}
          `}
        >
          ✅ {compact ? 'Mangé' : 'J\'ai mangé ça'}
        </button>
      </div>

      {/* Score debug (seulement en dev) */}
      {process.env.NODE_ENV === 'development' && meal.score && (
        <div className="mt-2 text-xs text-gray-400">
          Score: {meal.score}
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
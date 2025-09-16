/**
 * 🥗 Carte Idée repas - Nutrition
 *
 * Affiche une suggestion de repas personnalisée avec détails nutritionnels
 */

import type { Recipe } from '../../../types/database';

interface NutritionCardProps {
  todaySuggestion: Recipe | null;
  loading: boolean;
  onShowMealDetails: () => void;
  onNavigate?: (_path: string) => void;
}

const NutritionCard = ({ todaySuggestion, loading, onShowMealDetails, onNavigate }: NutritionCardProps) => {
  return (
    <div className="card-nutrition p-4 md:p-6 transform hover:scale-105 transition-transform duration-200 flex flex-col h-full min-h-[320px]">
      <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--color-accent-vert-sauge)' }}>
        🥗 Idée repas
      </h3>

      {loading ? (
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ) : todaySuggestion ? (
        <>
          <div className="mb-4">
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
              {todaySuggestion.title}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs mb-2">
              <span className="badge-vert-sauge">⏱️ {todaySuggestion.prep_time_minutes}min</span>
              <span className="badge-vert-sauge">👥 {todaySuggestion.servings} portion{todaySuggestion.servings > 1 ? 's' : ''}</span>
              <span className="badge-vert-sauge">📊 {todaySuggestion.difficulty === 'beginner' ? 'Débutant' : todaySuggestion.difficulty === 'easy' ? 'Facile' : todaySuggestion.difficulty === 'medium' ? 'Moyen' : 'Avancé'}</span>
              {todaySuggestion.glycemic_index_category === 'low' && (
                <span className="badge-vert-sauge">🟢 IG bas</span>
              )}
              {todaySuggestion.nutritional_info?.calories && (
                <span className="badge-vert-sauge">🔥 ~{todaySuggestion.nutritional_info.calories}kcal</span>
              )}
            </div>
            {todaySuggestion.sopk_benefits && todaySuggestion.sopk_benefits.length > 0 && (
              <div className="text-xs text-green-600 mb-2">
                💚 {todaySuggestion.sopk_benefits.slice(0, 2).join(' • ')}
              </div>
            )}
          </div>
          {todaySuggestion.description && (
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondaire)' }}>
              {todaySuggestion.description}
            </p>
          )}
          <div className="flex-grow"></div>
          <div className="flex gap-2">
            <button
              onClick={onShowMealDetails}
              className="flex-1 btn-accent-vert text-sm"
            >
              Voir recette
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
              Aucune suggestion
            </h4>
            <p className="text-sm" style={{ color: 'var(--color-text-secondaire)' }}>
              Complétez votre journal pour des suggestions personnalisées
            </p>
          </div>
          <div className="flex-grow"></div>
          <button
            onClick={() => onNavigate ? onNavigate('/nutrition') : {}}
            className="w-full btn-accent-vert text-sm"
          >
            Explorer les repas
          </button>
        </>
      )}
    </div>
  );
};

export default NutritionCard;
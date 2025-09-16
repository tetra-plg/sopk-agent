/**
 * 🥗 Tracker Nutrition
 *
 * Permet de tracker et visualiser les habitudes nutritionnelles
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import trackingService from '../../nutrition/services/trackingService';
// import MiniChart from '../../../shared/components/MiniChart';

const NutritionTracker = () => {
  const { user } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [recentMeals, setRecentMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTracking, setTodayTracking] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false
  });
  const [_weeklyData, _setWeeklyData] = useState<Array<{date: string, mealsCount: number, avgRating: number}>>([]);

  useEffect(() => {
    const loadNutritionData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [statsResult, mealsResult, todayMealsResult] = await Promise.all([
          trackingService.getUserCookingStats(user.id, 7),
          trackingService.getRecentMeals(user.id, 5),
          trackingService.getTodayMeals(user.id)
        ]);

        setWeeklyStats(statsResult.data);
        setRecentMeals(mealsResult.data || []);

        // Analyser les repas d'aujourd'hui
        if (todayMealsResult.data) {
          const todayMeals = todayMealsResult.data;
          const tracking = {
            breakfast: todayMeals.some(m => m.meal_type === 'breakfast'),
            lunch: todayMeals.some(m => m.meal_type === 'lunch'),
            dinner: todayMeals.some(m => m.meal_type === 'dinner'),
            snack: todayMeals.some(m => m.meal_type === 'snack')
          };
          setTodayTracking(tracking);
        }

        // Charger les données pour les graphiques (7 derniers jours)
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];

          try {
            const dayMealsResult = await trackingService.getMealsByDate?.(user.id, dateString) || { data: [] };
            const dayMeals = dayMealsResult.data || [];

            const mealsCount = dayMeals.length;
            const ratingsSum = dayMeals.reduce((sum, meal) => sum + (meal.taste_rating || 0), 0);
            const avgRating = dayMeals.length > 0 ? ratingsSum / dayMeals.length : 0;

            weekData.push({
              date: dateString,
              mealsCount,
              avgRating: Math.round(avgRating * 10) / 10
            });
          } catch {
            // Ne pas ajouter de données si erreur
          }
        }
        _setWeeklyData(weekData);
      } catch (error) {
        console.error('Error loading nutrition data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNutritionData();
  }, [user?.id]);

  const getMealTypeIcon = (type) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getMealTypeName = (type) => {
    switch (type) {
      case 'breakfast': return 'Petit-déj';
      case 'lunch': return 'Déjeuner';
      case 'dinner': return 'Dîner';
      case 'snack': return 'Collation';
      default: return 'Repas';
    }
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(todayTracking).filter(Boolean).length;
    return Math.round((completed / 4) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-nutrition rounded-xl p-6 shadow-sm h-full min-h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🥗 Mon suivi nutrition
      </h3>

      {/* Suivi du jour */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-700">Aujourd'hui</h4>
          <div className="text-sm text-gray-600">
            {getCompletionPercentage()}% tracké
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(todayTracking).map(([mealType, completed]) => (
            <div key={mealType} className={`flex items-center gap-2 p-2 rounded-lg ${completed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
              <span className="text-lg">{getMealTypeIcon(mealType)}</span>
              <span className="text-sm font-medium">{getMealTypeName(mealType)}</span>
              <span className="ml-auto text-lg">{completed ? '✅' : '⭕'}</span>
            </div>
          ))}
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          {Object.values(todayTracking).filter(Boolean).length}/4 repas trackés
        </div>
      </div>

      {/* Stats de la semaine */}
      {weeklyStats && weeklyStats.totalRecipesMade > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Cette semaine</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{weeklyStats.totalRecipesMade}</div>
              <div className="text-xs text-gray-600">Repas trackés</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{weeklyStats.averageTasteRating}/5</div>
              <div className="text-xs text-gray-600">Note moyenne</div>
            </div>
          </div>
        </div>
      )}

      {/* Repas récents */}
      {recentMeals.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Derniers repas</h4>
          <div className="space-y-2">
            {recentMeals.slice(0, 3).map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMealTypeIcon(meal.meal_type)}</span>
                  <div>
                    <div className="font-medium text-sm truncate max-w-32">
                      {meal.recipes?.title || 'Repas inconnu'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getMealTypeName(meal.meal_type)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-xs">
                        {star <= (meal.taste_rating || 0) ? '⭐' : '⭐'}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(meal.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-grow"></div>

      {/* Message d'encouragement si pas de données */}
      {(!weeklyStats || (weeklyStats.totalRecipesMade === 0)) && recentMeals.length === 0 && _weeklyData.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-sm">
            Aucune donnée nutritionnelle pour le moment.
            <br />
            Commence à tracker tes repas pour voir tes habitudes !
          </p>
          <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
            📝 Ajouter un repas
          </button>
        </div>
      )}
    </div>
  );
};

export default NutritionTracker;
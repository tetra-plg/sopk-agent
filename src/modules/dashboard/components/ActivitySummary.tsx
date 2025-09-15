/**
 * 🎯 Résumé d'activité Dashboard
 *
 * Affiche un aperçu compact de l'activité récente de l'utilisatrice
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import trackingService from '../../nutrition/services/trackingService';
import { symptomsService } from '../../cycle/services/symptomsService';

const ActivitySummary = () => {
  const { user } = useAuth();
  const [recentMeals, setRecentMeals] = useState([]);
  const [todaySymptoms, setTodaySymptoms] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivityData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Charger les données en parallèle
        const [mealsResult, symptomsResult, statsResult] = await Promise.all([
          trackingService.getRecentMeals(user.id, 3),
          symptomsService.getSymptomsByDate(user.id, new Date().toISOString().split('T')[0]),
          trackingService.getUserCookingStats(user.id, 7)
        ]);

        setRecentMeals(mealsResult.data || []);
        setTodaySymptoms(symptomsResult.data);
        setWeeklyStats(statsResult.data);
      } catch (error) {
        console.error('Error loading activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivityData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const getMoodEmoji = (level) => {
    if (!level) return '😐';
    if (level <= 2) return '😢';
    if (level <= 3) return '😐';
    if (level <= 4) return '🙂';
    return '😊';
  };

  const getSymptomColor = (level) => {
    if (!level || level <= 1) return 'text-green-600';
    if (level <= 2) return 'text-yellow-600';
    if (level <= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🎯 Résumé d'activité
      </h3>

      <div className="space-y-4">
        {/* Humeur du jour */}
        {todaySymptoms && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMoodEmoji(todaySymptoms.mood_level)}</span>
              <span className="font-medium">Humeur aujourd'hui</span>
            </div>
            <div className="text-right text-sm text-gray-600">
              {todaySymptoms.mood_level ? `${todaySymptoms.mood_level}/5` : 'Non renseigné'}
            </div>
          </div>
        )}

        {/* Symptômes du jour */}
        {todaySymptoms && (todaySymptoms.fatigue_level || todaySymptoms.pain_level || todaySymptoms.stress_level) && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Symptômes aujourd'hui</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {todaySymptoms.fatigue_level && (
                <div className="text-center">
                  <div className={`font-semibold ${getSymptomColor(todaySymptoms.fatigue_level)}`}>
                    {todaySymptoms.fatigue_level}/5
                  </div>
                  <div className="text-gray-600">Fatigue</div>
                </div>
              )}
              {todaySymptoms.pain_level && (
                <div className="text-center">
                  <div className={`font-semibold ${getSymptomColor(todaySymptoms.pain_level)}`}>
                    {todaySymptoms.pain_level}/5
                  </div>
                  <div className="text-gray-600">Douleur</div>
                </div>
              )}
              {todaySymptoms.stress_level && (
                <div className="text-center">
                  <div className={`font-semibold ${getSymptomColor(todaySymptoms.stress_level)}`}>
                    {todaySymptoms.stress_level}/5
                  </div>
                  <div className="text-gray-600">Stress</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Repas récents */}
        {recentMeals.length > 0 && (
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Repas récents</h4>
            <div className="space-y-2">
              {recentMeals.slice(0, 3).map((meal, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    {meal.recipes?.title || 'Repas inconnu'}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(meal.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats de la semaine */}
        {weeklyStats && weeklyStats.totalRecipesMade > 0 && (
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Cette semaine</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-purple-600">{weeklyStats.totalRecipesMade}</div>
                <div className="text-gray-600">Repas trackés</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{weeklyStats.favoriteRate}%</div>
                <div className="text-gray-600">Favoris</div>
              </div>
            </div>
          </div>
        )}

        {/* Message d'encouragement */}
        {(!recentMeals.length && !todaySymptoms) && (
          <div className="text-center py-6 text-gray-500">
            <div className="text-4xl mb-2">🌟</div>
            <p className="text-sm">
              Commence ton suivi quotidien pour voir ton activité !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySummary;
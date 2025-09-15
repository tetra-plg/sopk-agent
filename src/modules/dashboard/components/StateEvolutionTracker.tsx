/**
 * 📖 Tracker d'évolution du journal
 *
 * Permet de visualiser et tracker l'évolution du journal quotidien
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { symptomsService } from '../../cycle/services/symptomsService';
import MiniChart from '../../../shared/components/MiniChart';

const StateEvolutionTracker = () => {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<Array<{date: string, day: string, journalEntry: any}>>([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any>({});

  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];

          const { data } = await symptomsService.getDailyEntry(user.id, dateString);
          days.push({
            date: dateString,
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            journalEntry: data
          });
        }

        setWeekData(days);

        // Calculer les tendances et stats
        const validDays = days.filter(d => d.journalEntry);
        const completedDays = validDays.length;
        const totalDays = 7;
        const completionRate = Math.round((completedDays / totalDays) * 100);

        if (validDays.length >= 2) {
          const first = validDays[0].journalEntry;
          const last = validDays[validDays.length - 1].journalEntry;

          setTrends({
            fatigue: getTrend(first.fatigue_level, last.fatigue_level),
            pain: getTrend(first.pain_level, last.pain_level),
            stress: getTrend(first.stress_level, last.stress_level),
            mood: getTrend(first.mood_level, last.mood_level),
            completionRate,
            completedDays,
            totalDays
          });
        } else {
          setTrends({
            completionRate,
            completedDays,
            totalDays
          });
        }
      } catch (error) {
        console.error('Error loading weekly data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyData();
  }, [user?.id]);

  const getTrend = (first, last) => {
    if (!first || !last) return 'stable';
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'stable';
  };

  const _getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend, isPositiveMetric = false) => {
    const positive = isPositiveMetric;
    switch (trend) {
      case 'up': return positive ? 'text-green-600' : 'text-red-600';
      case 'down': return positive ? 'text-red-600' : 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSymptomColor = (level, isPositiveMetric = false) => {
    if (!level || level <= 0) return 'text-gray-400';
    const positive = isPositiveMetric;

    if (level <= 1) return positive ? 'text-red-600' : 'text-green-600';
    if (level <= 2) return positive ? 'text-orange-600' : 'text-yellow-600';
    if (level <= 3) return positive ? 'text-yellow-600' : 'text-orange-600';
    if (level <= 4) return positive ? 'text-green-600' : 'text-red-600';
    return positive ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        📖 Mon journal cette semaine
      </h3>

      {/* Stats de suivi */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Suivi cette semaine</div>
            <div className="text-2xl font-bold text-purple-600">
              {trends.completedDays || 0}/{trends.totalDays || 7} jours
            </div>
            <div className="text-sm text-gray-500">
              {trends.completionRate || 0}% de régularité
            </div>
          </div>
          <div className="text-4xl">
            {(trends.completionRate || 0) >= 80 ? '🏆' : (trends.completionRate || 0) >= 60 ? '🌟' : (trends.completionRate || 0) >= 40 ? '💪' : '📝'}
          </div>
        </div>
      </div>

      {/* Évolution graphique des symptômes */}
      {weekData.length > 2 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Évolution sur 7 jours</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">😴 Fatigue</span>
                <div className={`text-xs font-medium ${getTrendColor(trends.fatigue)}`}>
                  {trends.fatigue === 'down' ? '↓' : trends.fatigue === 'up' ? '↑' : '→'}
                </div>
              </div>
              <MiniChart
                data={weekData.map(d => d.journalEntry?.fatigue_level)}
                color="#3B82F6"
                width={70}
                height={25}
              />
            </div>

            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">😣 Douleur</span>
                <div className={`text-xs font-medium ${getTrendColor(trends.pain)}`}>
                  {trends.pain === 'down' ? '↓' : trends.pain === 'up' ? '↑' : '→'}
                </div>
              </div>
              <MiniChart
                data={weekData.map(d => d.journalEntry?.pain_level)}
                color="#EF4444"
                width={70}
                height={25}
              />
            </div>

          </div>
        </div>
      )}

      {/* Vue détaillée - 3 derniers jours */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">3 derniers jours</h4>
        {weekData.slice(-3).map((day, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-sm text-gray-700">
                {day.day} • {new Date(day.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
              <div className="text-xs text-gray-500">
                {day.journalEntry ? '✅ Complété' : '⭕ Non complété'}
              </div>
            </div>

            {day.journalEntry ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">😴 Fatigue</span>
                  <span className={`font-medium ${getSymptomColor(day.journalEntry?.fatigue_level)}`}>
                    {day.journalEntry?.fatigue_level || 0}/5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">😣 Douleur</span>
                  <span className={`font-medium ${getSymptomColor(day.journalEntry?.pain_level)}`}>
                    {day.journalEntry?.pain_level || 0}/5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">😰 Stress</span>
                  <span className={`font-medium ${getSymptomColor(day.journalEntry?.stress_level)}`}>
                    {day.journalEntry?.stress_level || 0}/5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">😊 Humeur</span>
                  <span className={`font-medium ${getSymptomColor(day.journalEntry?.mood_level, true)}`}>
                    {day.journalEntry?.mood_level || 0}/5
                  </span>
                </div>
                {day.journalEntry?.period_flow && (
                  <div className="flex items-center justify-between col-span-2">
                    <span className="text-gray-600">🩸 Règles</span>
                    <span className={`font-medium ${getSymptomColor(day.journalEntry?.period_flow)}`}>
                      {day.journalEntry?.period_flow}/5
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-2">
                Journal non complété ce jour
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message si aucune donnée */}
      {weekData.filter(d => d.journalEntry).length === 0 && (
        <div className="text-center py-6 text-gray-500 mt-6">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm">
            Aucune donnée de journal pour le moment.
            <br />
            Remplis ton journal quotidien pour suivre ton évolution !
          </p>
        </div>
      )}
    </div>
  );
};

export default StateEvolutionTracker;
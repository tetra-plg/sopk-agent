/**
 * 🏃‍♀️ Tracker d'Activité Physique
 *
 * Permet de tracker et visualiser les séances d'activité physique complétées
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import activityService from '../../activity/services/activityService';
import MiniChart from '../../../shared/components/MiniChart';

interface WeeklyActivityData {
  date: string;
  day: string;
  sessionCount: number;
  totalMinutes: number;
  avgEnergyImprovement: number;
  avgPainReduction: number;
}

interface ActivityStats {
  totalSessions: number;
  totalMinutes: number;
  avgEnergyImprovement: number;
  avgPainReduction: number;
  favoriteCategory?: string;
  currentStreak: number;
  mostFrequentCategory?: string;
  avgMoodImprovement?: number;
  completionRate?: number;
}

const ActivityTracker = ({ onStartActivity }: { onStartActivity?: () => void }) => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<ActivityStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [todaySession, setTodaySession] = useState(false);

  useEffect(() => {
    const loadActivityData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Charger les stats de la semaine
        const [weekStatsResult, historyResult] = await Promise.all([
          activityService.getUserStats(user.id, 'week'),
          activityService.getUserHistory(user.id, { limit: 5 })
        ]);

        setWeeklyStats(weekStatsResult);
        setRecentSessions(historyResult || []);

        // Vérifier si une session a été faite aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const todaySession = historyResult.some((session: any) =>
          session.date_completed?.startsWith(today)
        );
        setTodaySession(todaySession);

        // Charger les données pour les graphiques (7 derniers jours)
        const weekData: WeeklyActivityData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];

          try {
            const dayHistory = await activityService.getUserHistory(user.id, {
              dateFrom: dateString,
              dateTo: dateString,
              limit: 50
            });

            const completedSessions = dayHistory.filter((s: any) => s.completion_percentage >= 100);
            const sessionCount = completedSessions.length;
            const totalMinutes = Math.round(
              completedSessions.reduce((sum: number, s: any) => sum + ((s.duration_seconds || 0) / 60), 0)
            );

            // Calculer améliorations moyennes
            const sessionsWithFeedback = completedSessions.filter((s: any) =>
              s.pre_energy_level && s.post_energy_level &&
              s.pre_pain_level && s.post_pain_level
            );

            let avgEnergyImprovement = 0;
            let avgPainReduction = 0;

            if (sessionsWithFeedback.length > 0) {
              avgEnergyImprovement = sessionsWithFeedback.reduce((sum: number, s: any) =>
                sum + (s.post_energy_level - s.pre_energy_level), 0) / sessionsWithFeedback.length;

              avgPainReduction = sessionsWithFeedback.reduce((sum: number, s: any) =>
                sum + (s.pre_pain_level - s.post_pain_level), 0) / sessionsWithFeedback.length;
            }

            weekData.push({
              date: dateString,
              day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
              sessionCount,
              totalMinutes,
              avgEnergyImprovement: Math.round(avgEnergyImprovement * 10) / 10,
              avgPainReduction: Math.round(avgPainReduction * 10) / 10
            });
          } catch {
            // Ajouter un jour vide en cas d'erreur
            weekData.push({
              date: dateString,
              day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
              sessionCount: 0,
              totalMinutes: 0,
              avgEnergyImprovement: 0,
              avgPainReduction: 0
            });
          }
        }

        setWeeklyData(weekData);
      } catch (error) {
        console.error('Error loading activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivityData();
  }, [user?.id]);

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'yoga_doux': '🧘‍♀️',
      'etirements': '🤸‍♀️',
      'cardio_leger': '🚶‍♀️',
      'renforcement': '💪'
    };
    return emojiMap[category] || '🏃‍♀️';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return '↗️';
    if (current < previous) return '↘️';
    return '➡️';
  };

  const getWeeklyTrend = () => {
    if (weeklyData.length < 2) return 'stable';
    const firstHalf = weeklyData.slice(0, 3);
    const secondHalf = weeklyData.slice(-3);

    const firstAvg = firstHalf.reduce((sum, day) => sum + day.sessionCount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.sessionCount, 0) / secondHalf.length;

    if (secondAvg > firstAvg) return 'up';
    if (secondAvg < firstAvg) return 'down';
    return 'stable';
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
    <div className="card-activite rounded-xl p-6 shadow-sm h-full min-h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🏃‍♀️ Mon activité physique
      </h3>

      {/* Suivi du jour */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-700">Aujourd'hui</h4>
          <div className="text-sm text-gray-600">
            {todaySession ? '✅ Séance faite' : '⭕ Pas encore d\'activité'}
          </div>
        </div>

        <div className={`p-4 rounded-lg transition-all ${
          todaySession
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
            : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Objectif quotidien</div>
              <div className={`text-2xl font-bold ${todaySession ? 'text-green-600' : 'text-gray-400'}`}>
                {todaySession ? '1/1' : '0/1'} séance
              </div>
              <div className="text-sm text-gray-500">
                {todaySession ? 'Bravo ! Objectif atteint' : 'Une séance pour ta santé'}
              </div>
            </div>
            <div className="text-4xl">
              {todaySession ? '🏆' : '🎯'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats de la semaine avec graphiques */}
      {weeklyStats && weeklyStats.totalSessions > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Cette semaine</h4>

          {/* Stats principales */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{weeklyStats.totalSessions}</div>
              <div className="text-xs text-gray-600">Séances</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{weeklyStats.totalMinutes}min</div>
              <div className="text-xs text-gray-600">Temps total</div>
            </div>
          </div>

          {/* Mini graphiques d'évolution */}
          {weeklyData.length > 2 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">⚡ Énergie</span>
                  <div className="text-xs font-medium text-green-600">
                    {getTrendIcon(
                      weeklyData[weeklyData.length - 1]?.avgEnergyImprovement || 0,
                      weeklyData[0]?.avgEnergyImprovement || 0
                    )}
                  </div>
                </div>
                <MiniChart
                  data={weeklyData.map(d => Math.max(0, d.avgEnergyImprovement + 2))} // +2 pour éviter les valeurs négatives
                  color="#10B981"
                  width={70}
                  height={25}
                />
              </div>

              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">🩹 Douleur</span>
                  <div className="text-xs font-medium text-red-600">
                    {getTrendIcon(
                      weeklyData[0]?.avgPainReduction || 0,
                      weeklyData[weeklyData.length - 1]?.avgPainReduction || 0
                    )}
                  </div>
                </div>
                <MiniChart
                  data={weeklyData.map(d => Math.max(0, d.avgPainReduction))}
                  color="#EF4444"
                  width={70}
                  height={25}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Séances récentes */}
      {recentSessions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Dernières séances</h4>
          <div className="space-y-2">
            {recentSessions.slice(0, 3).map((session: any, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getCategoryEmoji(session.activity_sessions?.category)}
                  </span>
                  <div>
                    <div className="font-medium text-sm truncate max-w-32">
                      {session.activity_sessions?.title || 'Séance inconnue'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((session.duration_seconds || 0) / 60)}min • {session.completion_percentage}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(session.date_completed).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  {session.post_energy_level && session.pre_energy_level && (
                    <div className="text-xs">
                      <span className={`${
                        session.post_energy_level > session.pre_energy_level
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        ⚡ +{session.post_energy_level - session.pre_energy_level}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-grow"></div>

      {/* Message d'encouragement si pas de données */}
      {(!weeklyStats || weeklyStats.totalSessions === 0) && recentSessions.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <div className="text-4xl mb-2">🏃‍♀️</div>
          <p className="text-sm">
            Aucune activité physique pour le moment.
            <br />
            Commence ta première séance pour améliorer ton bien-être !
          </p>
          {onStartActivity && (
            <button
              onClick={onStartActivity}
              className="mt-3 px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600 transition-colors"
            >
              🚀 Commencer une séance
            </button>
          )}
        </div>
      )}

      {/* Encouragement si activité régulière */}
      {weeklyStats && weeklyStats.totalSessions > 0 && getWeeklyTrend() === 'up' && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-lg mb-1">🔥</div>
            <div className="text-sm font-medium text-green-700">
              Super ! Tu es en progression cette semaine
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTracker;
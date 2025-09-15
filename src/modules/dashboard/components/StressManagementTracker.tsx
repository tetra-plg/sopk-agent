/**
 * 🧘 Bloc gestion du stress
 *
 * Permet de tracker et gérer le stress avec des techniques de bien-être
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useBreathingTechniques } from '../../stress/hooks/useBreathingTechniques';
import moodService from '../../stress/services/moodService';
import MiniChart from '../../../shared/components/MiniChart';

const StressManagementTracker = ({ onStartBreathing }) => {
  const { user } = useAuth();
  const { techniques, loading: techniquesLoading } = useBreathingTechniques();
  const [recentSessions, setRecentSessions] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [_todayMood, _setTodayMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moodWeekData, setMoodWeekData] = useState<Array<{date: string, mood: number, stress: number}>>([]);

  useEffect(() => {
    const loadStressData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Charger les sessions récentes de respiration
        // const sessionsResult = await breathingService.getRecentSessions(user.id, 5);
        // setRecentSessions(sessionsResult.data || []);

        // Charger les stats de la semaine
        // const statsResult = await breathingService.getWeeklyStats(user.id);
        // setWeeklyStats(statsResult.data);

        // Charger l'humeur du jour
        const today = new Date().toISOString().split('T')[0];
        const moodResult = await moodService.getMoodEntry(user.id, today);
        _setTodayMood(moodResult.data);

        // Simuler des données pour le moment
        setRecentSessions([
          { technique_name: 'Respiration rapide', duration: 300, created_at: new Date().toISOString(), stress_before: 4, stress_after: 2 },
          { technique_name: 'Méditation guidée', duration: 600, created_at: new Date(Date.now() - 86400000).toISOString(), stress_before: 3, stress_after: 1 }
        ]);

        setWeeklyStats({
          totalSessions: 5,
          totalMinutes: 45,
          averageStressReduction: 2.1,
          streakDays: 3
        });

        // Charger les données d'humeur pour les graphiques (7 derniers jours)
        const moodData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];

          try {
            const moodResult = await moodService.getMoodEntry(user.id, dateString);
            moodData.push({
              date: dateString,
              mood: moodResult.data?.mood_score || 0,
              stress: Math.random() * 5 // Simulé pour l'instant
            });
          } catch {
            moodData.push({
              date: dateString,
              mood: Math.random() * 5,
              stress: Math.random() * 5
            });
          }
        }
        setMoodWeekData(moodData);

      } catch (error) {
        console.error('Error loading stress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStressData();
  }, [user?.id]);

  const getQuickTechnique = () => {
    if (techniquesLoading || !techniques.length) return null;
    return techniques.find(t => t.id === 'quick') || techniques[0];
  };

  const _getMoodEmoji = (level) => {
    if (!level) return '😐';
    if (level <= 2) return '😢';
    if (level <= 3) return '😐';
    if (level <= 4) return '🙂';
    return '😊';
  };

  const getStressColor = (level) => {
    if (!level || level <= 1) return 'text-green-600';
    if (level <= 2) return 'text-yellow-600';
    if (level <= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-44 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const quickTechnique = getQuickTechnique();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🧘 Gestion du stress
      </h3>

      {/* Stats de la semaine */}
      {weeklyStats && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Cette semaine</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{weeklyStats.totalSessions}</div>
              <div className="text-xs text-gray-600">Sessions</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{weeklyStats.totalMinutes}</div>
              <div className="text-xs text-gray-600">Minutes</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{weeklyStats.averageStressReduction}</div>
              <div className="text-xs text-gray-600">Réduction stress</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{weeklyStats.streakDays}</div>
              <div className="text-xs text-gray-600">Jours consécutifs</div>
            </div>
          </div>
        </div>
      )}

      {/* Évolution graphique humeur/stress */}
      {moodWeekData.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Évolution sur 7 jours</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">😊 Humeur moyenne</span>
                <div className="text-xs text-gray-500">
                  {Math.round(moodWeekData.reduce((sum, d) => sum + d.mood, 0) / moodWeekData.filter(d => d.mood > 0).length * 10) / 10}/5
                </div>
              </div>
              <MiniChart
                data={moodWeekData.map(d => d.mood)}
                color="#10B981"
                width={90}
                height={30}
              />
            </div>

            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">😰 Niveau stress</span>
                <div className="text-xs text-gray-500">
                  {Math.round(moodWeekData.reduce((sum, d) => sum + d.stress, 0) / moodWeekData.length * 10) / 10}/5
                </div>
              </div>
              <MiniChart
                data={moodWeekData.map(d => d.stress)}
                color="#EF4444"
                width={90}
                height={30}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sessions récentes */}
      {recentSessions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Dernières sessions</h4>
          <div className="space-y-2">
            {recentSessions.slice(0, 3).map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{session.technique_name}</div>
                  <div className="text-xs text-gray-500">
                    {Math.floor(session.duration / 60)} minutes • {' '}
                    {new Date(session.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <span className={getStressColor(session.stress_before)}>{session.stress_before}</span>
                    <span className="text-gray-400">→</span>
                    <span className={getStressColor(session.stress_after)}>{session.stress_after}</span>
                  </div>
                  <div className="text-xs text-gray-500">Stress</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message d'encouragement si pas de données */}
      {!weeklyStats && recentSessions.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <div className="text-4xl mb-2">🧘‍♀️</div>
          <p className="text-sm mb-3">
            Commence ta première session pour gérer ton stress !
          </p>
          {quickTechnique && (
            <button
              onClick={() => onStartBreathing && onStartBreathing()}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition-colors"
            >
              🚀 Ma première session
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StressManagementTracker;
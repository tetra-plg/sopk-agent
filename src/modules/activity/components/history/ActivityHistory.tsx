/**
 * 📈 ActivityHistory - Historique des séances d'activité
 *
 * Affichage de l'historique des séances complétées avec statistiques et détails.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../core/auth/AuthContext';
import activityService from '../../services/activityService';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

const ActivityHistory = ({ onBack }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'

  // Charger l'historique et les statistiques
  useEffect(() => {
    if (!user?.id) return;

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        // Définir la période de filtre
        let dateFrom = null;
        if (filter === 'week') {
          dateFrom = new Date();
          dateFrom.setDate(dateFrom.getDate() - 7);
        } else if (filter === 'month') {
          dateFrom = new Date();
          dateFrom.setMonth(dateFrom.getMonth() - 1);
        }

        const [historyData, statsData] = await Promise.all([
          activityService.getUserHistory(user.id, {
            status: 'completed',
            dateFrom: dateFrom?.toISOString(),
            limit: 50
          }),
          activityService.getUserStats(user.id, filter === 'all' ? 'month' : filter)
        ]);

        setHistory(historyData);
        setStats(statsData);
      } catch {
        // Erreur de chargement de l'historique
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user?.id, filter]);

  // Helper pour formater la durée
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}min ${remainingSeconds > 0 ? remainingSeconds + 's' : ''}`;
    }
    return `${remainingSeconds}s`;
  };

  // Helper pour calculer l'amélioration
  const getImprovement = (pre, post, isReversed = false) => {
    if (!pre || !post) return null;
    const diff = isReversed ? pre - post : post - pre;
    return diff;
  };

  // Helper pour obtenir l'emoji de catégorie
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'yoga_doux': '🧘‍♀️',
      'etirements': '🤸‍♀️',
      'cardio_leger': '🚶‍♀️',
      'renforcement': '💪'
    };
    return emojiMap[category] || '🏃‍♀️';
  };

  // Helper pour obtenir la couleur de la catégorie
  const getCategoryColor = (category) => {
    const colorMap = {
      'yoga_doux': '#A78BFA',
      'etirements': '#6EE7B7',
      'cardio_leger': '#93C5FD',
      'renforcement': '#FB7185'
    };
    return colorMap[category] || '#6B7280';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <LoadingSpinner size="large" message="Chargement de l'historique..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {onBack && (
            <div className="flex items-center mb-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.target.style.color = '#1F2937'}
                onMouseLeave={(e) => e.target.style.color = '#6B7280'}
              >
                <span>←</span>
                <span>Retour</span>
              </button>
            </div>
          )}

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
              📈 Historique d'Activité
            </h1>
            <p style={{ color: '#6B7280' }}>
              Suivi de tes progrès et séances complétées
            </p>
          </div>

          {/* Filtres de période */}
          <div className="flex justify-center gap-3 mb-6">
            {[
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois' },
              { value: 'all', label: 'Tout l\'historique' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: filter === option.value ? '#A78BFA' : 'rgba(167, 139, 250, 0.1)',
                  color: filter === option.value ? 'white' : '#A78BFA',
                  border: `1px solid ${filter === option.value ? '#A78BFA' : 'rgba(167, 139, 250, 0.3)'}`
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Statistiques récapitulatives */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}>
                <div className="text-2xl font-bold" style={{ color: '#A78BFA' }}>
                  {stats.totalSessions}
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  Séances
                </div>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(147, 197, 253, 0.1)' }}>
                <div className="text-2xl font-bold" style={{ color: '#93C5FD' }}>
                  {Math.round(stats.totalMinutes)}min
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  Temps total
                </div>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
                <div className="text-2xl font-bold" style={{ color: '#6EE7B7' }}>
                  {stats.avgEnergyImprovement > 0 ? '+' : ''}{stats.avgEnergyImprovement.toFixed(1)}
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  Énergie moy.
                </div>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)' }}>
                <div className="text-2xl font-bold" style={{ color: '#FB7185' }}>
                  -{stats.avgPainReduction.toFixed(1)}
                </div>
                <div className="text-sm" style={{ color: '#6B7280' }}>
                  Douleur moy.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste de l'historique */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry) => {
              const energyImprovement = getImprovement(entry.pre_energy_level, entry.post_energy_level);
              const painReduction = getImprovement(entry.pre_pain_level, entry.post_pain_level, true);
              const moodImprovement = getImprovement(entry.pre_mood_score, entry.post_mood_score);

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl p-6 transition-all hover:shadow-lg"
                  style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                >
                  {/* En-tête de la séance */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${getCategoryColor(entry.activity_sessions?.category)}20` }}
                    >
                      {getCategoryEmoji(entry.activity_sessions?.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1" style={{ color: '#1F2937' }}>
                        {entry.activity_sessions?.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: '#6B7280' }}>
                        <span>
                          📅 {new Date(entry.completed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>⏱️ {formatDuration(entry.duration_seconds || 0)}</span>
                        <span>✅ {entry.completion_percentage}%</span>
                        {entry.difficulty_felt && (
                          <span>
                            🎯 Difficulté: {entry.difficulty_felt}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Améliorations */}
                  {(energyImprovement !== null || painReduction !== null || moodImprovement !== null) && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                      {energyImprovement !== null && (
                        <div className="text-center">
                          <div className={`text-lg font-bold ${energyImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {energyImprovement > 0 ? '+' : ''}{energyImprovement}
                          </div>
                          <div className="text-xs" style={{ color: '#6B7280' }}>
                            ⚡ Énergie
                          </div>
                        </div>
                      )}

                      {painReduction !== null && (
                        <div className="text-center">
                          <div className={`text-lg font-bold ${painReduction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {painReduction > 0 ? '-' : '+'}{Math.abs(painReduction)}
                          </div>
                          <div className="text-xs" style={{ color: '#6B7280' }}>
                            🩹 Douleur
                          </div>
                        </div>
                      )}

                      {moodImprovement !== null && (
                        <div className="text-center">
                          <div className={`text-lg font-bold ${moodImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {moodImprovement > 0 ? '+' : ''}{moodImprovement}
                          </div>
                          <div className="text-xs" style={{ color: '#6B7280' }}>
                            😊 Humeur
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes de session */}
                  {entry.session_notes && (
                    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(167, 139, 250, 0.05)' }}>
                      <h4 className="text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
                        💭 Notes personnelles
                      </h4>
                      <p className="text-sm italic" style={{ color: '#6B7280' }}>
                        "{entry.session_notes}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Message si pas d'historique
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#1F2937' }}>
              Aucune séance terminée
            </h3>
            <p className="max-w-md mx-auto mb-6" style={{ color: '#6B7280' }}>
              Commence ta première séance d'activité pour voir tes progrès ici.
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl font-semibold transition-colors"
                style={{ backgroundColor: '#A78BFA', color: 'white' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#9333EA'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#A78BFA'}
              >
                🏃‍♀️ Commencer une séance
              </button>
            )}
          </div>
        )}

        {/* Footer spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ActivityHistory;
/**
 * 📚 SessionCatalog - Catalogue des sessions d'activité physique
 *
 * Interface principale pour explorer et sélectionner les séances d'activité.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../core/auth/AuthContext';
import activityService from '../../services/activityService';
import SessionCard from './SessionCard';
import CategoryFilter from './CategoryFilter';
import LoadingSpinner from '../../../../shared/components/ui/LoadingSpinner';

const SessionCatalog = ({ onSessionSelect, onViewHistory }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    maxDuration: 'all'
  });

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const [sessionsData, recommendationsData, statsData] = await Promise.all([
          activityService.getSessions(),
          activityService.getPersonalizedRecommendations(user.id),
          activityService.getUserStats(user.id, 'week')
        ]);

        setSessions(sessionsData);
        setFilteredSessions(sessionsData);
        setRecommendations(recommendationsData);
        setUserStats(statsData);
      } catch {
        // Ignorer les erreurs de chargement
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.id]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...sessions];

    if (filters.category !== 'all') {
      filtered = filtered.filter(session => session.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      // Mapper les valeurs de difficulté
      const difficultyMap = {
        '1': 'beginner',
        '2': 'easy',
        '3': 'medium',
        '4': 'advanced'
      };
      const targetDifficulty = difficultyMap[filters.difficulty] || filters.difficulty;
      filtered = filtered.filter(session => session.difficulty === targetDifficulty);
    }

    if (filters.maxDuration !== 'all') {
      const maxDuration = parseInt(filters.maxDuration);
      filtered = filtered.filter(session => session.duration_minutes <= maxDuration);
    }

    setFilteredSessions(filtered);
  }, [sessions, filters]);

  // Gestionnaire de changement de filtre
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Gestionnaire de sélection de session
  const handleSessionClick = (session) => {
    if (onSessionSelect) {
      onSessionSelect(session);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <LoadingSpinner size="large" message="Chargement des séances..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-4xl mx-auto px-3 lg:px-4 py-4 lg:py-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex-1 text-center">
              <h1 className="text-lg lg:text-3xl font-bold mb-1 lg:mb-2" style={{ color: '#1F2937' }}>
                🏃‍♀️ Activité Physique
              </h1>
              <p className="text-xs lg:text-base" style={{ color: '#6B7280' }}>
                Séances adaptées au SOPK pour bouger en douceur et retrouver de l'énergie
              </p>
            </div>

            {/* Bouton historique */}
            {onViewHistory && userStats && userStats.totalSessions > 0 && (
              <div className="flex-shrink-0">
                <button
                  onClick={onViewHistory}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium text-xs lg:text-sm transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(147, 197, 253, 0.1)',
                    color: '#93C5FD',
                    border: '1px solid #93C5FD'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#93C5FD';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(147, 197, 253, 0.1)';
                    e.target.style.color = '#93C5FD';
                  }}
                >
                  📈 Historique
                </button>
              </div>
            )}
          </div>

          {/* Stats rapides */}
          {userStats && userStats.totalSessions > 0 && (
            <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="text-center p-2 lg:p-3 rounded-lg" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}>
                <div className="text-base lg:text-lg font-bold" style={{ color: '#A78BFA' }}>
                  {userStats.totalSessions}
                </div>
                <div className="text-xs" style={{ color: '#6B7280' }}>
                  Séances cette semaine
                </div>
              </div>
              <div className="text-center p-2 lg:p-3 rounded-lg" style={{ backgroundColor: 'rgba(147, 197, 253, 0.1)' }}>
                <div className="text-base lg:text-lg font-bold" style={{ color: '#93C5FD' }}>
                  {Math.round(userStats.totalMinutes)}min
                </div>
                <div className="text-xs" style={{ color: '#6B7280' }}>
                  Temps d'activité
                </div>
              </div>
              <div className="text-center p-2 lg:p-3 rounded-lg" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
                <div className="text-base lg:text-lg font-bold" style={{ color: '#6EE7B7' }}>
                  {userStats.avgEnergyImprovement > 0 ? '+' : ''}{userStats.avgEnergyImprovement.toFixed(1)}
                </div>
                <div className="text-xs" style={{ color: '#6B7280' }}>
                  Niveau d'énergie
                </div>
              </div>
            </div>
          )}

          {/* Filtres */}
          <CategoryFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Recommandations personnalisées */}
        {recommendations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1F2937' }}>
              💫 Recommandées pour toi
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.slice(0, 2).map((session) => (
                <SessionCard
                  key={`rec-${session.id}`}
                  session={session}
                  isRecommended={true}
                  onClick={() => handleSessionClick(session)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Toutes les sessions */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#1F2937' }}>
            {filters.category !== 'all' || filters.difficulty !== 'all' || filters.maxDuration !== 'all'
              ? `📚 Sessions filtrées (${filteredSessions.length})`
              : `📚 Toutes les sessions (${filteredSessions.length})`
            }
          </h2>

          {filteredSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => handleSessionClick(session)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#1F2937' }}>
                Aucune session trouvée
              </h3>
              <p className="max-w-md mx-auto mb-4" style={{ color: '#6B7280' }}>
                Essaie d'ajuster tes filtres pour voir plus de séances disponibles.
              </p>
              <button
                onClick={() => setFilters({ category: 'all', difficulty: 'all', maxDuration: 'all' })}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#A78BFA', color: 'white' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#9333EA'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#A78BFA'}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

        {/* Message d'encouragement pour nouveau utilisateur */}
        {userStats && userStats.totalSessions === 0 && (
          <section className="mt-8 text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#1F2937' }}>
              Prête à commencer ton parcours bien-être ?
            </h3>
            <p className="max-w-md mx-auto" style={{ color: '#6B7280' }}>
              Commence par une séance courte et douce. L'activité physique adaptée
              peut vraiment t'aider à gérer les symptômes du SOPK.
            </p>
          </section>
        )}

        {/* Footer spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default SessionCatalog;
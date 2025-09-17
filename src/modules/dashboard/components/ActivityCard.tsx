/**
 * 🏃‍♀️ Carte Activité Physique - Accès rapide aux sessions
 *
 * Affiche une session d'activité recommandée avec possibilité de démarrage
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import activityService from '../../activity/services/activityService';

interface ActivitySession {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sopk_benefits?: string[];
}

interface ActivityCardProps {
  onNavigate: (route: string) => void;
}

const ActivityCard = ({ onNavigate }: ActivityCardProps) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ActivitySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await activityService.getPersonalizedRecommendations(user.id);
        setRecommendations(data);
      } catch (error) {
        console.error('Erreur lors du chargement des recommandations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user?.id]);

  const recommendedSession = recommendations[0];

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'yoga_doux': '🧘‍♀️',
      'etirements': '🤸‍♀️',
      'cardio_leger': '🚶‍♀️',
      'renforcement': '💪'
    };
    return emojiMap[category] || '🏃‍♀️';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      'beginner': '#10B981',
      'intermediate': '#F59E0B',
      'advanced': '#EF4444'
    };
    return colorMap[difficulty] || '#6B7280';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labelMap: { [key: string]: string } = {
      'beginner': 'Débutant',
      'intermediate': 'Intermédiaire',
      'advanced': 'Avancé'
    };
    return labelMap[difficulty] || 'Inconnu';
  };

  return (
    <div className="card-activite p-4 md:p-6 transform hover:scale-105 transition-transform duration-200 flex flex-col h-full min-h-[320px]">
      <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--color-accent-corail)' }}>
        🏃‍♀️ Activité du jour
      </h3>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        </div>
      ) : recommendedSession ? (
        <>
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">
                {getCategoryEmoji(recommendedSession.category)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1" style={{ color: 'var(--color-text-principal)' }}>
                  {recommendedSession.title}
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondaire)' }}>
                  {recommendedSession.duration_minutes} min • {getDifficultyLabel(recommendedSession.difficulty)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <span className="badge-corail">⚡ {recommendedSession.duration_minutes} min</span>
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${getDifficultyColor(recommendedSession.difficulty)}20`,
                  color: getDifficultyColor(recommendedSession.difficulty)
                }}
              >
                🎯 {getDifficultyLabel(recommendedSession.difficulty)}
              </span>
            </div>

            {recommendedSession.sopk_benefits && recommendedSession.sopk_benefits.length > 0 && (
              <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)' }}>
                <p className="text-xs" style={{ color: 'var(--color-accent-corail)' }}>
                  ✨ {recommendedSession.sopk_benefits.slice(0, 2).join(' • ')}
                </p>
              </div>
            )}
          </div>

          <div className="flex-grow"></div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate(`/activity/session/${recommendedSession.id}`)}
              className="w-full btn-accent-corail"
            >
              🚀 Commencer la séance
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">🌟</div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
              Prête pour bouger ?
            </h4>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondaire)' }}>
              Découvre des exercices adaptés au SOPK pour améliorer ton bien-être.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/activity')}
            className="w-full btn-accent-corail"
          >
            🔍 Découvrir les activités
          </button>
        </>
      )}
    </div>
  );
};

export default ActivityCard;
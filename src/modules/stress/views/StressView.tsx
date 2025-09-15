import { useState, useEffect } from 'react';
import BreathingExercisesView from './BreathingExercisesView';
import MoodJournalView from './MoodJournalView';
import { useMoodJournal } from '../hooks/useMoodJournal';
import { useAuth } from '../../../core/auth/AuthContext';
import moodService from '../services/moodService';

const StressView = () => {
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'breathing', 'mood'
  const [selectedTechniqueId, setSelectedTechniqueId] = useState(null);
  const { user } = useAuth();

  // Hook pour récupérer l'humeur du jour
  const { moodData, isLoading: moodLoading } = useMoodJournal(new Date());

  // État pour les statistiques hebdomadaires
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [_, setStatsLoading] = useState(false);

  // Vérifier si une humeur existe pour aujourd'hui
  const hasTodayMood = moodData && moodData.mood_emoji;

  // Charger les statistiques hebdomadaires
  useEffect(() => {
    if (!user?.id || !hasTodayMood) return;

    const loadWeeklyStats = async () => {
      setStatsLoading(true);
      try {
        const stats = await moodService.getMoodStats(user.id, 'week');
        setWeeklyStats(stats);
      } catch (error) {

      } finally {
        setStatsLoading(false);
      }
    };

    loadWeeklyStats();
  }, [user?.id, hasTodayMood]);

  // Helper pour convertir l'émotion en emoji
  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      'very_sad': '😢',
      'sad': '😞',
      'neutral': '😐',
      'happy': '😊',
      'very_happy': '😄'
    };
    return emojiMap[emotion] || '😐';
  };

  // Helper pour convertir l'émotion en texte français
  const getEmotionText = (emotion) => {
    const textMap = {
      'very_sad': 'Très triste',
      'sad': 'Triste',
      'neutral': 'Neutre',
      'happy': 'Heureux/se',
      'very_happy': 'Très heureux/se'
    };
    return textMap[emotion] || 'Non défini';
  };

  // Vue d'ensemble simplifiée - focus sur exercices de respiration uniquement
  const OverviewView = () => (
    <div className="p-3 lg:p-6 max-w-4xl mx-auto" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <header className="text-center mb-4 lg:mb-8">
        <h1 className="text-lg lg:text-3xl font-bold mb-1 lg:mb-2" style={{ color: '#1F2937' }}>
          🌬️ Exercices de Respiration
        </h1>
        <p className="text-xs lg:text-base" style={{ color: '#6B7280' }}>
          Techniques de respiration guidée pour gérer le stress lié au SOPK
        </p>
      </header>

      <div className="space-y-4 lg:space-y-6">
        {/* Journal d'Humeur */}
        <section className="bg-white rounded-xl p-4 lg:p-6" style={{
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '2px solid #A78BFA'
        }}>
          {moodLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#A78BFA' }}></div>
              <p style={{ color: '#6B7280' }}>Chargement de votre humeur...</p>
            </div>
          ) : hasTodayMood ? (
            // Affichage de l'humeur existante avec statistiques
            <div>
              {/* En-tête principal */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="text-5xl">{getEmotionEmoji(moodData.mood_emoji)}</span>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold" style={{ color: '#1F2937' }}>
                      {getEmotionText(moodData.mood_emoji)}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-lg font-semibold" style={{ color: '#A78BFA' }}>
                        {moodData.mood_score}/10
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{
                        backgroundColor: moodData.mood_score >= 7 ? 'rgba(110, 231, 183, 0.2)' :
                                       moodData.mood_score >= 5 ? 'rgba(147, 197, 253, 0.2)' :
                                       'rgba(251, 113, 133, 0.2)',
                        color: moodData.mood_score >= 7 ? '#6EE7B7' :
                               moodData.mood_score >= 5 ? '#93C5FD' : '#FB7185'
                      }}>
                        {moodData.mood_score >= 7 ? 'Bonne humeur' :
                         moodData.mood_score >= 5 ? 'Humeur neutre' : 'Humeur difficile'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm" style={{ color: '#6B7280' }}>
                  📅 Votre humeur d'aujourd'hui • {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>

              {/* Statistiques hebdomadaires */}
              {weeklyStats && weeklyStats.totalEntries > 1 && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(167, 139, 250, 0.05)' }}>
                  <h4 className="text-sm font-medium mb-3 text-center" style={{ color: '#1F2937' }}>
                    📊 Cette semaine
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold" style={{ color: '#A78BFA' }}>
                        {weeklyStats.avgMood.toFixed(1)}/10
                      </div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>
                        Moyenne
                      </div>
                    </div>
                    <div>
                      <div className="text-lg" style={{ color: '#6EE7B7' }}>
                        {weeklyStats.trendDirection === 'up' ? '📈' :
                         weeklyStats.trendDirection === 'down' ? '📉' : '➡️'}
                      </div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>
                        {weeklyStats.trendDirection === 'up' ? 'En amélioration' :
                         weeklyStats.trendDirection === 'down' ? 'Plus difficile' : 'Stable'}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: '#93C5FD' }}>
                        {weeklyStats.totalEntries}
                      </div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>
                        Entrées
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags émotionnels si présents */}
              {moodData.mood_tags && moodData.mood_tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
                    🏷️ Ressentis du moment
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {moodData.mood_tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(167, 139, 250, 0.1)',
                          color: '#A78BFA',
                          border: '1px solid rgba(167, 139, 250, 0.2)'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes si présentes */}
              {moodData.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
                    💭 Ma note personnelle
                  </h4>
                  <div className="p-3 rounded-lg" style={{
                    backgroundColor: 'rgba(167, 139, 250, 0.05)',
                    border: '1px solid rgba(167, 139, 250, 0.1)'
                  }}>
                    <p className="text-sm italic" style={{ color: '#6B7280' }}>
                      "{moodData.notes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setCurrentView('mood')}
                  className="px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                  style={{
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                    color: '#A78BFA',
                    border: '1px solid #A78BFA'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#A78BFA';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(167, 139, 250, 0.1)';
                    e.target.style.color = '#A78BFA';
                  }}
                >
                  ✏️ Modifier
                </button>

                <button
                  onClick={() => setCurrentView('mood')}
                  className="px-4 py-2 rounded-xl font-medium transition-colors text-sm"
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
                  📊 Voir l'historique
                </button>
              </div>
            </div>
          ) : (
            // Call-to-action initial
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-3" style={{ color: '#1F2937' }}>😊 Comment te sens-tu aujourd'hui ?</h2>
              <p className="mb-4" style={{ color: '#6B7280' }}>
                Prendre conscience de tes émotions t'aide à mieux comprendre
                l'impact du SOPK sur ton bien-être mental.
              </p>
              <button
                onClick={() => setCurrentView('mood')}
                className="px-8 py-3 rounded-xl font-semibold transition-colors"
                style={{ backgroundColor: '#A78BFA', color: 'white' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#9333EA'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#A78BFA'}
              >
                📝 Ouvrir mon journal d'humeur
              </button>
            </div>
          )}
        </section>

        {/* Call-to-action principal */}
        <section className="bg-white rounded-xl p-6" style={{
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '2px solid #93C5FD'
        }}>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#1F2937' }}>🧘 Prête pour une pause respiration ?</h2>
            <p className="mb-4" style={{ color: '#6B7280' }}>
              Quelques minutes d'exercices de respiration peuvent réduire le stress
              et améliorer l'équilibre hormonal lié au SOPK.
            </p>
            <button
              onClick={() => setCurrentView('breathing')}
              className="px-8 py-3 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: '#93C5FD', color: 'white' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#60A5FA'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#93C5FD'}
            >
              🫁 Commencer un exercice
            </button>
          </div>
        </section>

        {/* Bénéfices pour le SOPK */}
        <section className="rounded-xl p-6" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
            🌱 Bénéfices pour le SOPK
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <span style={{ color: '#A78BFA' }}>✓</span>
              <span className="text-sm" style={{ color: '#6B7280' }}>Réduction du cortisol (hormone du stress)</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: '#A78BFA' }}>✓</span>
              <span className="text-sm" style={{ color: '#6B7280' }}>Amélioration de la sensibilité à l'insuline</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: '#A78BFA' }}>✓</span>
              <span className="text-sm" style={{ color: '#6B7280' }}>Équilibrage du système nerveux</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: '#A78BFA' }}>✓</span>
              <span className="text-sm" style={{ color: '#6B7280' }}>Amélioration de la qualité du sommeil</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  // Navigation entre les vues
  if (currentView === 'breathing') {
    return (
      <BreathingExercisesView
        onBack={() => {
          setCurrentView('overview');
          setSelectedTechniqueId(null);
        }}
        initialTechnique={selectedTechniqueId}
      />
    );
  }

  if (currentView === 'mood') {
    return (
      <MoodJournalView
        onBack={() => setCurrentView('overview')}
        onNavigateToBreathing={() => setCurrentView('breathing')}
      />
    );
  }

  return <OverviewView />;
};

export default StressView;
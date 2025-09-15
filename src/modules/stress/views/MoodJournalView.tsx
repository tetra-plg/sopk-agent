/**
 * 😊 MoodJournalView - Vue autonome du journal d'humeur
 *
 * Interface dédiée au tracking émotionnel avec suggestions contextuelles.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useMoodJournal } from '../hooks/useMoodJournal';
import MoodPicker from '../components/mood/MoodPicker';
import moodService from '../services/moodService';
import DateNavigator from '../../../shared/components/DateNavigator';

const MoodJournalView = ({ onBack, onNavigateToBreathing }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [suggestions, setSuggestions] = useState([]);
  const [moodStats, setMoodStats] = useState(null);

  const moodJournal = useMoodJournal(currentDate);

  // Charger les statistiques d'humeur
  useEffect(() => {
    if (!user?.id) return;

    const loadMoodStats = async () => {
      try {
        const stats = await moodService.getMoodStats(user.id, 'week');
        setMoodStats(stats);
      } catch {
        // Erreur lors du chargement des stats
      }
    };

    loadMoodStats();
  }, [user?.id]);

  // Générer suggestions contextuelles
  useEffect(() => {
    const contextualSuggestions = [];

    if (moodJournal.moodData.mood_score && moodJournal.moodData.mood_score <= 4) {
      contextualSuggestions.push({
        type: 'breathing_exercise',
        title: 'Envie de te détendre ?',
        description: '5 minutes de respiration peuvent t\'aider à te sentir mieux',
        action: '/stress', // Navigation vers exercices respiration
        priority: 'high',
        emoji: '🧘‍♀️'
      });
    }

    if (moodJournal.moodData.mood_tags?.includes('stressed')) {
      contextualSuggestions.push({
        type: 'stress_management',
        title: 'Tu sembles stressée',
        description: 'Explore nos techniques anti-stress adaptées au SOPK',
        action: '/stress',
        priority: 'medium',
        emoji: '🌱'
      });
    }

    if (moodJournal.moodData.mood_score >= 7) {
      contextualSuggestions.push({
        type: 'positive_reinforcement',
        title: 'Tu rayonnes aujourd\'hui !',
        description: 'Garde cette énergie positive, tu es sur la bonne voie',
        action: null,
        priority: 'low',
        emoji: '✨'
      });
    }

    setSuggestions(contextualSuggestions);
  }, [moodJournal.moodData]);

  const handleDateChange = async (newDate) => {
    // Sauvegarder les changements actuels avant de changer de date
    if (moodJournal.hasChanges) {
      await moodJournal.forceSave();
    }
    setCurrentDate(newDate);
  };

  const handleNavigateToAction = (action) => {
    if (action === '/stress') {
      // Naviguer vers les exercices de respiration si callback disponible
      if (onNavigateToBreathing) {
        onNavigateToBreathing();
      } else if (onBack) {
        // Sinon retourner à la vue stress principale
        onBack();
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: '#6B7280' }}>
            Veuillez vous connecter pour accéder au journal d'humeur
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
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

          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
              😊 Journal d'Humeur
            </h1>
            <p style={{ color: '#6B7280' }}>
              Prends quelques minutes pour identifier tes émotions
            </p>
          </div>

          <DateNavigator
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />

          {/* Indicateur de sauvegarde */}
          <div className="flex items-center justify-center mt-4 text-sm">
            {moodJournal.isLoading && (
              <div className="flex items-center gap-2" style={{ color: '#A78BFA' }}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Sauvegarde en cours...</span>
              </div>
            )}

            {!moodJournal.isLoading && moodJournal.hasChanges && (
              <div style={{ color: '#FB7185' }}>
                <span>• Modifications non sauvegardées</span>
              </div>
            )}

            {!moodJournal.isLoading && !moodJournal.hasChanges && moodJournal.lastSaved && (
              <div style={{ color: '#6EE7B7' }}>
                <span>✓ Sauvegardé à {moodJournal.lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Statistiques rapides */}
        {moodStats && moodStats.totalEntries > 0 && (
          <div className="mb-6 bg-white rounded-xl p-4" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>
              📊 Cette semaine
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold" style={{ color: '#A78BFA' }}>
                  {moodStats.avgMood}/10
                </div>
                <div className="text-xs" style={{ color: '#6B7280' }}>
                  Humeur moyenne
                </div>
              </div>
              <div>
                <div className="text-xl" style={{ color: '#6EE7B7' }}>
                  {moodStats.trendDirection === 'up' ? '📈' :
                   moodStats.trendDirection === 'down' ? '📉' : '➡️'}
                </div>
                <div className="text-xs" style={{ color: '#6B7280' }}>
                  {moodStats.trendDirection === 'up' ? 'En amélioration' :
                   moodStats.trendDirection === 'down' ? 'Plus difficile' : 'Stable'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mood Picker principal */}
        <MoodPicker
          value={moodJournal.moodData}
          onChange={(field, value) => moodJournal.updateField(field, value)}
          compact={false}
          autoSave={true}
          showTitle={false}
        />

        {/* Suggestions contextuelles */}
        {suggestions.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-medium" style={{ color: '#1F2937' }}>
              💡 Suggestions pour toi
            </h3>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 flex items-start gap-3"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: suggestion.priority === 'high' ? '2px solid #A78BFA' : '1px solid #E5E7EB'
                }}
              >
                <span className="text-2xl">{suggestion.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-medium mb-1" style={{ color: '#1F2937' }}>
                    {suggestion.title}
                  </h4>
                  <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
                    {suggestion.description}
                  </p>
                  {suggestion.action && (
                    <button
                      onClick={() => handleNavigateToAction(suggestion.action)}
                      className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: '#A78BFA',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#9333EA'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#A78BFA'}
                    >
                      Essayer →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message d'encouragement pour première utilisation */}
        {moodJournal.isEmpty && (
          <div className="mt-8 text-center py-8">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#1F2937' }}>
              Commence ton journal d'humeur
            </h3>
            <p className="max-w-md mx-auto" style={{ color: '#6B7280' }}>
              Identifier tes émotions t'aide à mieux comprendre l'impact du SOPK
              sur ton bien-être mental. C'est un pas important vers la guérison.
            </p>
          </div>
        )}

        {/* Footer spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default MoodJournalView;
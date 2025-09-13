import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { symptomsService } from '../services/symptomsService';
import DailyJournalView from './DailyJournalView';

const CycleView = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'journal'
  const [todayEntry, setTodayEntry] = useState(null);
  const [weeklyEntries, setWeeklyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des données d'aujourd'hui et de la semaine
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString().split('T')[0];

        // Charger les données d'aujourd'hui et de la semaine en parallèle
        const [todayResult, weekResult] = await Promise.all([
          symptomsService.getDailyEntry(user.id, today),
          symptomsService.getRecentEntries(user.id, 7)
        ]);

        if (todayResult.error || weekResult.error) {
          throw todayResult.error || weekResult.error;
        }

        setTodayEntry(todayResult.data);
        setWeeklyEntries(weekResult.data || []);
      } catch (err) {
        console.error('Erreur chargement données cycle:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Vérifier si l'entrée d'aujourd'hui est complète
  const isTodayComplete = todayEntry && (
    todayEntry.period_flow !== null ||
    todayEntry.fatigue_level !== null ||
    todayEntry.pain_level !== null ||
    todayEntry.mood_score !== null ||
    todayEntry.notes?.trim()
  );

  // Vue du journal quotidien
  if (currentView === 'journal') {
    return <DailyJournalView onBack={() => setCurrentView('overview')} />;
  }

  // Vue d'entrée du module
  const OverviewView = () => (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📅 Mon Journal Cycle
        </h1>
        <p className="text-gray-600">
          Suivez votre cycle et vos symptômes quotidiens pour mieux comprendre votre SOPK
        </p>
      </header>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos données...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">Erreur lors du chargement des données</p>
          <button
            onClick={() => window.location.reload()}
            className="text-red-600 underline text-sm mt-2"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* État du journal d'aujourd'hui */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {isTodayComplete ? '✅ Journal complété aujourd\'hui' : '📝 Compléter votre journal'}
                </h2>
                <p className="text-gray-600">
                  {isTodayComplete
                    ? 'Merci d\'avoir pris le temps de noter vos ressentis aujourd\'hui.'
                    : 'Prenez quelques minutes pour enregistrer comment vous vous sentez aujourd\'hui.'
                  }
                </p>
              </div>
              <button
                onClick={() => setCurrentView('journal')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isTodayComplete
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {isTodayComplete ? '✏️ Modifier' : '📝 Commencer'}
              </button>
            </div>
          </section>

          {/* Résumé de la semaine */}
          <section>
            <h2 className="text-xl font-semibold mb-4">📊 Cette semaine</h2>

            {weeklyEntries.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-medium text-gray-800 mb-2">Commencez votre suivi</h3>
                <p className="text-gray-600 text-sm">
                  Remplissez votre journal quotidien pour voir apparaître vos statistiques hebdomadaires.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {weeklyEntries.length}
                  </div>
                  <div className="text-sm text-gray-600">Jours renseignés</div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-1">
                    {weeklyEntries.filter(e => e.period_flow && e.period_flow > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Jours de règles</div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {calculateWeeklyAverage(weeklyEntries, 'fatigue_level')}
                  </div>
                  <div className="text-sm text-gray-600">Fatigue moy. /10</div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {calculateWeeklyAverage(weeklyEntries, 'mood_score')}
                  </div>
                  <div className="text-sm text-gray-600">Humeur moy. /10</div>
                </div>
              </div>
            )}
          </section>

          {/* Historique récent */}
          {weeklyEntries.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">📋 Dernières entrées</h2>
              <div className="space-y-3">
                {weeklyEntries.slice(0, 5).map((entry, index) => {
                  const entryDate = new Date(entry.date);
                  const isToday = entry.date === new Date().toISOString().split('T')[0];

                  return (
                    <div key={entry.date} className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-medium ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
                            {isToday ? "Aujourd'hui" : entryDate.toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          {entry.period_flow && entry.period_flow > 0 && (
                            <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                              🔴 Règles
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {entry.mood_score && (
                            <span>😊 {entry.mood_score}/10</span>
                          )}
                          {entry.fatigue_level && (
                            <span>⚡ {entry.fatigue_level}/10</span>
                          )}
                          {entry.pain_level && (
                            <span>⚠️ {entry.pain_level}/10</span>
                          )}
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{entry.notes}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Conseils */}
          <section className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              💡 Pourquoi tenir un journal ?
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-sm text-blue-700">Identifier vos cycles et patterns</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-sm text-blue-700">Mieux communiquer avec votre médecin</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-sm text-blue-700">Anticiper et gérer vos symptômes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-sm text-blue-700">Suivre l'efficacité de vos traitements</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );

  return <OverviewView />;
};

// Fonction utilitaire pour calculer la moyenne hebdomadaire
function calculateWeeklyAverage(entries, field) {
  const validEntries = entries.filter(e => e[field] !== null && e[field] !== undefined);
  if (validEntries.length === 0) return '--';

  const sum = validEntries.reduce((acc, entry) => acc + entry[field], 0);
  return Math.round((sum / validEntries.length) * 10) / 10;
}

export default CycleView;
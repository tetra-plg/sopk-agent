import { useState } from 'react';
import BreathingExercisesView from './BreathingExercisesView';

const StressView = () => {
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'breathing'

  // Vue d'ensemble du module stress
  const OverviewView = () => (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧘 Bien-être & Stress
        </h1>
        <p className="text-gray-600">
          Outils pour gérer le stress et améliorer ton bien-être lié au SOPK
        </p>
      </header>

      <div className="space-y-8">
        {/* État actuel */}
        <section className="bg-gradient-to-r from-primary-lavande/10 to-primary-bleu-ciel/10 rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">Comment te sens-tu ?</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-600">Niveau de stress :</span>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(level => (
                <button
                  key={level}
                  className={`w-6 h-6 rounded ${level <= 6 ? 'bg-primary-lavande' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">6/10</span>
          </div>
          <p className="text-sm text-primary-lavande mb-4">
            💡 Un exercice de respiration pourrait t'aider à te détendre
          </p>
          <button
            onClick={() => setCurrentView('breathing')}
            className="btn-primary px-4 py-2 text-sm"
          >
            🫁 Faire un exercice
          </button>
        </section>

        {/* Accès rapide aux exercices de respiration */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🌬️ Exercices de respiration
            </h2>
            <button
              onClick={() => setCurrentView('breathing')}
              className="text-sm text-primary-lavande hover:text-primary-lavande/80"
            >
              Voir tous →
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: 'coherence',
                name: 'Cohérence cardiaque',
                duration: '5 min',
                description: 'Équilibre ton système nerveux',
                icon: '🔵',
                benefits: 'Anti-stress',
                color: '#4FC3F7'
              },
              {
                id: 'box',
                name: 'Respiration 4-4-4-4',
                duration: '3 min',
                description: 'Pour la concentration',
                icon: '⏹️',
                benefits: 'Focus',
                color: '#81C784'
              },
              {
                id: 'quick',
                name: 'Technique rapide',
                duration: '2 min',
                description: 'Anti-stress express',
                icon: '⚡',
                benefits: 'Urgence',
                color: '#FFB74D'
              }
            ].map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
                    style={{
                      backgroundColor: `${exercise.color}20`,
                      color: exercise.color
                    }}
                  >
                    {exercise.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                  <div className="flex justify-center gap-2 text-sm text-gray-600">
                    <span>⏱️ {exercise.duration}</span>
                    <span>•</span>
                    <span>{exercise.benefits}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mb-4">
                  {exercise.description}
                </p>
                <button
                  onClick={() => setCurrentView('breathing')}
                  className="w-full btn-secondary py-2 text-sm"
                >
                  ▶️ Commencer
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section Journal d'humeur - pour future implémentation */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            😊 Journal d'humeur
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm mb-4">
                Le journal d'humeur sera disponible dans une prochaine version
              </p>
              <p className="text-xs text-gray-400">
                En attendant, utilise les exercices de respiration pour gérer ton stress
              </p>
            </div>
          </div>
        </section>

        {/* Statistiques simplifiées */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📈 Cette semaine</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <div className="text-2xl font-bold text-primary-lavande">0</div>
              <div className="text-sm text-gray-600">Sessions respiration</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <div className="text-2xl font-bold text-accent-vert-sauge">--</div>
              <div className="text-sm text-gray-600">Humeur moyenne</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <div className="text-2xl font-bold text-primary-bleu-ciel">🌱</div>
              <div className="text-sm text-gray-600">Commence aujourd'hui</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  // Navigation entre les vues
  if (currentView === 'breathing') {
    return <BreathingExercisesView onBack={() => setCurrentView('overview')} />;
  }

  return <OverviewView />;
};

export default StressView;
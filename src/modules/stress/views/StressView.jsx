import { useState } from 'react';
import BreathingExercisesView from './BreathingExercisesView';
import { useBreathingTechniques } from '../hooks/useBreathingTechniques';

const StressView = () => {
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'breathing'
  const [selectedTechniqueId, setSelectedTechniqueId] = useState(null);
  const { techniques, loading, error, isReady } = useBreathingTechniques();

  // Vue d'ensemble simplifiée - focus sur exercices de respiration uniquement
  const OverviewView = () => (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🌬️ Exercices de Respiration
        </h1>
        <p className="text-gray-600">
          Techniques de respiration guidée pour gérer le stress lié au SOPK
        </p>
      </header>

      <div className="space-y-8">
        {/* Call-to-action principal */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-3">🧘 Prête pour une pause respiration ?</h2>
          <p className="text-gray-600 mb-4">
            Quelques minutes d'exercices de respiration peuvent réduire le stress
            et améliorer l'équilibre hormonal lié au SOPK.
          </p>
          <button
            onClick={() => setCurrentView('breathing')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            🫁 Commencer un exercice
          </button>
        </section>

        {/* Exercices disponibles */}
        <section>
          <h2 className="text-xl font-semibold mb-6">✨ Techniques disponibles</h2>

          {loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700">Erreur de chargement des techniques</p>
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 underline text-sm mt-2"
              >
                Réessayer
              </button>
            </div>
          )}

          {isReady && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {techniques.map((technique) => (
                <div key={technique.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all">
                  <div className="text-center mb-4">
                    <div
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
                      style={{
                        backgroundColor: `${technique.color}20`,
                        color: technique.color
                      }}
                    >
                      {technique.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{technique.name}</h3>
                    <div className="flex justify-center gap-2 text-sm text-gray-600 mb-2">
                      <span>⏱️ {Math.floor(technique.duration_seconds / 60)} min</span>
                      <span>•</span>
                      <span className="capitalize">{technique.difficulty === 'beginner' ? 'Débutant' : technique.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
                    {technique.description}
                  </p>
                  <div className="mb-4">
                    <p className="text-xs text-green-700 text-center italic">
                      💚 {technique.sopk_benefits}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTechniqueId(technique.id);
                      setCurrentView('breathing');
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    ▶️ Essayer
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && techniques.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌬️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucune technique disponible
              </h3>
              <p className="text-gray-600">
                Les techniques de respiration seront bientôt disponibles.
              </p>
            </div>
          )}
        </section>

        {/* Bénéfices pour le SOPK */}
        <section className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            🌱 Bénéfices pour le SOPK
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-green-700">Réduction du cortisol (hormone du stress)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-green-700">Amélioration de la sensibilité à l'insuline</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-green-700">Équilibrage du système nerveux</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-green-700">Amélioration de la qualité du sommeil</span>
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

  return <OverviewView />;
};

export default StressView;
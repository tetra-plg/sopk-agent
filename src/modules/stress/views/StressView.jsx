import { useState } from 'react';
import BreathingExercisesView from './BreathingExercisesView';
import { useBreathingTechniques } from '../hooks/useBreathingTechniques';

const StressView = () => {
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'breathing'
  const [selectedTechniqueId, setSelectedTechniqueId] = useState(null);
  const { techniques, loading, error, isReady } = useBreathingTechniques();

  // Vue d'ensemble simplifiée - focus sur exercices de respiration uniquement
  const OverviewView = () => (
    <div className="p-6 max-w-4xl mx-auto" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
          🌬️ Exercices de Respiration
        </h1>
        <p style={{ color: '#6B7280' }}>
          Techniques de respiration guidée pour gérer le stress lié au SOPK
        </p>
      </header>

      <div className="space-y-6">
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

        {/* Exercices disponibles */}
        <section>
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#1F2937' }}>✨ Techniques disponibles</h2>

          {loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
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
                <div key={technique.id} className="bg-white rounded-xl p-6 hover:shadow-md transition-all" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
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
                    <h3 className="font-semibold text-lg mb-1" style={{ color: '#1F2937' }}>{technique.name}</h3>
                    <div className="flex justify-center gap-2 text-sm mb-2" style={{ color: '#6B7280' }}>
                      <span>⏱️ {Math.floor(technique.duration_seconds / 60)} min</span>
                      <span>•</span>
                      <span className="capitalize">{technique.difficulty === 'beginner' ? 'Débutant' : technique.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-center mb-4 leading-relaxed" style={{ color: '#6B7280' }}>
                    {technique.description}
                  </p>
                  <div className="mb-4">
                    <p className="text-xs text-center italic" style={{ color: '#6EE7B7' }}>
                      💚 {technique.sopk_benefits}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTechniqueId(technique.id);
                      setCurrentView('breathing');
                    }}
                    className="w-full py-2 rounded-xl font-medium transition-colors"
                    style={{ backgroundColor: '#A78BFA', color: 'white' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#9333EA'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#A78BFA'}
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
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1F2937' }}>
                Aucune technique disponible
              </h3>
              <p style={{ color: '#6B7280' }}>
                Les techniques de respiration seront bientôt disponibles.
              </p>
            </div>
          )}
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

  return <OverviewView />;
};

export default StressView;
/**
 * 📊 SessionProgress - Indicateur de progression de session
 *
 * Affichage visuel du temps écoulé et restant dans la session.
 */

const SessionProgress = ({ elapsed, total, currentPhase }) => {
  // Calculer le pourcentage de progression
  const progressPercentage = Math.min((elapsed / total) * 100, 100);

  // Formater le temps en MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const remaining = Math.max(total - elapsed, 0);

  return (
    <div className="mb-6 bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      {/* Phase actuelle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold" style={{ color: '#1F2937' }}>
            Progression de la séance
          </h3>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {currentPhase}
          </p>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: '#A78BFA' }}>
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-xs" style={{ color: '#6B7280' }}>
            Complété
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <div
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${progressPercentage}%`,
              background: 'linear-gradient(90deg, #A78BFA 0%, #93C5FD 50%, #6EE7B7 100%)'
            }}
          ></div>
        </div>
      </div>

      {/* Temps */}
      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="font-medium" style={{ color: '#1F2937' }}>
            Écoulé:
          </span>
          <span className="ml-1" style={{ color: '#A78BFA' }}>
            {formatTime(elapsed)}
          </span>
        </div>

        <div>
          <span className="font-medium" style={{ color: '#1F2937' }}>
            Restant:
          </span>
          <span className="ml-1" style={{ color: '#93C5FD' }}>
            {formatTime(remaining)}
          </span>
        </div>

        <div>
          <span className="font-medium" style={{ color: '#1F2937' }}>
            Total:
          </span>
          <span className="ml-1" style={{ color: '#6B7280' }}>
            {formatTime(total)}
          </span>
        </div>
      </div>

      {/* Étapes visuelles */}
      <div className="mt-4 flex justify-between items-center">
        {[
          { label: 'Début', progress: 0 },
          { label: 'Mi-temps', progress: 50 },
          { label: 'Fin', progress: 100 }
        ].map((milestone, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                progressPercentage >= milestone.progress
                  ? 'bg-gradient-to-r from-violet-400 to-blue-400'
                  : 'bg-gray-300'
              }`}
            ></div>
            <span
              className="text-xs mt-1"
              style={{
                color: progressPercentage >= milestone.progress ? '#A78BFA' : '#6B7280'
              }}
            >
              {milestone.label}
            </span>
          </div>
        ))}
      </div>

      {/* Message d'encouragement */}
      {progressPercentage > 0 && progressPercentage < 100 && (
        <div className="mt-4 text-center">
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {progressPercentage < 25
              ? "🌱 Excellent début ! Continue à ton rythme"
              : progressPercentage < 50
              ? "💪 Tu es bien lancée ! Tu y es presque"
              : progressPercentage < 75
              ? "⭐ Plus de la moitié ! Tu gères super bien"
              : "🎯 Dernière ligne droite ! Tu vas y arriver"
            }
          </p>
        </div>
      )}

      {progressPercentage >= 100 && (
        <div className="mt-4 text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
          <p className="text-sm font-medium" style={{ color: '#059669' }}>
            🎉 Bravo ! Tu as terminé la séance complète !
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionProgress;
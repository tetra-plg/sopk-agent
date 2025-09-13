/**
 * 🎮 SessionControls - Contrôles de session d'activité
 *
 * Boutons de contrôle pour pause/lecture, abandon et fin de session.
 */

const SessionControls = ({
  isRunning,
  isPaused,
  isCompleted,
  onToggle,
  onComplete,
  onAbandon
}) => {
  return (
    <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <div className="flex flex-col gap-4">
        {/* Contrôle principal */}
        {!isCompleted && (
          <div className="flex justify-center">
            <button
              onClick={onToggle}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: isRunning ? '#FB7185' : '#6EE7B7',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isRunning ? '#F87171' : '#34D399';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = isRunning ? '#FB7185' : '#6EE7B7';
              }}
            >
              {isRunning ? '⏸️' : '▶️'}
            </button>
          </div>
        )}

        {/* Label du contrôle principal */}
        {!isCompleted && (
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
              {isRunning ? 'Appuie pour faire une pause' : 'Appuie pour continuer'}
            </p>
          </div>
        )}

        {/* Actions secondaires */}
        <div className="flex gap-3 justify-center">
          {/* Bouton terminer prématurément */}
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
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
              ✓ Terminer maintenant
            </button>
          )}

          {/* Bouton abandonner */}
          <button
            onClick={() => onAbandon('Session abandonnée par l\'utilisateur')}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            style={{
              backgroundColor: 'rgba(251, 113, 133, 0.1)',
              color: '#FB7185',
              border: '1px solid #FB7185'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FB7185';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(251, 113, 133, 0.1)';
              e.target.style.color = '#FB7185';
            }}
          >
            ✕ Abandonner
          </button>
        </div>

        {/* Messages d'état */}
        <div className="text-center">
          {isCompleted && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
              <p className="text-sm font-medium" style={{ color: '#059669' }}>
                🎉 Session terminée ! Passe au feedback pour sauvegarder tes progrès.
              </p>
            </div>
          )}

          {isPaused && !isCompleted && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
              <p className="text-sm font-medium" style={{ color: '#D97706' }}>
                ⏸️ Session en pause • Reprends quand tu es prête
              </p>
            </div>
          )}

          {isRunning && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}>
              <p className="text-sm font-medium" style={{ color: '#7C3AED' }}>
                💪 Excellente progression ! Continue comme ça
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionControls;
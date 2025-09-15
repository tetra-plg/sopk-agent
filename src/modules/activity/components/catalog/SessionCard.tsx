/**
 * 🎴 SessionCard - Carte d'une session d'activité physique
 *
 * Composant pour afficher les informations d'une session dans le catalogue.
 */

const SessionCard = ({ session, isRecommended = false, onClick }) => {
  // Helper pour obtenir l'emoji de catégorie
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'yoga_doux': '🧘‍♀️',
      'etirements': '🤸‍♀️',
      'cardio_leger': '🚶‍♀️',
      'renforcement': '💪'
    };
    return emojiMap[category] || '🏃‍♀️';
  };

  // Helper pour obtenir le texte de catégorie
  const getCategoryText = (category) => {
    const textMap = {
      'yoga_doux': 'Yoga doux',
      'etirements': 'Étirements',
      'cardio_leger': 'Cardio léger',
      'renforcement': 'Renforcement'
    };
    return textMap[category] || 'Activité';
  };

  // Helper pour obtenir le niveau de difficulté
  const getDifficultyText = (level) => {
    const difficultyMap = {
      1: { text: 'Débutant', color: '#6EE7B7' },
      2: { text: 'Intermédiaire', color: '#93C5FD' },
      3: { text: 'Avancé', color: '#FB7185' }
    };
    return difficultyMap[level] || { text: 'Non défini', color: '#6B7280' };
  };

  // Helper pour obtenir les bénéfices principaux
  const getMainBenefits = (benefits = []) => {
    return benefits.slice(0, 2);
  };

  const difficulty = getDifficultyText(session.difficulty_level);

  return (
    <div
      className="bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: isRecommended ? '2px solid #A78BFA' : '1px solid #E5E7EB'
      }}
      onClick={onClick}
    >
      {/* Badge recommandé */}
      {isRecommended && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              color: '#A78BFA'
            }}
          >
            ⭐ Recommandée
          </span>
        </div>
      )}

      {/* En-tête avec thumbnail */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          {session.thumbnail_url ? (
            <img
              src={session.thumbnail_url}
              alt={session.title}
              className="w-12 h-12 rounded-lg object-cover"
              style={{ backgroundColor: '#F3F4F6' }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}
            >
              {getCategoryEmoji(session.category)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: '#1F2937' }}>
            {session.title}
          </h3>

          <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
            <span>⏱️ {session.duration_minutes} min</span>
            <span>•</span>
            <span style={{ color: difficulty.color }}>
              {difficulty.text}
            </span>
          </div>
        </div>
      </div>

      {/* Description courte */}
      {session.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: '#6B7280' }}>
          {session.description}
        </p>
      )}

      {/* Tags catégorie et bénéfices */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: 'rgba(147, 197, 253, 0.1)',
              color: '#93C5FD'
            }}
          >
            {getCategoryText(session.category)}
          </span>
        </div>

        {/* Bénéfices principaux */}
        {session.benefits && session.benefits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {getMainBenefits(session.benefits).map((benefit, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(110, 231, 183, 0.1)',
                  color: '#6EE7B7'
                }}
              >
                {benefit}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Équipement nécessaire */}
      {session.equipment_needed && session.equipment_needed.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
            <span>📦</span>
            <span>
              {session.equipment_needed.includes('aucun')
                ? 'Aucun équipement'
                : session.equipment_needed.join(', ')
              }
            </span>
          </div>
        </div>
      )}

      {/* Bouton d'action */}
      <button
        className="w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors"
        style={{
          backgroundColor: isRecommended ? '#A78BFA' : '#93C5FD',
          color: 'white'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = isRecommended ? '#9333EA' : '#60A5FA';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = isRecommended ? '#A78BFA' : '#93C5FD';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        ▶️ Commencer la séance
      </button>
    </div>
  );
};

export default SessionCard;
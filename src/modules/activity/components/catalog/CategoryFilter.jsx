/**
 * 🔍 CategoryFilter - Composant de filtres pour le catalogue
 *
 * Permet de filtrer les sessions par catégorie, difficulté et durée.
 */

const CategoryFilter = ({ filters, onFilterChange }) => {
  // Options des filtres
  const categoryOptions = [
    { value: 'all', label: '🏃‍♀️ Toutes' },
    { value: 'yoga_doux', label: '🧘‍♀️ Yoga doux' },
    { value: 'etirements', label: '🤸‍♀️ Étirements' },
    { value: 'cardio_leger', label: '🚶‍♀️ Cardio léger' },
    { value: 'renforcement', label: '💪 Renforcement' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'Tous niveaux' },
    { value: '1', label: '🟢 Débutant' },
    { value: '2', label: '🟡 Intermédiaire' },
    { value: '3', label: '🔴 Avancé' }
  ];

  const durationOptions = [
    { value: 'all', label: 'Toutes durées' },
    { value: '10', label: '≤ 10 min' },
    { value: '15', label: '≤ 15 min' },
    { value: '30', label: '≤ 30 min' }
  ];

  return (
    <div className="space-y-4">
      {/* Filtres principaux */}
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Filtre catégorie */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#6B7280' }}>
            Catégorie:
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="px-3 py-1 rounded-lg border text-sm transition-colors"
            style={{
              borderColor: '#D1D5DB',
              backgroundColor: 'white',
              color: '#1F2937'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#A78BFA';
              e.target.style.boxShadow = '0 0 0 3px rgba(167, 139, 250, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre difficulté */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#6B7280' }}>
            Niveau:
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => onFilterChange('difficulty', e.target.value)}
            className="px-3 py-1 rounded-lg border text-sm transition-colors"
            style={{
              borderColor: '#D1D5DB',
              backgroundColor: 'white',
              color: '#1F2937'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#93C5FD';
              e.target.style.boxShadow = '0 0 0 3px rgba(147, 197, 253, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre durée */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#6B7280' }}>
            Durée:
          </label>
          <select
            value={filters.maxDuration}
            onChange={(e) => onFilterChange('maxDuration', e.target.value)}
            className="px-3 py-1 rounded-lg border text-sm transition-colors"
            style={{
              borderColor: '#D1D5DB',
              backgroundColor: 'white',
              color: '#1F2937'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6EE7B7';
              e.target.style.boxShadow = '0 0 0 3px rgba(110, 231, 183, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicateur de filtres actifs */}
      {(filters.category !== 'all' || filters.difficulty !== 'all' || filters.maxDuration !== 'all') && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span style={{ color: '#6B7280' }}>Filtres actifs:</span>

          {filters.category !== 'all' && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                color: '#A78BFA'
              }}
            >
              {categoryOptions.find(opt => opt.value === filters.category)?.label}
            </span>
          )}

          {filters.difficulty !== 'all' && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'rgba(147, 197, 253, 0.1)',
                color: '#93C5FD'
              }}
            >
              {difficultyOptions.find(opt => opt.value === filters.difficulty)?.label}
            </span>
          )}

          {filters.maxDuration !== 'all' && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'rgba(110, 231, 183, 0.1)',
                color: '#6EE7B7'
              }}
            >
              {durationOptions.find(opt => opt.value === filters.maxDuration)?.label}
            </span>
          )}

          <button
            onClick={() => onFilterChange('category', 'all') || onFilterChange('difficulty', 'all') || onFilterChange('maxDuration', 'all')}
            className="text-xs px-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: '#6B7280' }}
            title="Réinitialiser les filtres"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
/**
 * 📊 Composant DifficultyIndicator
 *
 * Indicateur visuel pour le niveau de difficulté des recettes.
 */

const difficultyConfig = {
  very_easy: {
    label: 'Très facile',
    emoji: '🟢',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    dots: 1
  },
  easy: {
    label: 'Facile',
    emoji: '🟡',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    dots: 2
  },
  medium: {
    label: 'Moyen',
    emoji: '🟠',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    dots: 3
  },
  hard: {
    label: 'Difficile',
    emoji: '🔴',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    dots: 4
  }
};

const DifficultyIndicator = ({
  level,
  variant = 'emoji', // 'emoji', 'dots', 'text', 'full'
  size = 'sm',
  showLabel = false
}) => {
  const config = difficultyConfig[level] || difficultyConfig.easy;

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5'
  };

  if (variant === 'emoji') {
    return (
      <span className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}>
        <span role="img" aria-label={`Difficulté: ${config.label}`}>
          {config.emoji}
        </span>
        {showLabel && (
          <span className={`font-medium ${config.color}`}>
            {config.label}
          </span>
        )}
      </span>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-colors
              ${index < config.dots
                ? config.bgColor.replace('bg-', 'bg-') + ' ' + config.borderColor.replace('border-', 'border-')
                : 'bg-gray-200'
              }
            `}
          />
        ))}
        {showLabel && (
          <span className={`ml-2 font-medium ${config.color}`}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`inline-flex items-center font-medium ${config.color} ${sizeClasses[size]}`}>
        {config.label}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`
        inline-flex items-center gap-2 rounded-full border
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.borderColor}
        ${config.color}
      `}>
        <span role="img" aria-label={`Difficulté: ${config.label}`}>
          {config.emoji}
        </span>
        <span className="font-medium">
          {config.label}
        </span>
      </div>
    );
  }

  return null;
};

export default DifficultyIndicator;
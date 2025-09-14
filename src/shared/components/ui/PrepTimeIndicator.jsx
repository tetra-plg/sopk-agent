/**
 * ⏱️ Composant PrepTimeIndicator
 *
 * Indicateur visuel pour le temps de préparation des recettes.
 */

const timeRanges = {
  veryQuick: { max: 10, color: 'text-green-600', bgColor: 'bg-green-100', emoji: '⚡', label: 'Express' },
  quick: { max: 20, color: 'text-blue-600', bgColor: 'bg-blue-100', emoji: '⏱️', label: 'Rapide' },
  medium: { max: 45, color: 'text-yellow-600', bgColor: 'bg-yellow-100', emoji: '⏰', label: 'Moyen' },
  long: { max: 999, color: 'text-orange-600', bgColor: 'bg-orange-100', emoji: '🕐', label: 'Long' }
};

const getTimeCategory = (minutes) => {
  if (minutes <= 10) return timeRanges.veryQuick;
  if (minutes <= 20) return timeRanges.quick;
  if (minutes <= 45) return timeRanges.medium;
  return timeRanges.long;
};

const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${remainingMinutes}`;
};

const PrepTimeIndicator = ({
  minutes,
  variant = 'emoji', // 'emoji', 'text', 'full', 'badge'
  size = 'sm',
  showLabel = false
}) => {
  const timeCategory = getTimeCategory(minutes);
  const formattedTime = formatTime(minutes);

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5'
  };

  if (variant === 'emoji') {
    return (
      <span className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}>
        <span role="img" aria-label={`Temps de préparation: ${formattedTime}`}>
          {timeCategory.emoji}
        </span>
        <span className={`font-medium ${timeCategory.color}`}>
          {formattedTime}
        </span>
        {showLabel && (
          <span className={`text-gray-500`}>
            ({timeCategory.label})
          </span>
        )}
      </span>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`inline-flex items-center font-medium ${timeCategory.color} ${sizeClasses[size]}`}>
        {formattedTime}
        {showLabel && (
          <span className={`ml-1 text-gray-500`}>
            {timeCategory.label}
          </span>
        )}
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`
        inline-flex items-center gap-1 rounded-full border border-gray-200
        ${sizeClasses[size]}
        ${timeCategory.bgColor}
        ${timeCategory.color}
      `}>
        <span role="img" aria-label={`Temps: ${formattedTime}`}>
          {timeCategory.emoji}
        </span>
        <span className="font-medium">
          {formattedTime}
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`
        inline-flex items-center gap-2 rounded-lg border
        ${sizeClasses[size]}
        ${timeCategory.bgColor}
        border-gray-200
      `}>
        <span role="img" aria-label={`Temps: ${formattedTime}`}>
          {timeCategory.emoji}
        </span>
        <div className="flex flex-col">
          <span className={`font-semibold ${timeCategory.color}`}>
            {formattedTime}
          </span>
          {showLabel && (
            <span className="text-xs text-gray-500">
              {timeCategory.label}
            </span>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PrepTimeIndicator;
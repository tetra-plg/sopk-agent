/**
 * ⏳ LoadingSpinner - Composant de chargement réutilisable
 *
 * Indicateur de chargement avec différentes tailles et messages optionnels.
 */

const LoadingSpinner = ({ size = 'medium', message = '', color = '#A78BFA' }) => {
  // Tailles disponibles
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]}`}
        style={{ borderColor: `${color}30`, borderTopColor: color }}
      ></div>

      {message && (
        <p className={`${textSizes[size]} font-medium`} style={{ color }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
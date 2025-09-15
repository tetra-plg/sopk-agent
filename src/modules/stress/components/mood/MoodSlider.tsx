/**
 * 📊 MoodSlider - Curseur de notation d'humeur
 *
 * Composant pour noter l'humeur de 1 à 10 avec gradient coloré.
 * Design SOPK compliant avec couleurs émotionnelles.
 */

import { useState, useEffect } from 'react';

const MoodSlider = ({
  value = 5,
  onChange,
  disabled = false,
  showLabels = true,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Synchroniser avec la valeur externe
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue) => {
    const clampedValue = Math.max(1, Math.min(10, parseInt(newValue)));
    setLocalValue(clampedValue);
    onChange?.(clampedValue);
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Labels pour les différentes valeurs
  const getMoodLabel = (score) => {
    if (score <= 2) return 'Très difficile';
    if (score <= 4) return 'Difficile';
    if (score <= 6) return 'Correct';
    if (score <= 8) return 'Bien';
    return 'Excellent';
  };

  // Couleur basée sur le score
  const getMoodColor = (score) => {
    if (score <= 2) return '#F44336'; // Rouge
    if (score <= 4) return '#FF9800'; // Orange
    if (score <= 6) return '#9E9E9E'; // Gris
    if (score <= 8) return '#6EE7B7'; // Vert sauge SOPK
    return '#93C5FD'; // Bleu ciel SOPK
  };

  // Classes selon la taille
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          track: 'h-2',
          thumb: 'w-4 h-4',
          container: 'py-2',
          label: 'text-xs',
          value: 'text-sm'
        };
      case 'large':
        return {
          track: 'h-4',
          thumb: 'w-8 h-8',
          container: 'py-4',
          label: 'text-base',
          value: 'text-xl'
        };
      default:
        return {
          track: 'h-3',
          thumb: 'w-6 h-6',
          container: 'py-3',
          label: 'text-sm',
          value: 'text-lg'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const currentColor = getMoodColor(localValue);

  // Effet d'utilisation pour les événements globaux
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`mood-slider ${sizeClasses.container}`}>
      {/* Affichage de la valeur et du label */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span
            className={`font-bold ${sizeClasses.value}`}
            style={{ color: currentColor }}
          >
            {localValue}/10
          </span>
          {showLabels && (
            <span
              className={`ml-2 ${sizeClasses.label}`}
              style={{ color: '#6B7280' }}
            >
              {getMoodLabel(localValue)}
            </span>
          )}
        </div>
      </div>

      {/* Slider personnalisé */}
      <div className="relative">
        {/* Track avec gradient */}
        <div
          className={`
            w-full ${sizeClasses.track} rounded-full relative overflow-hidden
            ${disabled ? 'opacity-50' : ''}
          `}
          style={{
            background: `linear-gradient(to right,
              #F44336 0%,
              #FF9800 25%,
              #9E9E9E 50%,
              #6EE7B7 75%,
              #93C5FD 100%
            )`
          }}
        >
          {/* Overlay au hover/focus */}
          <div
            className={`
              absolute inset-0 rounded-full transition-opacity duration-200
              ${isDragging ? 'opacity-20' : 'opacity-0'}
            `}
            style={{ backgroundColor: '#1F2937' }}
          />
        </div>

        {/* Input range invisible pour l'accessibilité */}
        <input
          type="range"
          min="1"
          max="10"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onMouseDown={handleMouseDown}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ height: '100%' }}
          aria-label={`Note d'humeur: ${localValue} sur 10`}
        />

        {/* Thumb personnalisé */}
        <div
          className={`
            absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2
            ${sizeClasses.thumb} rounded-full border-3 border-white
            transition-all duration-200 shadow-lg
            ${!disabled ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
            ${isDragging ? 'scale-125 shadow-xl' : ''}
          `}
          style={{
            left: `${((localValue - 1) / 9) * 100}%`,
            backgroundColor: currentColor,
            boxShadow: isDragging
              ? `0 4px 16px ${currentColor}40`
              : `0 2px 8px ${currentColor}30`
          }}
        />

        {/* Marques pour chaque valeur (optionnel) */}
        {size !== 'small' && (
          <div className="flex justify-between mt-2 px-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((mark) => (
              <button
                key={mark}
                type="button"
                disabled={disabled}
                className={`
                  w-1 h-1 rounded-full transition-all duration-200
                  ${localValue === mark ? 'bg-gray-600 scale-150' : 'bg-gray-300'}
                  ${!disabled ? 'hover:bg-gray-500 hover:scale-125 cursor-pointer' : 'cursor-not-allowed'}
                `}
                onClick={() => handleChange(mark)}
                aria-label={`Sélectionner note ${mark}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Description contextuelle selon le score */}
      {showLabels && size !== 'small' && (
        <div className="mt-3 text-center">
          <p className="text-xs" style={{ color: '#6B7280' }}>
            {localValue <= 4
              ? "C'est normal d'avoir des hauts et des bas avec le SOPK 💜"
              : localValue <= 7
                ? "Tu es sur la bonne voie ! 🌱"
                : "Super journée ! Continue comme ça ✨"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodSlider;
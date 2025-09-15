/**
 * 😊 EmojiSelector - Sélecteur d'émotions
 *
 * Composant pour sélectionner l'émotion principale via emojis.
 * Design SOPK compliant avec colors lavande/bleu ciel.
 */

import { useState } from 'react';

const EMOTIONS = [
  {
    id: 'very_sad',
    emoji: '😢',
    label: 'Très triste',
    color: '#F44336' // Rouge
  },
  {
    id: 'sad',
    emoji: '😔',
    label: 'Triste',
    color: '#FF9800' // Orange
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutre',
    color: '#9E9E9E' // Gris
  },
  {
    id: 'happy',
    emoji: '🙂',
    label: 'Content',
    color: '#6EE7B7' // Vert sauge SOPK
  },
  {
    id: 'very_happy',
    emoji: '😄',
    label: 'Très content',
    color: '#93C5FD' // Bleu ciel SOPK
  }
];

const EmojiSelector = ({
  selected,
  onSelect,
  size = 'normal', // 'small', 'normal', 'large'
  disabled = false
}) => {
  const [hoveredEmotion, setHoveredEmotion] = useState(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'gap-2',
          button: 'w-8 h-8 text-lg',
          label: 'text-xs'
        };
      case 'large':
        return {
          container: 'gap-4',
          button: 'w-16 h-16 text-4xl',
          label: 'text-base'
        };
      default:
        return {
          container: 'gap-3',
          button: 'w-12 h-12 text-2xl',
          label: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const handleSelect = (emotionId) => {
    if (disabled) return;
    onSelect(emotionId);
  };

  return (
    <div className="emoji-selector">
      {/* Sélecteur d'emojis */}
      <div className={`flex justify-center items-center ${sizeClasses.container}`}>
        {EMOTIONS.map((emotion) => {
          const isSelected = selected === emotion.id;
          const isHovered = hoveredEmotion === emotion.id;

          return (
            <button
              key={emotion.id}
              type="button"
              disabled={disabled}
              className={`
                emoji-button ${sizeClasses.button}
                rounded-full transition-all duration-300 ease-out
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected ? 'selected' : ''}
                ${!disabled ? 'hover:scale-110 active:scale-95' : ''}
              `}
              style={{
                backgroundColor: isSelected
                  ? 'rgba(167, 139, 250, 0.2)' // Lavande SOPK
                  : isHovered && !disabled
                    ? 'rgba(167, 139, 250, 0.1)'
                    : 'transparent',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                border: isSelected
                  ? '2px solid #A78BFA' // Lavande SOPK
                  : '2px solid transparent',
                boxShadow: isSelected
                  ? '0 4px 12px rgba(167, 139, 250, 0.3)'
                  : 'none'
              }}
              onMouseEnter={() => !disabled && setHoveredEmotion(emotion.id)}
              onMouseLeave={() => setHoveredEmotion(null)}
              onClick={() => handleSelect(emotion.id)}
              aria-label={`Sélectionner émotion: ${emotion.label}`}
            >
              <span
                className="emoji-icon transition-transform duration-200"
                style={{
                  transform: isSelected ? 'rotate(-5deg)' : 'rotate(0deg)'
                }}
              >
                {emotion.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Label de l'émotion sélectionnée */}
      {selected && (
        <div className="text-center mt-3">
          <span
            className={`${sizeClasses.label} font-medium transition-opacity duration-200`}
            style={{ color: '#1F2937' }}
          >
            {EMOTIONS.find(e => e.id === selected)?.label}
          </span>
        </div>
      )}

      {/* Indicateur d'émotion au hover */}
      {hoveredEmotion && hoveredEmotion !== selected && (
        <div className="text-center mt-1">
          <span
            className={`${sizeClasses.label} text-gray-500 transition-opacity duration-200`}
          >
            {EMOTIONS.find(e => e.id === hoveredEmotion)?.label}
          </span>
        </div>
      )}
    </div>
  );
};

// Fonction utilitaire pour obtenir les données d'une émotion
export const getEmotionData = (emotionId) => {
  return EMOTIONS.find(e => e.id === emotionId) || null;
};

// Fonction utilitaire pour obtenir toutes les émotions
export const getAllEmotions = () => {
  return EMOTIONS;
};

export default EmojiSelector;
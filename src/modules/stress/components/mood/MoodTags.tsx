/**
 * 🏷️ MoodTags - Tags émotionnels rapides
 *
 * Composant pour sélectionner des tags d'émotions complémentaires.
 * Design SOPK compliant avec couleurs lavande/bleu ciel.
 */

import { useState } from 'react';

const EMOTION_TAGS = [
  {
    id: 'stressed',
    label: 'Stressée',
    emoji: '😰',
    category: 'negative',
    color: '#FB7185' // Corail SOPK
  },
  {
    id: 'tired',
    label: 'Fatiguée',
    emoji: '😴',
    category: 'negative',
    color: '#9E9E9E'
  },
  {
    id: 'anxious',
    label: 'Anxieuse',
    emoji: '😟',
    category: 'negative',
    color: '#FF9800'
  },
  {
    id: 'frustrated',
    label: 'Frustrée',
    emoji: '😤',
    category: 'negative',
    color: '#F44336'
  },
  {
    id: 'calm',
    label: 'Calme',
    emoji: '😌',
    category: 'positive',
    color: '#93C5FD' // Bleu ciel SOPK
  },
  {
    id: 'energetic',
    label: 'Énergique',
    emoji: '✨',
    category: 'positive',
    color: '#6EE7B7' // Vert sauge SOPK
  },
  {
    id: 'hopeful',
    label: 'Optimiste',
    emoji: '🌱',
    category: 'positive',
    color: '#6EE7B7'
  },
  {
    id: 'grateful',
    label: 'Reconnaissante',
    emoji: '🙏',
    category: 'positive',
    color: '#A78BFA' // Lavande SOPK
  },
  {
    id: 'overwhelmed',
    label: 'Débordée',
    emoji: '🤯',
    category: 'negative',
    color: '#FB7185'
  },
  {
    id: 'peaceful',
    label: 'Sereine',
    emoji: '🕊️',
    category: 'positive',
    color: '#93C5FD'
  }
];

const MoodTags = ({
  selected = [],
  onSelectionChange,
  maxSelection = 3,
  disabled = false,
  size = 'normal', // 'small', 'normal', 'large'
  showCategories = false
}) => {
  const [hoveredTag, setHoveredTag] = useState(null);

  const handleTagToggle = (tagId) => {
    if (disabled) return;

    const newSelection = selected.includes(tagId)
      ? selected.filter(id => id !== tagId) // Retirer le tag
      : selected.length < maxSelection
        ? [...selected, tagId] // Ajouter le tag si pas de limite atteinte
        : selected; // Ne rien faire si limite atteinte

    onSelectionChange?.(newSelection);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          tag: 'px-2 py-1 text-xs',
          emoji: 'text-sm mr-1',
          container: 'gap-1'
        };
      case 'large':
        return {
          tag: 'px-4 py-3 text-base',
          emoji: 'text-lg mr-2',
          container: 'gap-3'
        };
      default:
        return {
          tag: 'px-3 py-2 text-sm',
          emoji: 'text-base mr-1.5',
          container: 'gap-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Grouper par catégorie si demandé
  const groupedTags = showCategories
    ? {
        positive: EMOTION_TAGS.filter(tag => tag.category === 'positive'),
        negative: EMOTION_TAGS.filter(tag => tag.category === 'negative')
      }
    : { all: EMOTION_TAGS };

  const renderTag = (tag) => {
    const isSelected = selected.includes(tag.id);
    const isHovered = hoveredTag === tag.id;
    const isDisabled = disabled || (!isSelected && selected.length >= maxSelection);

    return (
      <button
        key={tag.id}
        type="button"
        disabled={isDisabled}
        className={`
          mood-tag ${sizeClasses.tag}
          rounded-full transition-all duration-200 font-medium
          flex items-center justify-center
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isSelected ? 'selected' : ''}
          ${!isDisabled ? 'hover:scale-105 active:scale-95' : ''}
        `}
        style={{
          backgroundColor: isSelected
            ? tag.color
            : isHovered && !isDisabled
              ? `${tag.color}20`
              : '#F9FAFB', // Fond clair SOPK
          color: isSelected
            ? '#FFFFFF'
            : isHovered && !isDisabled
              ? tag.color
              : '#1F2937', // Texte principal SOPK
          border: isSelected
            ? `2px solid ${tag.color}`
            : isHovered && !isDisabled
              ? `2px solid ${tag.color}40`
              : '2px solid #E5E7EB',
          boxShadow: isSelected
            ? `0 2px 8px ${tag.color}30`
            : 'none'
        }}
        onMouseEnter={() => !isDisabled && setHoveredTag(tag.id)}
        onMouseLeave={() => setHoveredTag(null)}
        onClick={() => handleTagToggle(tag.id)}
        aria-label={`${isSelected ? 'Désélectionner' : 'Sélectionner'} tag: ${tag.label}`}
      >
        <span className={sizeClasses.emoji}>{tag.emoji}</span>
        <span>{tag.label}</span>
      </button>
    );
  };

  return (
    <div className="mood-tags">
      {/* En-tête avec compteur */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium" style={{ color: '#1F2937' }}>
          Comment te sens-tu aussi ? (optionnel)
        </h4>
        <span className="text-xs" style={{ color: '#6B7280' }}>
          {selected.length}/{maxSelection}
        </span>
      </div>

      {/* Tags groupés */}
      {Object.entries(groupedTags).map(([category, tags]) => (
        <div key={category} className="mb-4 last:mb-0">
          {/* Titre de catégorie */}
          {showCategories && category !== 'all' && (
            <h5
              className="text-xs font-medium mb-2 uppercase tracking-wide"
              style={{ color: '#6B7280' }}
            >
              {category === 'positive' ? '✨ Émotions positives' : '💭 Défis émotionnels'}
            </h5>
          )}

          {/* Liste des tags */}
          <div className={`flex flex-wrap ${sizeClasses.container}`}>
            {tags.map(renderTag)}
          </div>
        </div>
      ))}

      {/* Message d'aide */}
      {selected.length === maxSelection && (
        <div className="mt-3 text-center">
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Limite atteinte. Désélectionne un tag pour en choisir un autre.
          </p>
        </div>
      )}

      {/* Encouragement contextuel */}
      {selected.length > 0 && (
        <div className="mt-3 text-center">
          <p className="text-xs" style={{ color: '#A78BFA' }}>
            {selected.includes('stressed') || selected.includes('anxious')
              ? "Prendre conscience de tes émotions est déjà un grand pas 💜"
              : selected.some(tag => ['calm', 'peaceful', 'hopeful', 'grateful'].includes(tag))
                ? "C'est formidable de ressentir ces émotions positives ✨"
                : "Merci de partager tes ressentis avec authenticité 🌱"
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Fonction utilitaire pour obtenir les données d'un tag
export const getTagData = (tagId) => {
  return EMOTION_TAGS.find(tag => tag.id === tagId) || null;
};

// Fonction utilitaire pour obtenir tous les tags
export const getAllTags = () => {
  return EMOTION_TAGS;
};

// Fonction utilitaire pour obtenir les tags par catégorie
export const getTagsByCategory = (category) => {
  return EMOTION_TAGS.filter(tag => tag.category === category);
};

export default MoodTags;
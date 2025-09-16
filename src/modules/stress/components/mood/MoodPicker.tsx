/**
 * 😊 MoodPicker - Composant principal de saisie d'humeur
 *
 * Combine EmojiSelector, MoodSlider et MoodTags pour une interface complète.
 * Design SOPK compliant avec couleurs lavande/bleu ciel.
 */

import { useState, useEffect } from 'react';
import EmojiSelector from './EmojiSelector';
import MoodSlider from './MoodSlider';
import MoodTags from './MoodTags';

const MoodPicker = ({
  value,
  onChange,
  compact = false,
  disabled = false,
  autoSave = true,
  showTitle = true
}) => {
  // Utiliser directement la valeur du parent sans état local conflictuel
  const moodData = value || {
    mood_emoji: '',
    mood_score: 5,
    tags: [],
    notes: ''
  };

  const [isExpanded, setIsExpanded] = useState(!compact);

  const updateMoodData = (field, newValue) => {
    // Appeler onChange directement
    if (onChange) {
      onChange(field, newValue);
    }
  };

  const handleEmotionSelect = (emotion) => {
    updateMoodData('mood_emoji', emotion);

    // Si en mode compact et pas encore étendu, étendre automatiquement
    if (compact && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleScoreChange = (score) => {
    updateMoodData('mood_score', score);
  };

  const handleTagsChange = (tags) => {
    updateMoodData('tags', tags);
  };

  const handleNotesChange = (notes) => {
    updateMoodData('notes', notes);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Version compacte pour intégration dans le journal
  if (compact && !isExpanded) {
    return (
      <div className="mood-picker-compact bg-white rounded-xl p-4" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        {showTitle && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: '#1F2937' }}>
              😊 Mon humeur
            </h3>
            {moodData.mood_emoji && (
              <button
                type="button"
                onClick={handleToggleExpand}
                className="text-xs px-2 py-1 rounded-full transition-colors"
                style={{
                  backgroundColor: 'rgba(167, 139, 250, 0.1)',
                  color: '#A78BFA'
                }}
              >
                Détailler
              </button>
            )}
          </div>
        )}

        <EmojiSelector
          selected={moodData.mood_emoji}
          onSelect={handleEmotionSelect}
          size="small"
          disabled={disabled}
        />

        {moodData.mood_emoji && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm" style={{ color: '#6B7280' }}>
              Note: {moodData.mood_score}/10
            </span>
            <button
              type="button"
              onClick={handleToggleExpand}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Modifier →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Version complète
  return (
    <div className="mood-picker bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
      {/* En-tête */}
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
            😊 Comment te sens-tu aujourd'hui ?
          </h3>
          {compact && (
            <button
              type="button"
              onClick={handleToggleExpand}
              className="text-sm px-3 py-1 rounded-full transition-colors"
              style={{
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                color: '#A78BFA'
              }}
            >
              Réduire
            </button>
          )}
        </div>
      )}

      {/* Sélection d'émotion principale */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>
          Choisis ton émotion principale :
        </h4>
        <EmojiSelector
          selected={moodData.mood_emoji}
          onSelect={handleEmotionSelect}
          size="normal"
          disabled={disabled}
        />
      </div>

      {/* Note d'humeur (visible si émotion sélectionnée) */}
      {moodData.mood_emoji && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>
            Note ton humeur :
          </h4>
          <MoodSlider
            value={moodData.mood_score}
            onChange={handleScoreChange}
            disabled={disabled}
            size="normal"
            showLabels={true}
          />
        </div>
      )}

      {/* Tags émotionnels (optionnel) */}
      {moodData.mood_emoji && (
        <div className="mb-6">
          <MoodTags
            selected={moodData.tags}
            onSelectionChange={handleTagsChange}
            disabled={disabled}
            size="normal"
            maxSelection={3}
          />
        </div>
      )}

      {/* Notes optionnelles */}
      {moodData.mood_emoji && moodData.mood_score && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3" style={{ color: '#1F2937' }}>
            Une note ? (optionnel)
          </h4>
          <textarea
            value={moodData.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={disabled}
            placeholder="Décris ce que tu ressens aujourd'hui..."
            className="w-full p-3 rounded-lg border border-gray-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#F9FAFB',
              color: '#1F2937',
              minHeight: '80px'
            }}
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: '#6B7280' }}>
              Partagée uniquement avec toi
            </span>
            <span className="text-xs" style={{ color: '#6B7280' }}>
              {(moodData.notes || '').length}/300
            </span>
          </div>
        </div>
      )}

      {/* Message d'encouragement */}
      {moodData.mood_emoji && (
        <div className="text-center py-3">
          <div
            className="inline-block px-4 py-2 rounded-full text-sm"
            style={{
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              color: '#A78BFA'
            }}
          >
            ✅ Humeur enregistrée
          </div>
        </div>
      )}

      {/* Message d'aide pour première utilisation */}
      {!moodData.mood_emoji && (
        <div className="text-center py-4">
          <p className="text-sm" style={{ color: '#6B7280' }}>
            💡 <span className="font-medium">Prendre quelques secondes</span> pour identifier tes émotions
            t'aide à mieux comprendre tes cycles SOPK.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodPicker;
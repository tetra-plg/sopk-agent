/**
 * 🔍 Validation des Données de Symptômes
 *
 * Validation et sanitisation des données saisies dans le journal quotidien.
 */

/**
 * Valide les données d'une entrée quotidienne
 * @param {object} data - Données à valider
 * @returns {object} Données validées et sanitisées
 */
export function validateDailySymptoms(data) {
  const validated = {};

  // Validation period_flow (0-4)
  if (data.period_flow !== undefined && data.period_flow !== null) {
    const periodFlow = parseInt(data.period_flow);
    if (periodFlow >= 0 && periodFlow <= 4) {
      validated.period_flow = periodFlow;
    }
  }

  // Validation fatigue_level (0-5)
  if (data.fatigue_level !== undefined && data.fatigue_level !== null) {
    const fatigueLevel = parseInt(data.fatigue_level);
    if (fatigueLevel >= 0 && fatigueLevel <= 5) {
      validated.fatigue_level = fatigueLevel;
    }
  }

  // Validation pain_level (0-5)
  if (data.pain_level !== undefined && data.pain_level !== null) {
    const painLevel = parseInt(data.pain_level);
    if (painLevel >= 0 && painLevel <= 5) {
      validated.pain_level = painLevel;
    }
  }

  // Validation mood_score (1-10)
  if (data.mood_score !== undefined && data.mood_score !== null) {
    const moodScore = parseInt(data.mood_score);
    if (moodScore >= 1 && moodScore <= 10) {
      validated.mood_score = moodScore;
    }
  }

  // Validation mood_emoji (string)
  if (data.mood_emoji && typeof data.mood_emoji === 'string') {
    validated.mood_emoji = data.mood_emoji.slice(0, 10); // Limite de 10 caractères
  }

  // Validation notes (string)
  if (data.notes !== undefined) {
    validated.notes = typeof data.notes === 'string'
      ? data.notes.slice(0, 1000) // Limite de 1000 caractères
      : '';
  }

  return validated;
}

/**
 * Vérifie si une date est valide pour la saisie
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {boolean} True si la date est valide
 */
export function isValidEntryDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const maxPastDate = new Date();
  maxPastDate.setDate(today.getDate() - 365); // Pas plus d'un an dans le passé

  return date <= today && date >= maxPastDate;
}

/**
 * Formate une date en string YYYY-MM-DD
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
export function formatDateForAPI(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Labels pour les différents niveaux
 */
export const PERIOD_LABELS = {
  0: 'Aucune',
  1: 'Légères',
  2: 'Normales',
  3: 'Abondantes',
  4: 'Très abondantes'
};

export const SYMPTOM_LABELS = {
  0: 'Aucune',
  1: 'Très légère',
  2: 'Légère',
  3: 'Modérée',
  4: 'Forte',
  5: 'Très forte'
};

export const MOOD_EMOJIS = {
  1: '😢', 2: '😟',
  3: '😐', 4: '😕',
  5: '🙂', 6: '😊',
  7: '😊', 8: '😄',
  9: '😄', 10: '🥰'
};

/**
 * Obtient le label correspondant à un niveau
 * @param {string} type - Type de symptôme (period, fatigue, pain)
 * @param {number} value - Valeur du niveau
 * @returns {string} Label correspondant
 */
export function getLabelForValue(type, value) {
  if (value === null || value === undefined) return '';

  switch (type) {
    case 'period':
      return PERIOD_LABELS[value] || '';
    case 'fatigue':
    case 'pain':
      return SYMPTOM_LABELS[value] || '';
    default:
      return '';
  }
}

/**
 * Obtient l'emoji correspondant au score d'humeur
 * @param {number} score - Score d'humeur (1-10)
 * @returns {string} Emoji correspondant
 */
export function getEmojiForMood(score) {
  return MOOD_EMOJIS[score] || '😊';
}
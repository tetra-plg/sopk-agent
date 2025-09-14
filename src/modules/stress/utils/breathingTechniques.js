/**
 * 🫁 SOPK Companion - Utilitaires pour les Techniques de Respiration
 *
 * Fonctions utilitaires pour le calcul et la gestion des sessions de respiration.
 * Les techniques sont maintenant stockées dans la base de données.
 */

/**
 * Calcule la durée totale d'un cycle de respiration
 * @param {Array} pattern - Pattern de respiration [inspire, pause, expire, pause]
 * @returns {number} Durée d'un cycle en secondes
 */
export const getCycleDuration = (pattern) => {
  return pattern.reduce((total, duration) => total + duration, 0);
};

/**
 * Calcule le nombre total de cycles pour une technique
 * @param {object} technique - Objet technique (peut avoir duration ou duration_seconds)
 * @returns {number} Nombre de cycles
 */
export const getTotalCycles = (technique) => {
  const cycleDuration = getCycleDuration(technique.pattern);
  const totalDuration = technique.duration_seconds || technique.duration || 0;
  return Math.floor(totalDuration / cycleDuration);
};

/**
 * Obtient la phase actuelle basée sur le temps écoulé dans le cycle
 * @param {Array} pattern - Pattern de respiration
 * @param {number} timeInCycle - Temps écoulé dans le cycle actuel
 * @returns {object} { phase, timeInPhase, phaseDuration }
 */
export const getCurrentPhase = (pattern, timeInCycle) => {
  const phases = ['inhale', 'hold', 'exhale', 'pause'];
  let accumulatedTime = 0;

  for (let i = 0; i < pattern.length; i++) {
    const phaseDuration = pattern[i];

    // Pour les phases avec durée 0, on passe directement à la suivante
    if (phaseDuration === 0) {
      continue;
    }

    if (timeInCycle <= accumulatedTime + phaseDuration) {
      return {
        phase: phases[i],
        timeInPhase: timeInCycle - accumulatedTime,
        phaseDuration: phaseDuration,
        progress: Math.min(1, (timeInCycle - accumulatedTime) / phaseDuration)
      };
    }
    accumulatedTime += phaseDuration;
  }

  // Fallback - retourner la première phase valide (cycle complet)
  let firstValidPhaseIndex = 0;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] > 0) {
      firstValidPhaseIndex = i;
      break;
    }
  }

  return {
    phase: phases[firstValidPhaseIndex],
    timeInPhase: 0,
    phaseDuration: pattern[firstValidPhaseIndex],
    progress: 0
  };
};

/**
 * Obtient les instructions textuelles pour chaque phase
 */
export const phaseInstructions = {
  inhale: {
    text: 'Inspire profondément',
    shortText: 'Inspire...',
    emoji: '⬆️',
    color: '#81C784'
  },
  hold: {
    text: 'Retiens ta respiration',
    shortText: 'Retiens...',
    emoji: '⏸️',
    color: '#FFB74D'
  },
  exhale: {
    text: 'Expire lentement',
    shortText: 'Expire...',
    emoji: '⬇️',
    color: '#F48FB1'
  },
  pause: {
    text: 'Petite pause',
    shortText: 'Pause...',
    emoji: '⏱️',
    color: '#4FC3F7'
  }
};

/**
 * Formate le temps en minutes:secondes
 * @param {number} seconds - Secondes à formater
 * @returns {string} Temps formaté
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Valide les données de session avant sauvegarde
 * @param {object} sessionData - Données de la session
 * @returns {object} { isValid, errors }
 */
export const validateSessionData = (sessionData) => {
  const errors = [];

  if (!sessionData.technique || typeof sessionData.technique !== 'string') {
    errors.push('Technique invalide');
  }

  if (typeof sessionData.duration_seconds !== 'number' || sessionData.duration_seconds <= 0) {
    errors.push('Durée invalide');
  }

  if (sessionData.stress_before && (sessionData.stress_before < 1 || sessionData.stress_before > 10)) {
    errors.push('Niveau de stress avant invalide (1-10)');
  }

  if (sessionData.stress_after && (sessionData.stress_after < 1 || sessionData.stress_after > 10)) {
    errors.push('Niveau de stress après invalide (1-10)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
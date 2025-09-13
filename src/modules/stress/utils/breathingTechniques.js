/**
 * 🫁 SOPK Companion - Configuration des Techniques de Respiration
 *
 * Techniques optimisées pour la gestion du stress et de l'anxiété
 * liés au SOPK avec validation scientifique.
 */

export const techniques = {
  coherence: {
    id: 'coherence',
    name: 'Cohérence cardiaque',
    duration: 300, // 5 minutes
    pattern: [5, 0, 5, 0], // inspire, pause, expire, pause (en secondes)
    description: 'Équilibre ton système nerveux',
    benefits: ['Réduit le cortisol', 'Équilibre hormonal', 'Apaise le stress'],
    icon: '🔵',
    color: '#4FC3F7',
    difficulty: 'beginner',
    sopkBenefits: 'Idéal pour réguler les hormones et réduire l\'inflammation'
  },

  box: {
    id: 'box',
    name: 'Respiration 4-4-4-4',
    duration: 180, // 3 minutes
    pattern: [4, 4, 4, 4], // carré parfait
    description: 'Focus et concentration',
    benefits: ['Améliore la concentration', 'Calme l\'esprit', 'Réduit l\'anxiété'],
    icon: '⏹️',
    color: '#81C784',
    difficulty: 'intermediate',
    sopkBenefits: 'Parfait pour gérer l\'anxiété liée aux symptômes'
  },

  quick: {
    id: 'quick',
    name: 'Technique rapide',
    duration: 120, // 2 minutes
    pattern: [4, 2, 6, 1], // 4-7-8 adapté et raccourci
    description: 'Anti-stress express',
    benefits: ['Soulagement immédiat', 'Détente rapide', 'Calme instantané'],
    icon: '⚡',
    color: '#FFB74D',
    difficulty: 'beginner',
    sopkBenefits: 'Solution rapide pour les pics de stress hormonal'
  }
};

/**
 * Obtient une technique par son ID
 * @param {string} techniqueId - L'ID de la technique
 * @returns {object|null} La technique ou null si introuvable
 */
export const getTechnique = (techniqueId) => {
  return techniques[techniqueId] || null;
};

/**
 * Obtient toutes les techniques triées par difficulté
 * @returns {Array} Liste des techniques
 */
export const getAllTechniques = () => {
  return Object.values(techniques).sort((a, b) => {
    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
};

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
 * @param {object} technique - Objet technique
 * @returns {number} Nombre de cycles
 */
export const getTotalCycles = (technique) => {
  const cycleDuration = getCycleDuration(technique.pattern);
  return Math.floor(technique.duration / cycleDuration);
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

  if (!sessionData.technique || !techniques[sessionData.technique]) {
    errors.push('Technique invalide');
  }

  if (typeof sessionData.duration_seconds !== 'number' || sessionData.duration_seconds < 0) {
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
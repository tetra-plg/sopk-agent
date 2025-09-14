/**
 * 📅 Utilitaires de Dates
 *
 * Fonctions utilitaires pour la manipulation et formatage des dates.
 */

/**
 * Formate une date au format français lisible
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée (ex: "Mer. 13 Sept.")
 */
export function formatFrenchDate(date) {
  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  };
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 * @param {Date} date - Date à formater
 * @returns {string} Date au format API
 */
export function formatDateForAPI(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Parse une date depuis le format API vers Date
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {Date} Object Date
 */
export function parseDateFromAPI(dateString) {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Vérifie si une date est aujourd'hui
 * @param {Date} date - Date à vérifier
 * @returns {boolean} True si c'est aujourd'hui
 */
export function isToday(date) {
  const today = new Date();
  return formatDateForAPI(date) === formatDateForAPI(today);
}

/**
 * Ajoute des jours à une date
 * @param {Date} date - Date de base
 * @param {number} days - Nombre de jours à ajouter
 * @returns {Date} Nouvelle date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Soustrait des jours à une date
 * @param {Date} date - Date de base
 * @param {number} days - Nombre de jours à soustraire
 * @returns {Date} Nouvelle date
 */
export function subDays(date, days) {
  return addDays(date, -days);
}

/**
 * Obtient le début de la journée
 * @param {Date} date - Date
 * @returns {Date} Début de journée (00:00:00)
 */
export function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Vérifie si une date peut être éditée (pas dans le futur, pas trop ancienne)
 * @param {Date} date - Date à vérifier
 * @returns {boolean} True si éditable
 */
export function isEditableDate(date) {
  const today = new Date();
  const maxPastDate = subDays(today, 30); // 30 jours dans le passé max

  return date <= today && date >= maxPastDate;
}

/**
 * Obtient les 7 dernières dates (incluant aujourd'hui)
 * @returns {Date[]} Array des 7 dernières dates
 */
export function getLast7Days() {
  const dates = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    dates.push(subDays(today, i));
  }

  return dates;
}

/**
 * Compare deux dates (sans l'heure)
 * @param {Date} date1 - Première date
 * @param {Date} date2 - Deuxième date
 * @returns {number} -1, 0, ou 1
 */
export function compareDates(date1, date2) {
  const d1 = formatDateForAPI(date1);
  const d2 = formatDateForAPI(date2);

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}
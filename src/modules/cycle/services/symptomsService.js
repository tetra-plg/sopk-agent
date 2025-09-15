/**
 * 📊 SOPK Companion - Service des Symptômes Quotidiens
 *
 * Service principal pour gérer les données du journal quotidien :
 * règles, fatigue, douleurs, humeur et notes.
 */

import { getSupabaseClient } from '../../../shared/services/supabaseDev';

/**
 * Service de gestion des symptômes quotidiens
 */
export const symptomsService = {
  /**
   * Sauvegarde ou met à jour les données d'une journée (UPSERT)
   * @param {string} userId - ID de l'utilisateur
   * @param {string} date - Date au format YYYY-MM-DD
   * @param {object} symptomsData - Données des symptômes
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  async saveDailyEntry(userId, date, symptomsData) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('daily_symptoms')
        .upsert({
          user_id: userId,
          date,
          ...symptomsData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {

      return { data: null, error };
    }
  },

  /**
   * Récupère les données d'une date spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {string} date - Date au format YYYY-MM-DD
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  async getDailyEntry(userId, date) {
    try {
      const client = getSupabaseClient();

      // Utiliser une requête normale au lieu de .single() pour éviter l'erreur 406
      const { data, error } = await client
        .from('daily_symptoms')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .limit(1);

      if (error) {

        throw error;
      }

      // Si aucune donnée trouvée (tableau vide), retourner des valeurs par défaut
      if (!data || data.length === 0) {
        return {
          data: {
            period_flow: null,
            fatigue_level: null,
            pain_level: null,
            mood_score: null,
            mood_emoji: null,
            notes: ''
          },
          error: null
        };
      }

      // Retourner la première (et seule) entrée trouvée
      return { data: data[0], error: null };

    } catch (error) {

      return {
        data: {
          period_flow: null,
          fatigue_level: null,
          pain_level: null,
          mood_score: null,
          mood_emoji: null,
          notes: ''
        },
        error: null
      };
    }
  },

  /**
   * Récupère les données des 7 derniers jours
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<{error: Error|null, data: Array|null}>}
   */
  async getRecentEntries(userId, days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const client = getSupabaseClient();
      const { data, error } = await client
        .from('daily_symptoms')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {

      return { data: null, error };
    }
  },

  /**
   * Récupère les statistiques du mois en cours
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  async getMonthlyStats(userId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const client = getSupabaseClient();
      const { data: entries, error } = await client
        .from('daily_symptoms')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      // Calcul des statistiques
      const stats = {
        totalEntries: entries.length,
        averageMood: calculateAverageMood(entries),
        averageFatigue: calculateAverageFatigue(entries),
        averagePain: calculateAveragePain(entries),
        periodDays: countPeriodDays(entries),
        entriesThisMonth: entries
      };

      return { data: stats, error: null };
    } catch (error) {

      return { data: null, error };
    }
  },

  /**
   * Supprime une entrée spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {string} date - Date au format YYYY-MM-DD
   * @returns {Promise<{error: Error|null}>}
   */
  async deleteEntry(userId, date) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('daily_symptoms')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (error) throw error;

      return { error: null };
    } catch (error) {

      return { error };
    }
  }
};

// =====================================================
// FONCTIONS UTILITAIRES POUR LES STATISTIQUES
// =====================================================

/**
 * Calcule la moyenne des scores d'humeur
 */
function calculateAverageMood(entries) {
  const moodEntries = entries.filter(e => e.mood_score !== null);
  if (moodEntries.length === 0) return 0;

  const sum = moodEntries.reduce((acc, entry) => acc + entry.mood_score, 0);
  return Math.round((sum / moodEntries.length) * 10) / 10;
}

/**
 * Calcule la moyenne du niveau de fatigue
 */
function calculateAverageFatigue(entries) {
  const fatigueEntries = entries.filter(e => e.fatigue_level !== null);
  if (fatigueEntries.length === 0) return 0;

  const sum = fatigueEntries.reduce((acc, entry) => acc + entry.fatigue_level, 0);
  return Math.round((sum / fatigueEntries.length) * 10) / 10;
}

/**
 * Calcule la moyenne du niveau de douleur
 */
function calculateAveragePain(entries) {
  const painEntries = entries.filter(e => e.pain_level !== null);
  if (painEntries.length === 0) return 0;

  const sum = painEntries.reduce((acc, entry) => acc + entry.pain_level, 0);
  return Math.round((sum / painEntries.length) * 10) / 10;
}

/**
 * Compte les jours avec des règles
 */
function countPeriodDays(entries) {
  return entries.filter(e => e.period_flow && e.period_flow > 0).length;
}